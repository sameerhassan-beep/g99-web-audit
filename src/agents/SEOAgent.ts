import { BaseAgent, AgentResult } from './BaseAgent';
import * as cheerio from 'cheerio';

export class SEOAgent extends BaseAgent {
  constructor() {
    super('SEOAgent');
  }

  async analyze(url: string, context: { html: string }): Promise<AgentResult> {
    console.log(`[SEOAgent] Analyzing HTML for ${url}`);
    const $ = cheerio.load(context.html);
    
    const observations: string[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    let penalty = 0;

    // Title Check
    const title = $('title').text();
    if (!title) {
      issues.push('Missing <title> tag.');
      recommendations.push('Add a descriptive <title> tag containing primary keywords.');
      penalty += 15;
    } else if (title.length < 30 || title.length > 60) {
      issues.push(`Title tag length (${title.length}) is outside the optimal range (30-60 characters).`);
      recommendations.push('Optimize title tag length for better CTR in search results.');
      penalty += 5;
    } else {
      observations.push('Title tag is present and optimal length.');
    }

    // Meta Description Check
    const metaDesc = $('meta[name="description"]').attr('content');
    if (!metaDesc) {
      issues.push('Missing meta description.');
      recommendations.push('Add a compelling meta description (150-160 characters) to improve click-through rates.');
      penalty += 15;
    } else if (metaDesc.length < 120 || metaDesc.length > 160) {
      issues.push(`Meta description length (${metaDesc.length}) is outside the optimal range (120-160 characters).`);
      penalty += 5;
    } else {
      observations.push('Meta description is present and optimal length.');
    }

    // H1 Check
    const h1s = $('h1');
    if (h1s.length === 0) {
      issues.push('Missing H1 tag.');
      recommendations.push('Ensure every page has exactly one H1 tag summarizing the page content.');
      penalty += 10;
    } else if (h1s.length > 1) {
      issues.push(`Multiple H1 tags found (${h1s.length}).`);
      recommendations.push('Use only one H1 tag per page for clear semantic structure.');
      penalty += 5;
    } else {
      observations.push('Exactly one H1 tag is present.');
    }

    // Image Alt Text Check
    const images = $('img');
    let imagesWithoutAlt = 0;
    images.each((_, img) => {
      if (!$(img).attr('alt')) {
        imagesWithoutAlt++;
      }
    });
    
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images are missing 'alt' attributes.`);
      recommendations.push('Add descriptive alt text to all images for SEO and accessibility.');
      penalty += Math.min(15, imagesWithoutAlt * 2);
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
          checkName: 'Title Tag',
          passed: !!title && title.length >= 30 && title.length <= 60,
          remediation: 'Add a descriptive <title> tag containing primary keywords (30-60 characters).',
          impact: 'high'
        },
        {
          checkName: 'Meta Description',
          passed: !!metaDesc && metaDesc.length >= 120 && metaDesc.length <= 160,
          remediation: 'Add a compelling meta description (120-160 characters).',
          impact: 'high'
        },
        {
          checkName: 'H1 Tag',
          passed: h1s.length === 1,
          remediation: 'Ensure exactly one H1 tag is present on the page.',
          impact: 'medium'
        },
        {
          checkName: 'Image Alt Texts',
          passed: imagesWithoutAlt === 0,
          remediation: 'Add descriptive alt text to all images.',
          impact: 'low'
        }
      ]
    };
  }
}
