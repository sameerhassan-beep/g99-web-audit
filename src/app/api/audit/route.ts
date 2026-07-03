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

export const maxDuration = 300; // Allow max duration for scraping

export async function POST(req: NextRequest) {
  let scraper: WebsiteScraper | null = null;
  const { url, resumeState = {} } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
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

        send({ type: 'status', message: 'Analyzing Code & DOM Structure...' });
        
        const seoResult = await runAgent('SEOAgent', seoAgent, { html: scrapeData.html });
        const a11yResult = await runAgent('AccessibilityAgent', a11yAgent, { html: scrapeData.html });
        const perfResult = await runAgent('PerformanceAgent', performanceAgent, { html: scrapeData.html });
        const secResult = await runAgent('SecurityAgent', securityAgent, { html: scrapeData.html });
        
        if (!errorHit) send({ type: 'step_complete', step: 'batch1' });

        send({ type: 'status', message: 'Running Deep Mega-Prompt Analysis (Vision, UX, CRO, Brand, Content, Competitor)...' });
        
        const masterParams = {
          screenshots: {
            desktop: scrapeData.screenshots.desktop,
            tablet: scrapeData.screenshots.tablet,
            mobile: scrapeData.screenshots.mobile,
            fullPage: scrapeData.screenshots.fullPage
          }
        };

        const masterResultRaw = await runAgent('MasterDesignAgent', masterAgent, masterParams);

        const visionResult = masterResultRaw ? masterResultRaw.vision : null;
        const uxResult = masterResultRaw ? masterResultRaw.ux : null;
        const croResult = masterResultRaw ? masterResultRaw.cro : null;
        const mobileResult = masterResultRaw ? masterResultRaw.mobile : null;
        const brandResult = masterResultRaw ? masterResultRaw.brand : null;
        const contentResult = masterResultRaw ? masterResultRaw.content : null;
        const competitorResult = masterResultRaw ? masterResultRaw.competitor : null;

        if (masterResultRaw) {
          const simulatedAgents = [
            'VisionAgent', 'UXAgent', 'MobileAgent', 'CROAgent', 
            'BrandAgent', 'ContentAgent', 'CompetitorAgent'
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
          seo: seoResult,
          accessibility: a11yResult,
          vision: visionResult,
          ux: uxResult,
          cro: croResult,
          brand: brandResult,
          content: contentResult,
          performance: perfResult,
          security: secResult,
          mobile: mobileResult,
          competitor: competitorResult
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

        const savedScreenshots = {
          desktop: `/screenshots/${runId}_desktop.jpg`,
          tablet: `/screenshots/${runId}_tablet.jpg`,
          mobile: `/screenshots/${runId}_mobile.jpg`,
          fullPage: `/screenshots/${runId}_fullPage.jpg`
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
