// API endpoint for AI analysis

import { NextRequest, NextResponse } from 'next/server';
import { AISystem } from '@/lib/ai';
import { aiRecommendationsDB } from '@/lib/ai/aiRecommendationsDB';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisType, data } = body;

    let recommendations;

    switch (analysisType) {
      case 'code':
        recommendations = await AISystem.analyzeCode(data.filePath, data.fileContent);
        break;
      case 'userBehavior':
        recommendations = await AISystem.analyzeUserBehavior(data.dailyActivities);
        break;
      case 'sales':
        recommendations = await AISystem.analyzeSales(data.metrics);
        break;
      case 'strategy':
        recommendations = await AISystem.analyzeStrategy(data.features, data.userGrowth);
        break;
      case 'comprehensive':
        recommendations = await AISystem.getComprehensiveAnalysis(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        );
    }

    // Save recommendations to database
    const dbRecommendations = Array.isArray(recommendations) 
      ? recommendations 
      : recommendations.all || [];

    const convertedRecommendations = dbRecommendations.map(rec => ({
      agent_role: rec.role,
      type: rec.type,
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      action_items: rec.actionItems || [],
      estimated_impact: rec.estimatedImpact,
      status: 'pending' as const,
    }));

    await aiRecommendationsDB.saveRecommendations(convertedRecommendations);

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform AI analysis' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentRole = searchParams.get('agentRole');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status') || 'pending';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const recommendations = await aiRecommendationsDB.getRecommendations({
      agent_role: agentRole || undefined,
      priority: priority || undefined,
      status: status as any,
      limit,
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
