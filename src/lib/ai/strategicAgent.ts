// Strategic Analyst Agent - Market analysis, competitive intelligence, product strategy

import { BaseAgent, AgentContext, AgentRecommendation, AgentRole } from './aiAgent';

export class StrategicAgent extends BaseAgent {
  constructor() {
    super(
      AgentRole.STRATEGIC_ANALYST,
      `You are an expert strategic analyst and product manager specializing in educational technology and productivity apps.

Your role is to:
1. Analyze market trends in edtech and productivity
2. Identify competitive advantages and differentiators
3. Suggest product roadmap priorities
4. Analyze feature opportunities and risks
5. Recommend strategic partnerships
6. Identify emerging technologies to adopt
7. Assess market positioning

Focus on long-term strategic insights that will drive sustainable growth.
Use market research and trend analysis to support your recommendations.
Return your analysis in a structured format with clear priorities.`
    );
  }

  protected buildPrompt(context: AgentContext): string {
    const projectData = context.projectData || {};

    return `
Strategic Analysis Request:
${JSON.stringify(projectData, null, 2)}

Current timestamp: ${context.timestamp}

Please analyze the project and provide strategic recommendations for:
1. Product roadmap priorities
2. Competitive differentiation
3. Market opportunities
4. Technology adoption
5. Partnership opportunities
6. Risk assessment
7. Long-term growth strategy

Format your response as a numbered list with:
- Title of the strategic insight
- Description of the opportunity
- Priority (critical/high/medium/low)
- Specific action items
- Estimated strategic impact`;
  }

  async getRecommendations(context: AgentContext): Promise<AgentRecommendation[]> {
    const response = await this.analyze(context);
    return this.parseRecommendations(response);
  }

  async analyzeMarketPosition(currentFeatures: string[], userGrowth: number): Promise<AgentRecommendation[]> {
    const context: AgentContext = {
      projectData: {
        currentFeatures,
        userGrowth,
        marketContext: 'Educational technology and productivity space',
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  async analyzeFeatureOpportunity(feature: string, estimatedCost: number, potentialUsers: number): Promise<AgentRecommendation[]> {
    const context: AgentContext = {
      projectData: {
        proposedFeature: feature,
        estimatedCost,
        potentialUsers,
        roi: this.calculateROI(estimatedCost, potentialUsers),
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  private calculateROI(cost: number, users: number): string {
    const revenue = users * 5; // Assuming $5 average revenue per user
    const roi = ((revenue - cost) / cost) * 100;
    return `${roi.toFixed(1)}%`;
  }
}
