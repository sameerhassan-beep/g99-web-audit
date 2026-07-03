import { BaseAgent, AgentResult } from './BaseAgent';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const keys = (process.env.GEMINI_KEYS || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

function getNextGoogleModel(modelName: string) {
  if (keys.length === 0) {
    throw new Error('No Gemini API keys found in environment variables.');
  }
  const key = keys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  console.log(`[API Key Rotation] Using key ending in ...${key.slice(-4)}`);
  
  const google = createGoogleGenerativeAI({ apiKey: key });
  return google(modelName);
}

const AgentResultSchema = z.object({
  observations: z.array(z.string()).describe('Specific visual observations regarding this category. MUST be extremely detailed, multi-sentence paragraphs exploring the exact "why" and "how" of the observation.'),
  issues: z.array(z.string()).describe('Specific problems or flaws found. MUST be comprehensive, explaining the negative impact in detail (at least 2-3 sentences per issue).'),
  recommendations: z.array(z.string()).describe('Actionable, highly detailed recommendations. Provide step-by-step guidance or precise technical/design instructions.'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  score: z.number().min(0).max(100).describe('Score out of 100 based on standard heuristics for this category.'),
  checks: z.array(z.object({
    checkName: z.string().describe('The name of the check performed.'),
    passed: z.boolean().describe('Whether the website passed this specific check.'),
    remediation: z.string().optional().describe('Highly detailed explanation of how to fix the issue if it failed.'),
    impact: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Impact of the issue.')
  })).describe('A massive, exhaustive list of at least 25 to 30 highly specific checks performed in this category. Do not stop until you have at least 25 checks.')
});

export class MasterDesignAgent extends BaseAgent {
  constructor() {
    super('MasterDesignAgent');
  }

  async analyze(url: string, context: { screenshots: { desktop: string; mobile: string; tablet: string; fullPage: string } }): Promise<any> {
    console.log(`[MasterDesignAgent] Analyzing mega-prompt for ${url}`);
    
    try {
      const { object } = await generateObject({
        model: getNextGoogleModel('gemini-flash-latest'),
        maxRetries: 3,
        system: `You are an elite, agency-level Design, UX, and Strategy Team.
Your goal is to conduct a relentless, high-end critique of the provided website screenshots (Desktop, Tablet, Mobile, FullPage).
You must evaluate the website across 7 distinct disciplines simultaneously:
1. Vision & UI (typography, whitespace, hierarchy, contrast, modern aesthetics)
2. UX & Usability (navigation, mental models, friction, accessibility)
3. CRO & Sales (funnel clarity, CTA placement, value props, trust signals)
4. Mobile Responsiveness (touch targets, fluid layout, scaling)
5. Brand Identity (consistency, personality, premium feel)
6. Content & Copy (readability, microcopy, persuasion, skimmability)
7. Competitor/Market (positioning, feature parity, differentiation)

CRITICAL INSTRUCTION: You MUST be extremely detailed. Do not give short bullet points. Every observation, issue, and recommendation MUST be a comprehensive, multi-sentence paragraph. Explain the 'why' and 'how' deeply. Act like a senior design consultant writing a $10,000 audit report. Do not hold back on pointing out generic or outdated elements. Give specific, actionable recommendations for each category.`,
        schema: z.object({
          vision: AgentResultSchema,
          ux: AgentResultSchema,
          cro: AgentResultSchema,
          mobile: AgentResultSchema,
          brand: AgentResultSchema,
          content: AgentResultSchema,
          competitor: AgentResultSchema
        }),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please critique the following website: ${url}. The images provided are the Desktop, Tablet, and Mobile viewports respectively. Provide a comprehensive 7-discipline audit.`
              },
              {
                type: 'image',
                image: context.screenshots.desktop
              },
              {
                type: 'image',
                image: context.screenshots.tablet
              },
              {
                type: 'image',
                image: context.screenshots.mobile
              }
            ]
          }
        ]
      });

      // Inject screenshots tag into each result to match legacy output
      const finalResult: any = {};
      for (const [key, val] of Object.entries(object)) {
        finalResult[key] = {
          ...(val as any),
          screenshots: ['desktop', 'tablet', 'mobile']
        };
      }

      return finalResult;
      
    } catch (error: any) {
      console.error('[MasterDesignAgent] Error analyzing mega-prompt:', error);
      require('fs').appendFileSync('error.log', new Date().toISOString() + ' - MasterDesignAgent Error: ' + error?.message + '\n' + error?.stack + '\n\n');
      throw error;
    }
  }
}
