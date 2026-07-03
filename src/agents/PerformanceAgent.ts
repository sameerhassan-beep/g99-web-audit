import { BaseAgent, AgentResult } from './BaseAgent';
import * as cheerio from 'cheerio';

export class PerformanceAgent extends BaseAgent {
  constructor() {
    super('PerformanceAgent');
  }

  async analyze(url: string, context: { html: string }): Promise<AgentResult> {
    console.log(`[PerformanceAgent] Analyzing HTML for ${url} deterministically`);
    const $ = cheerio.load(context.html);
    
    const observations: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    let penalty = 0;

    // DOM Size Check
    const allElements = $('*').length;
    if (allElements > 1500) {
      issues.push(`DOM size is exceptionally large (${allElements} nodes).`);
      recommendations.push('Reduce DOM size to < 1500 nodes for better rendering performance and lower memory usage.');
      penalty += 15;
    } else if (allElements > 800) {
      observations.push(`DOM size is moderate (${allElements} nodes).`);
      penalty += 5;
    } else {
      observations.push(`DOM size is optimal (${allElements} nodes).`);
    }

    // Image Lazy Loading Check
    const images = $('img');
    let imagesWithoutLazy = 0;
    images.each((_, img) => {
      const loading = $(img).attr('loading');
      if (loading !== 'lazy' && loading !== 'eager') {
        imagesWithoutLazy++;
      }
    });

    if (imagesWithoutLazy > 0) {
      issues.push(`${imagesWithoutLazy} images are missing explicit 'loading' attributes.`);
      recommendations.push('Add loading="lazy" to offscreen images to save bandwidth and improve Largest Contentful Paint (LCP).');
      penalty += Math.min(20, imagesWithoutLazy * 2);
    } else {
      observations.push('Images utilize modern loading attributes appropriately.');
    }

    // Render-blocking Scripts Check
    const headScripts = $('head script[src]');
    let blockingScripts = 0;
    headScripts.each((_, script) => {
      const $script = $(script);
      const hasDefer = $script.attr('defer') !== undefined;
      const hasAsync = $script.attr('async') !== undefined;
      const type = $script.attr('type');
      if (!hasDefer && !hasAsync && type !== 'module') {
        blockingScripts++;
      }
    });

    if (blockingScripts > 0) {
      issues.push(`${blockingScripts} render-blocking scripts found in the <head>.`);
      recommendations.push('Add "defer" or "async" to <script> tags in the head to prevent parser blocking.');
      penalty += Math.min(25, blockingScripts * 5);
    } else {
      observations.push('No render-blocking scripts detected in the <head>.');
    }

    // Resource Hints Check
    const preconnects = $('link[rel="preconnect"]');
    if (preconnects.length === 0) {
      issues.push('Missing resource hints (e.g., <link rel="preconnect">).');
      recommendations.push('Use rel="preconnect" or rel="dns-prefetch" for critical third-party origins (fonts, analytics).');
      penalty += 5;
    } else {
      observations.push(`Found ${preconnects.length} resource hints optimizing network connections.`);
    }

    const score = Math.max(0, 100 - penalty);

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score < 50) severity = 'critical';
    else if (score < 70) severity = 'high';
    else if (score < 85) severity = 'medium';

    return {
      observations,
      issues,
      recommendations,
      severity,
      screenshots: [],
      score,
      checks: [
        {
          checkName: 'DOM Size Optimization',
          passed: allElements <= 1500,
          remediation: 'Reduce DOM depth and total node count (ideally under 1500 nodes).',
          impact: 'high'
        },
        {
          checkName: 'Image Lazy Loading',
          passed: imagesWithoutLazy === 0,
          remediation: 'Add loading="lazy" to images outside the initial viewport.',
          impact: 'medium'
        },
        {
          checkName: 'Render-blocking Scripts',
          passed: blockingScripts === 0,
          remediation: 'Defer or asynchronously load non-critical JavaScript.',
          impact: 'high'
        },
        {
          checkName: 'Resource Hints',
          passed: preconnects.length > 0,
          remediation: 'Implement <link rel="preconnect"> for early network connections to critical origins.',
          impact: 'low'
        }
      ]
    };
  }
}
