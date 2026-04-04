'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { activitySessionDB, ActivitySessionFrontend } from '@/lib/activitySessions';

interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isActive: boolean;
  studyTime: number; // accumulated time in seconds
  dbSessionId?: string; // ID from database
}

interface StudySessionContextType {
  currentSession: StudySession | null;
  isSessionActive: boolean;
  startSession: (accountId: string) => Promise<void>;
  endSession: (accountId: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  updateSessionTime: (additionalSeconds: number) => void;
  getSessionDuration: () => number;
  getTotalStudyTime: () => number;
  getTodaySessions: (accountId: string) => Promise<ActivitySessionFrontend[]>;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Load session state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('study_session');
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          // Check if the session is still valid (not too old)
          const sessionAge = Date.now() - new Date(sessionData.startTime).getTime();
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxSessionAge && sessionData.isActive) {
            setCurrentSession({
              ...sessionData,
              startTime: new Date(sessionData.startTime),
              endTime: sessionData.endTime ? new Date(sessionData.endTime) : undefined
            });
            setIsSessionActive(true);
          } else {
            // Clear old session
            localStorage.removeItem('study_session');
          }
        } catch (error) {
          console.error('Failed to load session:', error);
          localStorage.removeItem('study_session');
        }
      }
    }
  }, []);

  // Save session state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentSession) {
      localStorage.setItem('study_session', JSON.stringify(currentSession));
    }
  }, [currentSession]);

  const startSession = async (accountId: string) => {
    try {
      // Start session in database
      const dbSession = await activitySessionDB.startSession(accountId);
      
      const newSession: StudySession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date(),
        duration: 0,
        isActive: true,
        studyTime: 0,
        dbSessionId: dbSession.id
      };
      
      setCurrentSession(newSession);
      setIsSessionActive(true);
    } catch (error) {
      console.error('Failed to start session:', error);
      // Fallback to local-only session if database fails
      const newSession: StudySession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date(),
        duration: 0,
        isActive: true,
        studyTime: 0
      };
      
      setCurrentSession(newSession);
      setIsSessionActive(true);
    }
  };

  const endSession = async (accountId: string) => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date(),
        isActive: false,
        duration: currentSession.studyTime
      };
      
      setCurrentSession(endedSession);
      setIsSessionActive(false);
      
      // Calculate duration in minutes and points earned
      const durationMinutes = Math.floor(currentSession.studyTime / 60);
      const pointsEarned = Math.floor(currentSession.studyTime / 600); // 1 point per 10 minutes
      
      // End session in database if we have a DB session ID
      if (currentSession.dbSessionId) {
        try {
          await activitySessionDB.endSession(
            currentSession.dbSessionId,
            durationMinutes,
            pointsEarned
          );
          
          // Update daily activity
          await activitySessionDB.updateDailyActivityFromSession(
            accountId,
            durationMinutes,
            pointsEarned
          );
        } catch (error) {
          console.error('Failed to end session in database:', error);
        }
      }
      
      // Save completed session to history
      saveSessionToHistory(endedSession);
      
      // Clear current session from localStorage
      localStorage.removeItem('study_session');
    }
  };

  const pauseSession = () => {
    if (currentSession && currentSession.isActive) {
      setCurrentSession({
        ...currentSession,
        isActive: false
      });
      setIsSessionActive(false);
    }
  };

  const resumeSession = () => {
    if (currentSession && !currentSession.isActive) {
      setCurrentSession({
        ...currentSession,
        isActive: true
      });
      setIsSessionActive(true);
    }
  };

  const updateSessionTime = (additionalSeconds: number) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        studyTime: prev.studyTime + additionalSeconds,
        duration: prev.studyTime + additionalSeconds
      } : null);
    }
  };

  const getSessionDuration = () => {
    return currentSession ? currentSession.studyTime : 0;
  };

  const getTotalStudyTime = () => {
    return currentSession ? currentSession.studyTime : 0;
  };

  const getTodaySessions = async (accountId: string): Promise<ActivitySessionFrontend[]> => {
    try {
      return await activitySessionDB.getTodaySessions(accountId);
    } catch (error) {
      console.error('Failed to get today sessions:', error);
      return [];
    }
  };

  const saveSessionToHistory = (session: StudySession) => {
    if (typeof window !== 'undefined') {
      try {
        const history = JSON.parse(localStorage.getItem('study_session_history') || '[]');
        history.push({
          ...session,
          completedAt: new Date().toISOString()
        });
        
        // Keep only last 100 sessions
        if (history.length > 100) {
          history.splice(0, history.length - 100);
        }
        
        localStorage.setItem('study_session_history', JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save session to history:', error);
      }
    }
  };

  const value: StudySessionContextType = {
    currentSession,
    isSessionActive,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateSessionTime,
    getSessionDuration,
    getTotalStudyTime,
    getTodaySessions
  };

  return (
    <StudySessionContext.Provider value={value}>
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession() {
  const context = useContext(StudySessionContext);
  if (context === undefined) {
    throw new Error('useStudySession must be used within a StudySessionProvider');
  }
  return context;
}
