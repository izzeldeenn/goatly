'use client';

import { useEffect, useState } from 'react';
import { userDB } from '@/lib/supabase';
import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalStudyTime: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const users = await userDB.getAllUsers();
        
        const totalUsers = users.length;
        const activeUsers = users.filter(user => {
          const lastActive = new Date(user.last_active);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return lastActive > sevenDaysAgo;
        }).length;

        setStats({
          totalUsers,
          activeUsers,
          totalStudyTime: 0 // Will be calculated from daily activity if needed
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Active Users (7d)',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Study Sessions',
      value: stats.totalStudyTime,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}
