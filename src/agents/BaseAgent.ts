export interface AuditCheck {
  checkName: string;
  passed: boolean;
  remediation?: string;
  impact?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentResult {
  observations: string[];
  issues: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  screenshots: string[];
  score: number;
  checks: AuditCheck[];
  markers?: { x: number; y: number; label: string; description: string; }[];
}

export abstract class BaseAgent {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Executes the agent's primary analysis on the provided URL or DOM data.
   */
  abstract analyze(url: string, context?: any): Promise<AgentResult>;

  /**
   * Helper method to standardize scoring based on issues found.
   */
  protected calculateScore(baseScore: number, penalties: number): number {
    return Math.max(0, Math.min(100, baseScore - penalties));
  }
}
