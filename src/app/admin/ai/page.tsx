'use client';

import { useEffect, useState } from 'react';
import { useAIRecommendations } from '@/hooks/useAI';
import { useAI } from '@/hooks/useAI';
import { AIRecommendation, aiRecommendationsDB } from '@/lib/ai/aiRecommendationsDB';

export default function AIRecommendationsPage() {
  const { recommendations, loading, error, fetchRecommendations, updateRecommendationStatus, deleteRecommendation, getRecommendationStats } = useAIRecommendations();
  const { analyzeUserBehavior, analyzeSales, analyzeStrategy, analyzeCode } = useAI();
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadRecommendations();
    loadStats();
  }, []);

  const loadRecommendations = async () => {
    await fetchRecommendations({ status: 'pending' });
  };

  const loadStats = async () => {
    const statsData = await getRecommendationStats();
    setStats(statsData);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateRecommendationStatus(id, newStatus as any);
    await loadStats();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this recommendation?')) {
      await deleteRecommendation(id);
      await loadStats();
    }
  };

  const handleAnalyzeUserBehavior = async () => {
    setAnalyzing(true);
    try {
      // Use sample data for testing
      const sampleData = [
        {
          id: '1',
          account_id: 'user1',
          date: '2024-04-20',
          study_seconds: 3600,
          sessions_count: 3,
          focus_score: 75,
          points_earned: 360,
        },
        {
          id: '2',
          account_id: 'user2',
          date: '2024-04-20',
          study_seconds: 1800,
          sessions_count: 1,
          focus_score: 60,
          points_earned: 180,
        },
        {
          id: '3',
          account_id: 'user3',
          date: '2024-04-20',
          study_seconds: 7200,
          sessions_count: 5,
          focus_score: 85,
          points_earned: 720,
        },
        {
          id: '4',
          account_id: 'user4',
          date: '2024-04-20',
          study_seconds: 0,
          sessions_count: 0,
          focus_score: 50,
          points_earned: 0,
        },
        {
          id: '5',
          account_id: 'user5',
          date: '2024-04-20',
          study_seconds: 5400,
          sessions_count: 4,
          focus_score: 70,
          points_earned: 540,
        },
      ];
      
      const recommendations = await analyzeUserBehavior(sampleData);
      
      // Save recommendations to database
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        const convertedRecommendations = recommendations.map(rec => ({
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
      }
      
      await loadRecommendations();
      alert('User behavior analysis completed!');
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Analysis failed. Make sure HUGGINGFACE_API_KEY is set in .env.local');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeSales = async () => {
    setAnalyzing(true);
    try {
      const metrics = {
        totalUsers: 100,
        premiumUsers: 10,
        conversionRate: 10,
        churnRate: 5,
        avgRevenuePerUser: 2.5,
      };
      
      const recommendations = await analyzeSales(metrics);
      
      // Save recommendations to database
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        const convertedRecommendations = recommendations.map(rec => ({
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
      }
      
      await loadRecommendations();
      alert('Sales analysis completed!');
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Analysis failed. Make sure HUGGINGFACE_API_KEY is set in .env.local');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeStrategy = async () => {
    setAnalyzing(true);
    try {
      const features = ['Study Rooms', 'Pomodoro Timer', 'User Rankings', 'Daily Activity Tracking'];
      const userGrowth = 15;
      
      const recommendations = await analyzeStrategy(features, userGrowth);
      
      // Save recommendations to database
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        const convertedRecommendations = recommendations.map(rec => ({
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
      }
      
      await loadRecommendations();
      alert('Strategic analysis completed!');
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Analysis failed. Make sure HUGGINGFACE_API_KEY is set in .env.local');
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.agent_role === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'developer': return 'Developer';
      case 'user_behavior_analyst': return 'User Behavior Analyst';
      case 'sales_manager': return 'Sales Manager';
      case 'strategic_analyst': return 'Strategic Analyst';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Recommendations Dashboard</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-gray-400">Total Recommendations</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-gray-400">Pending</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
              <div className="text-gray-400">In Progress</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-gray-400">Completed</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('developer')}
            className={`px-4 py-2 rounded ${filter === 'developer' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Developer
          </button>
          <button
            onClick={() => setFilter('user_behavior_analyst')}
            className={`px-4 py-2 rounded ${filter === 'user_behavior_analyst' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            User Behavior
          </button>
          <button
            onClick={() => setFilter('sales_manager')}
            className={`px-4 py-2 rounded ${filter === 'sales_manager' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Sales
          </button>
          <button
            onClick={() => setFilter('strategic_analyst')}
            className={`px-4 py-2 rounded ${filter === 'strategic_analyst' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Strategy
          </button>
        </div>

        {/* AI Analysis Test Buttons */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Test AI Analysis</h3>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleAnalyzeUserBehavior}
              disabled={analyzing}
              className={`px-4 py-2 rounded ${analyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {analyzing ? 'Analyzing...' : 'Analyze User Behavior'}
            </button>
            <button
              onClick={handleAnalyzeSales}
              disabled={analyzing}
              className={`px-4 py-2 rounded ${analyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Sales'}
            </button>
            <button
              onClick={handleAnalyzeStrategy}
              disabled={analyzing}
              className={`px-4 py-2 rounded ${analyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Strategy'}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Make sure to set HUGGINGFACE_API_KEY in .env.local before testing
          </p>
        </div>

        {/* Recommendations List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-500 py-8">{error}</div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-gray-400 py-8">No recommendations found</div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <div key={rec.id} className="bg-gray-800 p-6 rounded-lg border-l-4" style={{ borderColor: getPriorityColor(rec.priority) }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        {getRoleLabel(rec.agent_role)}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                        {rec.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{rec.title}</h3>
                    <p className="text-gray-300 mb-4">{rec.description}</p>
                    {rec.estimated_impact && (
                      <p className="text-sm text-gray-400 mb-2">
                        <strong>Estimated Impact:</strong> {rec.estimated_impact}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={rec.status}
                      onChange={(e) => handleStatusChange(rec.id, e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {rec.action_items && rec.action_items.length > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold mb-2">Action Items:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {rec.action_items.map((item, index) => (
                        <li key={index} className="text-gray-300">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-4">
                  Created: {new Date(rec.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
