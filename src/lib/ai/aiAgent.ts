// Base AI Agent System - Multi-role AI Architecture

import { huggingFaceService, HuggingFaceMessage } from './huggingface';

export enum AgentRole {
  DEVELOPER = 'developer',
  USER_BEHAVIOR_ANALYST = 'user_behavior_analyst',
  SALES_MANAGER = 'sales_manager',
  STRATEGIC_ANALYST = 'strategic_analyst',
}

export interface AgentContext {
  projectData?: any;
  userBehaviorData?: any;
  salesData?: any;
  codeData?: any;
  timestamp?: string;
}

export interface AgentRecommendation {
  role: AgentRole;
  type: 'improvement' | 'bug_fix' | 'feature' | 'strategy' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact?: string;
  createdAt: string;
}

export abstract class BaseAgent {
  protected role: AgentRole;
  protected systemPrompt: string;

  constructor(role: AgentRole, systemPrompt: string) {
    this.role = role;
    this.systemPrompt = systemPrompt;
  }

  protected async analyze(context: AgentContext): Promise<string> {
    const messages: HuggingFaceMessage[] = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: this.buildPrompt(context) },
    ];

    return await huggingFaceService.chat(messages);
  }

  protected abstract buildPrompt(context: AgentContext): string;

  protected parseRecommendations(response: string): AgentRecommendation[] {
    // Parse AI response into structured recommendations
    const recommendations: AgentRecommendation[] = [];
    
    try {
      // Try to parse JSON if AI returns structured data
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map(rec => ({
            ...rec,
            role: this.role,
            createdAt: new Date().toISOString(),
          }));
        }
      }
      
      // Fallback: parse text response
      const lines = response.split('\n').filter(line => line.trim());
      let currentRec: Partial<AgentRecommendation> | null = null;
      
      lines.forEach(line => {
        if (line.match(/^[0-9]+\./)) {
          if (currentRec) {
            recommendations.push(currentRec as AgentRecommendation);
          }
          currentRec = {
            role: this.role,
            type: 'improvement',
            priority: 'medium',
            title: line.replace(/^[0-9]+\.\s*/, ''),
            description: '',
            actionItems: [],
            createdAt: new Date().toISOString(),
          };
        } else if (currentRec) {
          if (line.startsWith('- ')) {
            currentRec.actionItems?.push(line.replace('- ', ''));
          } else {
            currentRec.description += line + ' ';
          }
        }
      });
      
      if (currentRec) {
        recommendations.push(currentRec as AgentRecommendation);
      }
      
    } catch (error) {
      console.error('Error parsing recommendations:', error);
    }
    
    return recommendations;
  }

  abstract getRecommendations(context: AgentContext): Promise<AgentRecommendation[]>;

  protected getPriorityFromText(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lower = text.toLowerCase();
    if (lower.includes('critical') || lower.includes('urgent') || lower.includes('security')) {
      return 'critical';
    }
    if (lower.includes('high') || lower.includes('important') || lower.includes('major')) {
      return 'high';
    }
    if (lower.includes('low') || lower.includes('minor') || lower.includes('optional')) {
      return 'low';
    }
    return 'medium';
  }
}

// Agent Factory
export class AgentFactory {
  private static agents: Map<AgentRole, BaseAgent> = new Map();

  static registerAgent(role: AgentRole, agent: BaseAgent): void {
    this.agents.set(role, agent);
  }

  static getAgent(role: AgentRole): BaseAgent | undefined {
    return this.agents.get(role);
  }

  static async getAllRecommendations(context: AgentContext): Promise<AgentRecommendation[]> {
    const allRecommendations: AgentRecommendation[] = [];
    
    for (const [role, agent] of this.agents) {
      try {
        const recommendations = await agent.getRecommendations(context);
        allRecommendations.push(...recommendations);
      } catch (error) {
        console.error(`Error getting recommendations from ${role}:`, error);
      }
    }
    
    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return allRecommendations;
  }
}
