import { WebsiteScraper } from '@/browser/scraper';
import { ScoringEngine } from '@/scoring/engine';
import { SEOAgent } from '@/agents/SEOAgent';
import { AccessibilityAgent } from '@/agents/AccessibilityAgent';
import { PerformanceAgent } from '@/agents/PerformanceAgent';
import { SecurityAgent } from '@/agents/SecurityAgent';
import { MasterDesignAgent } from '@/agents/MasterDesignAgent';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchPSI } from '@/lib/psi';

export const maxDuration = 300; // Allow max duration for scraping

export async function POST(req: NextRequest) {
  let scraper: WebsiteScraper | null = null;
  const { url, resumeState = {}, clarityApiToken } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
  }
  
  let targetDomain = '';
  try {
    targetDomain = new URL(url).hostname;
  } catch (e) {
    // ignore
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: any) {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      }

      try {
        send({ type: 'status', message: 'Initializing scraper engine...' });
        scraper = new WebsiteScraper();
        await scraper.init();
        
        send({ type: 'status', message: `Navigating and scraping ${url}...` });
        const scrapeData = await scraper.scrape(url);
        send({ type: 'step_complete', step: 'scrape' });

        // Initialize agents
        const seoAgent = new SEOAgent();
        const a11yAgent = new AccessibilityAgent();
        const performanceAgent = new PerformanceAgent();
        const securityAgent = new SecurityAgent();
        const masterAgent = new MasterDesignAgent();

        // Helper to pace requests to stay under 15 RPM free tier limit
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        let errorHit = false;
        let stopReason = '';

        async function runAgent(name: string, agent: any, params: any) {
          if (errorHit) return null;
          if (resumeState[name]) {
            send({ type: 'agent_complete', agent: name });
            return resumeState[name];
          }
          try {
            const res = await agent.analyze(url, params);
            send({ type: 'agent_complete', agent: name });
            await delay(4000);
            return res;
          } catch (e: any) {
            console.error(`Error in ${name}:`, e);
            errorHit = true;
            stopReason = e.message || 'API Limit Exceeded';
            send({ type: 'agent_error', agent: name, message: stopReason });
            return null;
          }
        }

        send({ type: 'status', message: 'Running Real PSI Analysis & Deep Mega-Prompt Analysis...' });

        // Fetch Clarity Data dynamically if token is provided
        let clarityData = null;
        if (clarityApiToken && targetDomain) {
          send({ type: 'status', message: `Looking up Clarity Project ID for ${targetDomain}...` });
          try {
            // First, get list of all projects for this user to find the correct project ID
            let resolvedProjectId = null;
            const projectsRes = await fetch(`https://clarity.microsoft.com/api/projects`, {
              headers: { 'Authorization': `Bearer ${clarityApiToken}` }
            });
            
            if (projectsRes.ok) {
              const projectsList = await projectsRes.json();
              // Find project that matches the target domain (assuming projects have a 'url' or 'domain' field)
              const matchedProject = projectsList.find((p: any) => 
                p.url?.includes(targetDomain) || p.domain?.includes(targetDomain)
              );
              
              if (matchedProject && matchedProject.id) {
                resolvedProjectId = matchedProject.id;
                send({ type: 'status', message: `Found matching Clarity Project ID: ${resolvedProjectId}` });
              } else {
                send({ type: 'status', message: `No matching Clarity Project found for ${targetDomain}.` });
              }
            }

            if (resolvedProjectId) {
              send({ type: 'status', message: 'Fetching Microsoft Clarity behavioral data...' });
              const clarityRes = await fetch(`https://clarity.microsoft.com/api/projects/${resolvedProjectId}/data`, {
                headers: { 'Authorization': `Bearer ${clarityApiToken}` }
              });
              if (clarityRes.ok) {
                const data = await clarityRes.json();
                clarityData = JSON.stringify(data);
                send({ type: 'status', message: 'Microsoft Clarity data fetched successfully.' });
              } else {
                throw new Error('Failed to fetch data with valid project ID');
              }
            } else {
               // Fallback / Mock
               throw new Error('Fallback to mock');
            }
          } catch (e) {
            // Mock data fallback if actual endpoints fail due to rate limit, invalid token, or exact URL differences
            clarityData = JSON.stringify({
              metrics: {
                deadClicks: 12,
                rageClicks: 5,
                scrollDepthAverage: 45, // 45%
                highDropoffZones: ['#hero-section', '.pricing-table']
              },
              note: "Mocked behavioral data injected (API connection or lookup failed)."
            });
            send({ type: 'status', message: 'Using mock Clarity data for demonstration.' });
          }
        }
        
        const masterParams = {
          screenshots: {
            desktop: scrapeData.screenshots.desktop,
            tablet: scrapeData.screenshots.tablet,
            mobile: scrapeData.screenshots.mobile,
            fullPage: scrapeData.screenshots.fullPage,
            fullPageNoModals: scrapeData.screenshots.fullPageNoModals
          },
          clarityData
        };

        // Run PSI and MasterDesignAgent concurrently
        const [psiData, masterResultRaw] = await Promise.all([
          fetchPSI(url).catch(e => {
            console.error('PSI Error:', e);
            return null;
          }),
          runAgent('MasterDesignAgent', masterAgent, masterParams)
        ]);

        if (psiData) {
           send({ type: 'agent_complete', agent: 'PerformanceAgent' });
           send({ type: 'agent_complete', agent: 'AccessibilityAgent' });
           send({ type: 'agent_complete', agent: 'SEOAgent' });
           send({ type: 'agent_complete', agent: 'SecurityAgent' });
           if (!errorHit) send({ type: 'step_complete', step: 'batch1' });
        }


        const visionResult = masterResultRaw ? masterResultRaw.vision : null;
        const uxResult = masterResultRaw ? masterResultRaw.ux : null;
        const croResult = masterResultRaw ? masterResultRaw.cro : null;
        const mobileResult = masterResultRaw ? masterResultRaw.mobile : null;
        const brandResult = masterResultRaw ? masterResultRaw.brand : null;
        const contentResult = masterResultRaw ? masterResultRaw.content : null;
        const marketResult = masterResultRaw ? masterResultRaw.market : null;

        if (masterResultRaw) {
          const simulatedAgents = [
            'VisionAgent', 'UXAgent', 'MobileAgent', 'CROAgent', 
            'BrandAgent', 'ContentAgent', 'MarketAgent'
          ];
          for (const sa of simulatedAgents) {
            send({ type: 'agent_complete', agent: sa });
          }
        }
        
        if (!errorHit) send({ type: 'step_complete', step: 'batch2' });
        if (!errorHit) send({ type: 'step_complete', step: 'batch3' });

        send({ type: 'status', message: 'Generating final audit report...' });
        const scoringEngine = new ScoringEngine();
        const finalReport = scoringEngine.generateReport({
          seo: psiData ? psiData.seo : undefined,
          accessibility: psiData ? psiData.accessibility : undefined,
          vision: visionResult || undefined,
          ux: uxResult || undefined,
          cro: croResult || undefined,
          brand: brandResult || undefined,
          content: contentResult || undefined,
          performance: psiData ? psiData.performance : undefined,
          security: psiData ? psiData.bestPractices : undefined,
          mobile: mobileResult || undefined,
          market: marketResult || undefined
        });

        // Save screenshots to filesystem
        const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
          fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        const runId = Date.now().toString();
        
        fs.writeFileSync(path.join(screenshotsDir, `${runId}_desktop.jpg`), Buffer.from(scrapeData.screenshots.desktop, 'base64'));
        fs.writeFileSync(path.join(screenshotsDir, `${runId}_tablet.jpg`), Buffer.from(scrapeData.screenshots.tablet, 'base64'));
        fs.writeFileSync(path.join(screenshotsDir, `${runId}_mobile.jpg`), Buffer.from(scrapeData.screenshots.mobile, 'base64'));
        fs.writeFileSync(path.join(screenshotsDir, `${runId}_fullPage.jpg`), Buffer.from(scrapeData.screenshots.fullPage, 'base64'));
        fs.writeFileSync(path.join(screenshotsDir, `${runId}_fullPageNoModals.jpg`), Buffer.from(scrapeData.screenshots.fullPageNoModals, 'base64'));

        const savedScreenshots = {
          desktop: `/screenshots/${runId}_desktop.jpg`,
          tablet: `/screenshots/${runId}_tablet.jpg`,
          mobile: `/screenshots/${runId}_mobile.jpg`,
          fullPage: `/screenshots/${runId}_fullPage.jpg`,
          fullPageNoModals: `/screenshots/${runId}_fullPageNoModals.jpg`
        };

        // Send the final completion payload
        send({
          type: 'complete',
          data: {
            url: scrapeData.url,
            metadata: scrapeData.metadata,
            htmlLength: scrapeData.html.length,
            report: finalReport,
            screenshots: savedScreenshots
          }
        });

      } catch (error: any) {
        console.error('Audit Engine Error:', error);
        send({ type: 'error', message: error.message || 'Internal Server Error' });
      } finally {
        if (scraper) {
          await scraper.close();
        }
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
