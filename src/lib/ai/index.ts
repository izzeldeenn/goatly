// AI System - Main entry point for multi-role AI agents

import { AgentFactory, AgentRole, AgentContext, AgentRecommendation } from './aiAgent';
import { DeveloperAgent } from './developerAgent';
import { UserBehaviorAgent } from './userBehaviorAgent';
import { SalesAgent } from './salesAgent';
import { StrategicAgent } from './strategicAgent';

// Initialize and register all agents
const developerAgent = new DeveloperAgent();
const userBehaviorAgent = new UserBehaviorAgent();
const salesAgent = new SalesAgent();
const strategicAgent = new StrategicAgent();

AgentFactory.registerAgent(AgentRole.DEVELOPER, developerAgent);
AgentFactory.registerAgent(AgentRole.USER_BEHAVIOR_ANALYST, userBehaviorAgent);
AgentFactory.registerAgent(AgentRole.SALES_MANAGER, salesAgent);
AgentFactory.registerAgent(AgentRole.STRATEGIC_ANALYST, strategicAgent);

// Main AI System
export class AISystem {
  /**
   * Get recommendations from all AI agents
   */
  static async getAllRecommendations(context: AgentContext): Promise<AgentRecommendation[]> {
    return await AgentFactory.getAllRecommendations(context);
  }

  /**
   * Get recommendations from a specific agent
   */
  static async getRecommendationsByRole(role: AgentRole, context: AgentContext): Promise<AgentRecommendation[]> {
    const agent = AgentFactory.getAgent(role);
    if (!agent) {
      throw new Error(`Agent not found for role: ${role}`);
    }
    return await agent.getRecommendations(context);
  }

  /**
   * Analyze code using Developer Agent
   */
  static async analyzeCode(filePath: string, fileContent: string): Promise<AgentRecommendation[]> {
    return await developerAgent.analyzeCodeFile(filePath, fileContent);
  }

  /**
   * Analyze user behavior using User Behavior Analyst Agent
   */
  static async analyzeUserBehavior(dailyActivities: any[]): Promise<AgentRecommendation[]> {
    return await userBehaviorAgent.analyzeDailyActivities(dailyActivities);
  }

  /**
   * Analyze sales metrics using Sales Manager Agent
   */
  static async analyzeSales(metrics: any): Promise<AgentRecommendation[]> {
    return await salesAgent.analyzeConversionMetrics(metrics);
  }

  /**
   * Analyze market strategy using Strategic Analyst Agent
   */
  static async analyzeStrategy(features: string[], userGrowth: number): Promise<AgentRecommendation[]> {
    return await strategicAgent.analyzeMarketPosition(features, userGrowth);
  }

  /**
   * Get comprehensive analysis from all agents
   */
  static async getComprehensiveAnalysis(data: {
    code?: any;
    userBehavior?: any;
    sales?: any;
    project?: any;
  }): Promise<{
    developer: AgentRecommendation[];
    userBehavior: AgentRecommendation[];
    sales: AgentRecommendation[];
    strategy: AgentRecommendation[];
    all: AgentRecommendation[];
  }> {
    const context: AgentContext = {
      codeData: data.code,
      userBehaviorData: data.userBehavior,
      salesData: data.sales,
      projectData: data.project,
      timestamp: new Date().toISOString(),
    };

    const [developer, userBehavior, sales, strategy] = await Promise.all([
      this.getRecommendationsByRole(AgentRole.DEVELOPER, context),
      this.getRecommendationsByRole(AgentRole.USER_BEHAVIOR_ANALYST, context),
      this.getRecommendationsByRole(AgentRole.SALES_MANAGER, context),
      this.getRecommendationsByRole(AgentRole.STRATEGIC_ANALYST, context),
    ]);

    const all = [...developer, ...userBehavior, ...sales, ...strategy].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return {
      developer,
      userBehavior,
      sales,
      strategy,
      all,
    };
  }
}

// Export types and agents for direct use
export * from './aiAgent';
export * from './developerAgent';
export * from './userBehaviorAgent';
export * from './salesAgent';
export * from './strategicAgent';
export * from './huggingface';
