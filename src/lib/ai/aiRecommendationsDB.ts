// Database service for AI recommendations

import { supabase } from '../supabase';

export interface AIRecommendation {
  id: string;
  agent_role: 'developer' | 'user_behavior_analyst' | 'sales_manager' | 'strategic_analyst';
  type: 'improvement' | 'bug_fix' | 'feature' | 'strategy' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action_items: string[];
  estimated_impact?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  implemented_at?: string;
  created_at: string;
  updated_at: string;
}

export class AIRecommendationsDB {
  private static instance: AIRecommendationsDB;

  static getInstance(): AIRecommendationsDB {
    if (!AIRecommendationsDB.instance) {
      AIRecommendationsDB.instance = new AIRecommendationsDB();
    }
    return AIRecommendationsDB.instance;
  }

  async saveRecommendations(recommendations: Partial<AIRecommendation>[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .insert(
          recommendations.map(rec => ({
            agent_role: rec.agent_role,
            type: rec.type,
            priority: rec.priority,
            title: rec.title,
            description: rec.description,
            action_items: rec.action_items || [],
            estimated_impact: rec.estimated_impact,
            status: rec.status || 'pending',
          }))
        );

      if (error) {
        console.error('Error saving AI recommendations:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveRecommendations:', error);
      throw error;
    }
  }

  async getRecommendations(filters?: {
    agent_role?: string;
    priority?: string;
    status?: string;
    limit?: number;
  }): Promise<AIRecommendation[]> {
    try {
      let query = supabase
        .from('ai_recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.agent_role) {
        query = query.eq('agent_role', filters.agent_role);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching AI recommendations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      return [];
    }
  }

  async updateRecommendationStatus(
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  ): Promise<void> {
    try {
      const updates: any = { status };
      
      if (status === 'completed') {
        updates.implemented_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ai_recommendations')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating recommendation status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateRecommendationStatus:', error);
      throw error;
    }
  }

  async deleteRecommendation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting recommendation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteRecommendation:', error);
      throw error;
    }
  }

  async getRecommendationsByPriority(): Promise<{
    critical: AIRecommendation[];
    high: AIRecommendation[];
    medium: AIRecommendation[];
    low: AIRecommendation[];
  }> {
    try {
      const [critical, high, medium, low] = await Promise.all([
        this.getRecommendations({ priority: 'critical', status: 'pending' }),
        this.getRecommendations({ priority: 'high', status: 'pending' }),
        this.getRecommendations({ priority: 'medium', status: 'pending' }),
        this.getRecommendations({ priority: 'low', status: 'pending' }),
      ]);

      return { critical, high, medium, low };
    } catch (error) {
      console.error('Error in getRecommendationsByPriority:', error);
      return { critical: [], high: [], medium: [], low: [] };
    }
  }

  async getRecommendationStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    dismissed: number;
    byRole: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('status, agent_role, priority');

      if (error || !data) {
        return {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          dismissed: 0,
          byRole: {},
          byPriority: {},
        };
      }

      const stats = {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        inProgress: data.filter(r => r.status === 'in_progress').length,
        completed: data.filter(r => r.status === 'completed').length,
        dismissed: data.filter(r => r.status === 'dismissed').length,
        byRole: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      };

      data.forEach(rec => {
        stats.byRole[rec.agent_role] = (stats.byRole[rec.agent_role] || 0) + 1;
        stats.byPriority[rec.priority] = (stats.byPriority[rec.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error in getRecommendationStats:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        dismissed: 0,
        byRole: {},
        byPriority: {},
      };
    }
  }
}

export const aiRecommendationsDB = AIRecommendationsDB.getInstance();
