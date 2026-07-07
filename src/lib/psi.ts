import { AgentResult } from '@/agents/BaseAgent';

export async function fetchPSI(url: string) {
  const apiKey = process.env.GOOGLE_PSI_API_KEY;
  let endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=desktop`;
  
  if (apiKey) {
    endpoint += `&key=${apiKey}`;
  }

  const res = await fetch(endpoint, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`PSI API failed with status ${res.status}`);
  }
  
  const data = await res.json();
  const categories = data.lighthouseResult.categories;
  const audits = data.lighthouseResult.audits;

  // Helper to map Lighthouse category to AgentResult
  const mapCategory = (categoryData: any, categoryId: string): AgentResult => {
    if (!categoryData) return { score: 0, observations: [], issues: [], recommendations: [], checks: [] };

    const score = Math.round(categoryData.score * 100);
    const checks: any[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];

    for (const auditRef of categoryData.auditRefs) {
      const auditId = auditRef.id;
      const auditDetails = audits[auditId];
      if (!auditDetails) continue;

      if (auditDetails.scoreDisplayMode === 'notApplicable' || auditDetails.scoreDisplayMode === 'informative') continue;

      const passed = auditDetails.score >= 0.9;
      
      let impact: 'critical' | 'high' | 'medium' | 'low' = 'low';
      if (auditRef.weight > 5) impact = 'critical';
      else if (auditRef.weight > 2) impact = 'high';
      else if (auditRef.weight > 0) impact = 'medium';

      checks.push({
        checkName: auditDetails.title,
        passed,
        impact,
        remediation: passed ? undefined : (auditDetails.description || '').split('[Learn more]')[0].trim()
      });

      if (!passed) {
        if (impact === 'critical' || impact === 'high') {
           issues.push(auditDetails.title);
           const remediation = (auditDetails.description || '').split('.')[0];
           recommendations.push(`Fix ${auditDetails.title}: ${remediation}`);
        }
      }
    }

    return {
      score,
      observations: [`Lighthouse score for ${categoryId} is ${score}/100.`],
      issues: issues.slice(0, 5), // Keep top 5
      recommendations: recommendations.slice(0, 5),
      checks
    };
  };

  return {
    performance: mapCategory(categories.performance, 'performance'),
    accessibility: mapCategory(categories.accessibility, 'accessibility'),
    bestPractices: mapCategory(categories['best-practices'], 'best-practices'),
    seo: mapCategory(categories.seo, 'seo')
  };
}
