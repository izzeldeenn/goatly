// Hook for using AI system in components

import { useState, useCallback } from 'react';
import { AISystem, AgentRole, AgentRecommendation } from '@/lib/ai';
import { aiRecommendationsDB, AIRecommendation } from '@/lib/ai/aiRecommendationsDB';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCode = useCallback(async (filePath: string, fileContent: string) => {
    setLoading(true);
    setError(null);
    try {
      const recommendations = await AISystem.analyzeCode(filePath, fileContent);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeUserBehavior = useCallback(async (dailyActivities: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const recommendations = await AISystem.analyzeUserBehavior(dailyActivities);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeSales = useCallback(async (metrics: any) => {
    setLoading(true);
    setError(null);
    try {
      const recommendations = await AISystem.analyzeSales(metrics);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeStrategy = useCallback(async (features: string[], userGrowth: number) => {
    setLoading(true);
    setError(null);
    try {
      const recommendations = await AISystem.analyzeStrategy(features, userGrowth);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getComprehensiveAnalysis = useCallback(async (data: {
    code?: any;
    userBehavior?: any;
    sales?: any;
    project?: any;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await AISystem.getComprehensiveAnalysis(data);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    analyzeCode,
    analyzeUserBehavior,
    analyzeSales,
    analyzeStrategy,
    getComprehensiveAnalysis,
  };
}

export function useAIRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (filters?: {
    agent_role?: string;
    priority?: string;
    status?: string;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiRecommendationsDB.getRecommendations(filters);
      setRecommendations(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecommendationStatus = useCallback(async (
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  ) => {
    try {
      await aiRecommendationsDB.updateRecommendationStatus(id, status);
      // Refresh recommendations
      await fetchRecommendations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, [fetchRecommendations]);

  const deleteRecommendation = useCallback(async (id: string) => {
    try {
      await aiRecommendationsDB.deleteRecommendation(id);
      // Refresh recommendations
      await fetchRecommendations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, [fetchRecommendations]);

  const getRecommendationsByPriority = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiRecommendationsDB.getRecommendationsByPriority();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendationStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await aiRecommendationsDB.getRecommendationStats();
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    updateRecommendationStatus,
    deleteRecommendation,
    getRecommendationsByPriority,
    getRecommendationStats,
  };
}
