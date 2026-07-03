import { BaseAgent, AgentResult } from './BaseAgent';
import * as cheerio from 'cheerio';

export class SecurityAgent extends BaseAgent {
  constructor() {
    super('SecurityAgent');
  }

  async analyze(url: string, context: { html: string }): Promise<AgentResult> {
    console.log(`[SecurityAgent] Analyzing HTML for ${url} deterministically`);
    const $ = cheerio.load(context.html);
    
    const observations: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    let penalty = 0;

    // HTTPS / Mixed Content Check
    let httpLinks = 0;
    $('a[href^="http://"], img[src^="http://"], script[src^="http://"], link[href^="http://"]').each(() => {
      httpLinks++;
    });

    if (httpLinks > 0) {
      issues.push(`${httpLinks} mixed content (HTTP) links or assets found.`);
      recommendations.push('Ensure all internal links and asset sources use HTTPS to prevent man-in-the-middle attacks.');
      penalty += Math.min(30, httpLinks * 5);
    } else {
      observations.push('No mixed content (HTTP) assets found.');
    }

    // Target Blank Vulnerability Check
    const targetBlanks = $('a[target="_blank"]');
    let vulnerableLinks = 0;
    targetBlanks.each((_, a) => {
      const rel = $(a).attr('rel') || '';
      if (!rel.includes('noopener')) {
        vulnerableLinks++;
      }
    });

    if (vulnerableLinks > 0) {
      issues.push(`${vulnerableLinks} external links are vulnerable to reverse tabnabbing (missing rel="noopener").`);
      recommendations.push('Add rel="noopener" to all <a target="_blank"> tags to secure against malicious redirects.');
      penalty += Math.min(20, vulnerableLinks * 2);
    } else {
      observations.push('All external links properly use rel="noopener".');
    }

    // Iframe Sandboxing Check
    const iframes = $('iframe');
    let unsandboxedIframes = 0;
    iframes.each((_, iframe) => {
      if (!$(iframe).attr('sandbox')) {
        unsandboxedIframes++;
      }
    });

    if (unsandboxedIframes > 0) {
      issues.push(`${unsandboxedIframes} iframes lack the 'sandbox' attribute.`);
      recommendations.push('Apply the sandbox attribute to iframes to restrict malicious third-party code execution.');
      penalty += Math.min(15, unsandboxedIframes * 5);
    } else if (iframes.length > 0) {
      observations.push('All iframes are properly sandboxed.');
    } else {
      observations.push('No iframes detected.');
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
          checkName: 'Mixed Content (HTTPS)',
          passed: httpLinks === 0,
          remediation: 'Update all HTTP URLs to HTTPS.',
          impact: 'high'
        },
        {
          checkName: 'Reverse Tabnabbing',
          passed: vulnerableLinks === 0,
          remediation: 'Ensure all target="_blank" links include rel="noopener".',
          impact: 'medium'
        },
        {
          checkName: 'Iframe Sandboxing',
          passed: unsandboxedIframes === 0,
          remediation: 'Add sandbox attribute to all third-party iframes.',
          impact: 'low'
        }
      ]
    };
  }
}
