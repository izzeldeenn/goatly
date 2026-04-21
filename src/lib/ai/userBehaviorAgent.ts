// User Behavior Analyst Agent - Analyzes user patterns, identifies friction points

import { BaseAgent, AgentContext, AgentRecommendation, AgentRole } from './aiAgent';

export class UserBehaviorAgent extends BaseAgent {
  constructor() {
    super(
      AgentRole.USER_BEHAVIOR_ANALYST,
      `You are an expert user behavior analyst and UX researcher specializing in educational technology and productivity apps.

Your role is to:
1. Analyze user behavior data to identify patterns and trends
2. Detect friction points in the user journey
3. Identify why users churn or disengage
4. Suggest UX improvements based on data
5. Recommend personalization strategies
6. Analyze feature adoption and usage

Focus on actionable insights that will improve user retention and engagement.
Use data-driven reasoning to support your recommendations.
Return your analysis in a structured format with clear priorities.`
    );
  }

  protected buildPrompt(context: AgentContext): string {
    const userBehaviorData = context.userBehaviorData || {};

    return `
User Behavior Analysis Request:
${JSON.stringify(userBehaviorData, null, 2)}

Current timestamp: ${context.timestamp}

Please analyze this user behavior data and provide recommendations for:
1. Improving user retention
2. Reducing friction in the user journey
3. Increasing feature adoption
4. Personalizing the user experience
5. Addressing common pain points
6. Optimizing onboarding flow

Format your response as a numbered list with:
- Title of the insight
- Description of the pattern
- Priority (critical/high/medium/low)
- Specific action items
- Estimated impact on metrics`;
  }

  async getRecommendations(context: AgentContext): Promise<AgentRecommendation[]> {
    const response = await this.analyze(context);
    return this.parseRecommendations(response);
  }

  async analyzeDailyActivities(dailyActivities: any[]): Promise<AgentRecommendation[]> {
    // Calculate metrics from daily activities
    const metrics = {
      totalUsers: dailyActivities.length,
      avgStudyTime: this.calculateAverage(dailyActivities.map(a => a.study_seconds || 0)),
      avgSessions: this.calculateAverage(dailyActivities.map(a => a.sessions_count || 0)),
      retentionRate: this.calculateRetentionRate(dailyActivities),
      peakHours: this.analyzePeakHours(dailyActivities),
      churnRate: this.calculateChurnRate(dailyActivities),
    };

    const context: AgentContext = {
      userBehaviorData: {
        metrics,
        sampleData: dailyActivities.slice(0, 10), // Sample for context
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  async analyzeUserJourney(userEvents: any[]): Promise<AgentRecommendation[]> {
    const context: AgentContext = {
      userBehaviorData: {
        totalEvents: userEvents.length,
        events: userEvents.slice(0, 20), // Sample for context
        funnelAnalysis: this.analyzeFunnel(userEvents),
      },
      timestamp: new Date().toISOString(),
    };

    return await this.getRecommendations(context);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateRetentionRate(activities: any[]): number {
    // Simplified retention calculation
    const activeUsers = activities.filter(a => a.study_seconds > 0).length;
    return activities.length > 0 ? (activeUsers / activities.length) * 100 : 0;
  }

  private calculateChurnRate(activities: any[]): number {
    // Simplified churn calculation (users with 0 study time)
    const inactiveUsers = activities.filter(a => a.study_seconds === 0).length;
    return activities.length > 0 ? (inactiveUsers / activities.length) * 100 : 0;
  }

  private analyzePeakHours(activities: any[]): { hour: number; count: number }[] {
    // Simplified peak hours analysis
    const hourCounts: { [key: number]: number } = {};
    activities.forEach(a => {
      if (a.last_updated) {
        const hour = new Date(a.last_updated).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private analyzeFunnel(events: any[]): any {
    // Simplified funnel analysis
    const funnel = {
      visited: events.filter(e => e.type === 'page_view').length,
      joinedRoom: events.filter(e => e.type === 'join_room').length,
      completedSession: events.filter(e => e.type === 'session_complete').length,
      returned: events.filter(e => e.type === 'return_visit').length,
    };

    return funnel;
  }
}
