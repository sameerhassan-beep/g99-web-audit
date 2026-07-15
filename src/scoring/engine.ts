import { AgentResult } from '@/agents/BaseAgent';

export interface AuditResults {
  seo: AgentResult;
  accessibility: AgentResult;
  vision: AgentResult;
  ux: AgentResult;
  cro: AgentResult;
  content: AgentResult;
  performance: AgentResult;
  security: AgentResult;
}

export interface ScoredAuditReport {
  overallScore: number;
  categoryScores: Record<keyof AuditResults, number>;
  isPartial?: boolean;
  executiveSummary: {
    topStrengths: string[];
    topWeaknesses: string[];
    priorityFixes: string[];
  };
  rawResults: Partial<AuditResults>;
}

export class ScoringEngine {
  // Define weights for each category. Must sum to 100.
  private readonly WEIGHTS = {
    vision: 15,       // 15%
    ux: 20,           // 20%
    cro: 15,          // 15%
    seo: 15,          // 15%
    accessibility: 10,// 10%
    content: 5,       // 5%
    performance: 10,  // 10%
    security: 10      // 10%
  };

  public generateReport(results: Partial<AuditResults>): ScoredAuditReport {
    // 1. Calculate overall score based on available weights
    let totalScore = 0;
    let totalWeight = 0;
    const categoryScores: any = {};
    let isPartial = false;

    for (const [key, weight] of Object.entries(this.WEIGHTS)) {
      const category = key as keyof AuditResults;
      if (results[category]) {
        const score = results[category].score || 0;
        categoryScores[category] = score;
        totalScore += score * (weight / 100);
        totalWeight += weight;
      } else {
        isPartial = true;
      }
    }

    // Normalize score out of 100 based on the total valid weights
    const overallScore = totalWeight > 0 ? Math.round(totalScore / (totalWeight / 100)) : 0;

    // 2. Extract top strengths and weaknesses from successful agents only
    const validResults = Object.values(results).filter(r => r != null);
    
    const allObservations = validResults.flatMap(r => r.observations || []);
    const allIssues = validResults.flatMap(r => r.issues || []);
    const allRecommendations = validResults.flatMap(r => r.recommendations || []);
    
    const topStrengths = allObservations.slice(0, 3);
    const topWeaknesses = allIssues.slice(0, 3);
    const priorityFixes = allRecommendations.slice(0, 5);

    return {
      overallScore,
      categoryScores,
      isPartial,
      executiveSummary: {
        topStrengths,
        topWeaknesses,
        priorityFixes
      },
      rawResults: results
    };
  }
}
