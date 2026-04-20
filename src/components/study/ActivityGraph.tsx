'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { ActivityContribution } from '@/lib/dailyActivity';

interface ActivityGraphProps {
  contributions: ActivityContribution[];
  username?: string;
}

export function ActivityGraph({ contributions, username }: ActivityGraphProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const [hoveredContribution, setHoveredContribution] = useState<ActivityContribution | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate dates for the last 52 weeks (GitHub style)
  const generateDateGrid = () => {
    const dates: string[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 52 * 7); // 52 weeks back

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
  };

  const allDates = generateDateGrid();
  const contributionsMap = new Map(contributions.map(c => [c.date, c]));

  // Group dates by weeks
  const weeks: string[][] = [];
  for (let i = 0; i < allDates.length; i += 7) {
    weeks.push(allDates.slice(i, i + 7));
  }
  
  // Reverse weeks to show most recent first (left to right)
  weeks.reverse();
  
  // Reverse days within each week to show most recent day at the top
  weeks.forEach(week => week.reverse());

  // Generate month labels for the top header
  const generateMonthLabels = () => {
    if (weeks.length === 0) return [];
    
    const labels: { month: string; startWeek: number; spanWeeks: number }[] = [];
    const isArabic = t.rank === 'ترتيب';
    
    const monthNames = isArabic ? [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ] : [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    let currentMonth = -1;
    let monthStartWeek = 0;
    
    weeks.forEach((week: string[], weekIndex: number) => {
      if (week.length > 0) {
        const firstDate = new Date(week[0] + 'T00:00:00');
        const month = firstDate.getMonth();
        
        if (month !== currentMonth) {
          // Close previous month if exists
          if (currentMonth !== -1) {
            const lastLabel = labels[labels.length - 1];
            lastLabel.spanWeeks = weekIndex - monthStartWeek;
          }
          
          // Start new month
          labels.push({
            month: monthNames[month],
            startWeek: weekIndex,
            spanWeeks: 1
          });
          
          currentMonth = month;
          monthStartWeek = weekIndex;
        }
      }
    });
    
    // Close last month
    if (labels.length > 0) {
      const lastLabel = labels[labels.length - 1];
      lastLabel.spanWeeks = weeks.length - monthStartWeek;
    }
    
    return labels;
  };

  const monthLabels = generateMonthLabels();

  // Get activity color based on level
  const getActivityColor = (level: number) => {
    if (theme === 'light') {
      switch (level) {
        case 0: return '#ebedf0'; // No activity
        case 1: return '#9be9a8'; // Light activity
        case 2: return '#40c463'; // Medium activity
        case 3: return '#30a14e'; // High activity
        case 4: return '#216e39'; // Very high activity
        case 5: return '#0e4429'; // Maximum activity
        default: return '#ebedf0';
      }
    } else {
      switch (level) {
        case 0: return '#1a1a1a'; // No activity - pure black in dark mode
        case 1: return '#0e4429'; // Light activity
        case 2: return '#006d32'; // Medium activity
        case 3: return '#26a641'; // High activity
        case 4: return '#39d353'; // Very high activity
        case 5: return '#4ae056'; // Maximum activity
        default: return '#1a1a1a';
      }
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const locale = t.rank === 'ترتيب' ? 'ar-SA' : 'en-US';
    return date.toLocaleDateString(locale, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format study time
  const formatStudyTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}${t.timeToday.includes('وقت') ? 'ث' : 's'}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}${t.timeToday.includes('وقت') ? 'د' : 'm'} ${secs}${t.timeToday.includes('وقت') ? 'ث' : 's'}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}${t.timeToday.includes('وقت') ? 'س' : 'h'} ${mins}${t.timeToday.includes('وقت') ? 'د' : 'm'}`;
    }
  };

  // Calculate stats
  const totalContributions = contributions.length;
  const totalStudySeconds = contributions.reduce((sum, c) => sum + c.studySeconds, 0);
  const totalPoints = contributions.reduce((sum, c) => sum + c.pointsEarned, 0);
  const currentStreak = calculateCurrentStreak(contributions);

  function calculateCurrentStreak(contributions: ActivityContribution[]): number {
    if (contributions.length === 0) return 0;
    
    // Create a Set of dates with study seconds > 0 for faster lookup
    const studyDates = new Set(
      contributions
        .filter(c => c.studySeconds > 0)
        .map(c => c.date)
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
 
    // Check backwards from today
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      

      if (studyDates.has(dateStr)) {
        streak++;
      } else {
        break; // Break on first day without study
      }
    }

    return streak;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h3 className={`text-xl font-bold mb-3 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          {username ? `${username}${t.rank === 'ترتيب' ? "'s " : "'s "}` : ''}{t.rank === 'ترتيب' ? 'نظرة عامة على النشاط' : 'Activity Overview'}
        </h3>
        
        {/* Stats */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className={`px-3 py-1.5 rounded-lg ${
            theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-black text-gray-300'
          }`}>
            <span className="font-semibold">{totalContributions}</span> {t.rank === 'ترتيب' ? 'مساهمات' : 'contributions'}
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${
            theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-black text-gray-300'
          }`}>
            <span className="font-semibold">{formatStudyTime(totalStudySeconds)}</span> {t.rank === 'ترتيب' ? 'تمت الدراسة' : 'studied'}
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${
            theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-black text-gray-300'
          }`}>
            <span className="font-semibold">{totalPoints}</span> {t.points}
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${
            theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-black text-gray-300'
          }`}>
            <span className="font-semibold">{currentStreak}</span> {t.rank === 'ترتيب' ? 'يوم متواصل' : 'day streak'}
          </div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="mb-5">
        <div className="flex items-start gap-3">
          {/* Month labels */}
          <div className={`flex flex-col justify-between text-xs font-medium ${
            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
          }`} style={{ height: '112px' }}>
            <div>{t.rank === 'ترتيب' ? 'يناير' : 'Jan'}</div>
            <div>{t.rank === 'ترتيب' ? 'مارس' : 'Mar'}</div>
            <div>{t.rank === 'ترتيب' ? 'مايو' : 'May'}</div>
            <div>{t.rank === 'ترتيب' ? 'يوليو' : 'Jul'}</div>
            <div>{t.rank === 'ترتيب' ? 'سبتمبر' : 'Sep'}</div>
            <div>{t.rank === 'ترتيب' ? 'نوفمبر' : 'Nov'}</div>
          </div>
          
          {/* Graph grid */}
          <div className="flex-1 overflow-x-auto pb-2">
            <div className="flex gap-1.5" style={{ minWidth: `${weeks.length * 16}px` }}>
              {weeks.map((week: string[], weekIndex: number) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                  {week.map((date: string, dayIndex: number) => {
                    const contribution = contributionsMap.get(date);
                    const level = contribution?.level || 0;
                    const isSelected = selectedDate === date;
                    
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3.5 h-3.5 rounded cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-gray-400 ring-offset-2 scale-110' 
                            : 'hover:scale-125'
                        }`}
                        style={{
                          backgroundColor: getActivityColor(level),
                          opacity: isSelected ? 1 : (level > 0 ? 0.9 : 0.4)
                        }}
                        onMouseEnter={() => setHoveredContribution(contribution || null)}
                        onMouseLeave={() => setHoveredContribution(null)}
                        onClick={() => setSelectedDate(isSelected ? null : date)}
                        title={contribution ? 
                          `${formatDate(date)}: ${formatStudyTime(contribution.studySeconds)} studied, ${contribution.pointsEarned} points` :
                          `${formatDate(date)}: No activity`
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`flex items-center justify-between text-xs font-medium ${
        theme === 'light' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div>{t.rank === 'ترتيب' ? 'أقل' : 'Less'}</div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className="w-3.5 h-3.5 rounded transition-transform hover:scale-125"
              style={{ backgroundColor: getActivityColor(level) }}
            />
          ))}
        </div>
        <div>{t.rank === 'ترتيب' ? 'أكثر' : 'More'}</div>
      </div>

      {/* Hover tooltip */}
      {hoveredContribution && (
        <div className={`fixed z-[999999] p-3 rounded-xl shadow-2xl text-xs border ${
          theme === 'light' ? 'bg-white text-gray-900 border-gray-200' : 'bg-black text-gray-100 border-gray-700'
        }`}
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          backgroundColor: theme === 'light' ? '#ffffff' : '#000000'
        }}
        >
          <div className="font-semibold mb-1.5">{formatDate(hoveredContribution.date)}</div>
          <div className="space-y-1">
            <div>{formatStudyTime(hoveredContribution.studySeconds)} {t.rank === 'ترتيب' ? 'تمت الدراسة' : 'studied'}</div>
            <div>{hoveredContribution.pointsEarned} {t.points}</div>
            {hoveredContribution.rank && (
              <div>{t.rank === 'ترتيب' ? 'الترتيب' : 'Rank'}: #{hoveredContribution.rank}</div>
            )}
          </div>
        </div>
      )}

      {/* Selected date details */}
      {selectedDate && contributionsMap.has(selectedDate) && (
        <div className={`mt-5 p-5 rounded-xl border ${
          theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-black border-gray-700'
        }`}>
          <h4 className={`font-bold mb-3 ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {formatDate(selectedDate)} Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Study Time
              </span>
              <div className={`font-semibold mt-1 ${
                theme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                {formatStudyTime(contributionsMap.get(selectedDate)!.studySeconds)}
              </div>
            </div>
            <div>
              <span className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Points Earned
              </span>
              <div className={`font-semibold mt-1 ${
                theme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                {contributionsMap.get(selectedDate)!.pointsEarned}
              </div>
            </div>
            {contributionsMap.get(selectedDate)!.rank && (
              <div>
                <span className={`text-xs font-medium uppercase tracking-wide ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Daily Rank
                </span>
                <div className={`font-semibold mt-1 ${
                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                }`}>
                  #{contributionsMap.get(selectedDate)!.rank}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
