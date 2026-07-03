import { BaseAgent, AgentResult } from './BaseAgent';
import * as cheerio from 'cheerio';

export class AccessibilityAgent extends BaseAgent {
  constructor() {
    super('AccessibilityAgent');
  }

  async analyze(url: string, context: { html: string }): Promise<AgentResult> {
    console.log(`[AccessibilityAgent] Analyzing HTML for ${url}`);
    const $ = cheerio.load(context.html);
    
    const observations: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    let penalty = 0;

    // Check lang attribute
    const htmlLang = $('html').attr('lang');
    if (!htmlLang) {
      issues.push('Missing lang attribute on <html> tag.');
      recommendations.push('Add a lang attribute to the <html> tag (e.g., lang="en") for screen readers.');
      penalty += 10;
    } else {
      observations.push(`Found html lang attribute: ${htmlLang}`);
    }

    // Buttons without text or aria-label
    let emptyButtons = 0;
    $('button').each((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      if (!text && !ariaLabel) {
        emptyButtons++;
      }
    });

    if (emptyButtons > 0) {
      issues.push(`${emptyButtons} buttons are missing text content or aria-label attributes.`);
      recommendations.push('Ensure all interactive buttons have screen-reader accessible text.');
      penalty += Math.min(20, emptyButtons * 5);
    }

    // Form inputs without labels
    let inputsWithoutLabels = 0;
    $('input:not([type="hidden"]):not([type="submit"]):not([type="button"])').each((_, el) => {
      const id = $(el).attr('id');
      const ariaLabel = $(el).attr('aria-label');
      let hasLabel = false;
      
      if (id) {
        hasLabel = $(`label[for="${id}"]`).length > 0;
      }
      
      if (!hasLabel && !ariaLabel) {
        inputsWithoutLabels++;
      }
    });

    if (inputsWithoutLabels > 0) {
      issues.push(`${inputsWithoutLabels} input fields are missing associated labels or aria-labels.`);
      recommendations.push('Bind a <label> to every input field using the "for" attribute.');
      penalty += Math.min(20, inputsWithoutLabels * 5);
    }

    // Skip Links Check
    const skipLink = $('a[href^="#"]').filter((_, el) => {
      return $(el).text().toLowerCase().includes('skip');
    });

    if (skipLink.length === 0) {
      issues.push('No "Skip to Content" link found.');
      recommendations.push('Implement a skip navigation link for keyboard users to bypass repetitive menus.');
      penalty += 5;
    } else {
      observations.push('Found "Skip to Content" link.');
    }

    const score = this.calculateScore(100, penalty);

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
          checkName: 'HTML Lang Attribute',
          passed: !!htmlLang,
          remediation: 'Add a lang attribute to the <html> tag.',
          impact: 'medium'
        },
        {
          checkName: 'Accessible Buttons',
          passed: emptyButtons === 0,
          remediation: 'Ensure all buttons have text content or aria-label.',
          impact: 'high'
        },
        {
          checkName: 'Form Input Labels',
          passed: inputsWithoutLabels === 0,
          remediation: 'Ensure all inputs have an associated <label> or aria-label.',
          impact: 'high'
        },
        {
          checkName: 'Skip Links',
          passed: skipLink.length > 0,
          remediation: 'Add a "Skip to Content" link for keyboard users.',
          impact: 'medium'
        }
      ]
    };
  }
}
