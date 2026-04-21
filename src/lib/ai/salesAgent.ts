// Sales Manager Agent - Analyzes sales, conversion rates, growth strategies

import { BaseAgent, AgentContext, AgentRecommendation, AgentRole } from './aiAgent';

export class SalesAgent extends BaseAgent {
  constructor() {
    super(
      AgentRole.SALES_MANAGER,
      `You are an expert sales manager and business analyst specializing in SaaS and educational technology.

Your role is to:
1. Analyze conversion rates and sales metrics
2. Identify growth opportunities and strategies
3. Suggest pricing models and tiers
4. Analyze feature adoption for premium features
5. Recommend marketing strategies
6. Identify churn reasons and retention strategies
7. Analyze competitor positioning

Focus on actionable business insights that will drive revenue and growth.
Use data-driven reasoning to support your recommendations.
Return your analysis in a structured format with clear priorities.`
    );
  }

  protected buildPrompt(context: AgentContext): string {
    const salesData = context.salesData || {};

    return `
Sales Analysis Request:
${JSON.stringify(salesData, null, 2)}

Current timestamp: ${context.timestamp}

Please analyze this sales data and provide recommendations for:
1. Improving conversion rates
2. Reducing churn
3. Optimizing pricing strategy
4. Increasing premium feature adoption
5. Growth strategies and tactics
6. Marketing opportunities
7. Competitive advantages

Format your response as a numbered list with:
- Title of the insight
- Description of the opportunity
- Priority (critical/high/medium/low)
- Specific action items
- Estimated revenue impact`;
  }

  async getRecommendations(context: AgentContext): Promise<AgentRecommendation[]> {
    const response = await this.analyze(context);
    return this.parseRecommendations(response);
  }

  async analyzeConversionMetrics(metrics: {
    totalUsers: number;
    premiumUsers: number;
    conversionRate: number;
    churnRate: number;
    avgRevenuePerUser: number;
  }): Promise<AgentRecommendation[]> {
    const context: AgentContext = {
      salesData: {
        metrics,
        insights: this.generateBasicInsights(metrics),
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  async analyzeFeatureAdoption(features: Array<{
    name: string;
    freeUsers: number;
    premiumUsers: number;
    adoptionRate: number;
  }>): Promise<AgentRecommendation[]> {
    const context: AgentContext = {
      salesData: {
        features,
        topFeatures: features.sort((a, b) => b.adoptionRate - a.adoptionRate).slice(0, 5),
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  private generateBasicInsights(metrics: any): string[] {
    const insights: string[] = [];

    if (metrics.conversionRate < 5) {
      insights.push('Conversion rate is below industry average (5-10%)');
    } else if (metrics.conversionRate > 10) {
      insights.push('Conversion rate is excellent, consider scaling acquisition');
    }

    if (metrics.churnRate > 10) {
      insights.push('Churn rate is concerning, focus on retention strategies');
    }

    if (metrics.premiumUsers / metrics.totalUsers < 0.1) {
      insights.push('Premium adoption is low, consider value proposition improvements');
    }

    return insights;
  }
}
