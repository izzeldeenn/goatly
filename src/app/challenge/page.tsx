'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useCoins } from '@/contexts/CoinsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { challengeDB, challengeSessionDB, userDB, waitingListDB, UserAccount, UserAccountFrontend } from '@/lib/supabase';
import { landingTexts } from '@/constants/landingTexts';

// Opponent interface
interface Opponent {
  id: string;
  username: string;
  avatar: string;
  score: number;
  studyTime: number;
  isStudying: boolean;
  studyStartTime?: number;
  lastActive: number;
  behavior: 'consistent' | 'competitive' | 'strategic';
  rank: number;
  level: number;
}

// Challenge state interface
interface ChallengeState {
  isActive: boolean;
  opponent: Opponent | null;
  startTime: number | null;
  userStudyTime: number;
  opponentStudyTime: number;
  winner: 'user' | 'opponent' | null;
  isUserStudying: boolean;
  challengeDuration: number; // Total challenge duration in seconds
  userProgress: number;
  opponentProgress: number;
  challengeId: string | null; // Database challenge ID
  userSessionId: string | null; // Database session ID for current user
  opponentSessionId: string | null; // Database session ID for opponent
}

// Arabic names for realistic opponents
const ARABIC_NAMES = [
  'أحمد محمد', 'فاطمة الزهراء', 'عبدالله خالد', 'مريم أحمد', 
  'يوسف عمر', 'عائشة علي', 'محمد عبدالرحمن', 'خديجة سعيد',
  'عمر حسن', 'نورا سالم', 'علي محمود', 'زينب خالد',
  'إبراهيم ياسر', 'سارة أحمد', 'عبدالرحمن محمد', 'ليلى حسن'
];

// Check if string is a URL
const isUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Generate DiceBear avatar URL
const generateAvatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

// Convert UserAccount to Opponent interface
const convertUserToOpponent = (user: UserAccount): Opponent => {
  const rank = Math.floor(user.score / 100) + 1;
  const level = Math.floor(user.score / 200) + 1;
  
  return {
    id: user.id || '',
    username: user.username,
    avatar: user.avatar || generateAvatar(user.account_id),
    score: user.score,
    studyTime: 0,
    isStudying: true,
    lastActive: new Date(user.last_active).getTime(),
    behavior: 'consistent',
    rank,
    level
  };
};

export default function ChallengePage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const texts = landingTexts[language];
  const { getCurrentUser, setTimerActive, isTimerActive } = useUser();
  const { coins, addCoins } = useCoins();
  const router = useRouter();
  
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    isActive: false,
    opponent: null,
    startTime: null,
    userStudyTime: 0,
    opponentStudyTime: 0,
    winner: null,
    isUserStudying: true, // Start studying immediately
    challengeDuration: 0,
    userProgress: 0,
    opponentProgress: 0,
    challengeId: null,
    userSessionId: null,
    opponentSessionId: null
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const opponentIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Find opponent using waiting list system
  const findOpponentFromWaitingList = async (currentUser: UserAccountFrontend): Promise<{ opponent: Opponent, matchEntry: any } | null> => {
    try {
      console.log('Finding opponent for user:', currentUser.id);
      // First, check if user is already in waiting list
      const existingEntry = await waitingListDB.getUserWaitingEntry(currentUser.id!);
      console.log('Existing entry:', existingEntry);
      
      if (existingEntry) {
        // User is already waiting, check for a match
        const match = await waitingListDB.findMatch(currentUser.id!);
        console.log('Match found:', match);
        if (match) {
          // Found a match! Get the opponent's user data
          const opponentUser = await userDB.getUserByAccountId(match.user_id);
          console.log('Opponent user:', opponentUser);
          if (opponentUser) {
            return {
              opponent: convertUserToOpponent(opponentUser),
              matchEntry: match
            };
          }
        }
        return null; // Still waiting
      }
      
      // Add user to waiting list
      console.log('Adding user to waiting list');
      await waitingListDB.addToWaitingList(currentUser.id!);
      
      // Check for immediate match
      const match = await waitingListDB.findMatch(currentUser.id!);
      console.log('Match found after adding:', match);
      if (match) {
        const opponentUser = await userDB.getUserById(match.user_id);
        console.log('Opponent user after adding:', opponentUser);
        if (opponentUser) {
          return {
            opponent: convertUserToOpponent(opponentUser),
            matchEntry: match
          };
        }
      }
      
      return null; // No match yet, user is now in waiting list
    } catch (error) {
      console.error('Error finding opponent from waiting list:', error);
      return null;
    }
  };

  // Update opponent progress from database
  const updateOpponentFromSession = async (sessionData: any) => {
    if (!challengeState.opponent) return;
    
    setChallengeState(prev => ({
      ...prev,
      opponentStudyTime: sessionData.study_time_seconds,
      opponentProgress: Math.min((sessionData.study_time_seconds / 600) * 100, 100)
    }));
  };

  // Start challenge
  const startChallenge = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      alert('يجب تسجيل الدخول للبدء في التحدي');
      return;
    }
    
    const currentUserId = currentUser.id;
    
    // Reset challenge state completely before starting new search
    resetChallenge();
    
    setIsSearching(true);
    setSearchProgress(0);

    // Subscribe to waiting list for real-time matching
    let matchFound = false;
    const subscription = waitingListDB.subscribeToWaitingList(async (payload) => {
      if (matchFound) return;
      
      // Check if a new user joined the waiting list
      if (payload.eventType === 'INSERT' && payload.new.user_id !== currentUserId) {
        // Try to find a match
        const result = await findOpponentFromWaitingList(currentUser);
        if (result && result.opponent) {
          matchFound = true;
          subscription?.unsubscribe();
          await startChallengeWithOpponent(currentUser, result.opponent, result.matchEntry);
        }
      }
    });

    // Initial check for existing matches
    const result = await findOpponentFromWaitingList(currentUser);
    if (result && result.opponent) {
      subscription?.unsubscribe();
      await startChallengeWithOpponent(currentUser, result.opponent, result.matchEntry);
      return;
    }

    // If no immediate match, show waiting UI
    setSearchProgress(50);
    
    // Keep checking for matches periodically
    const checkInterval = setInterval(async () => {
      if (matchFound) {
        clearInterval(checkInterval);
        return;
      }
      
      const result = await findOpponentFromWaitingList(currentUser);
      if (result && result.opponent) {
        matchFound = true;
        subscription?.unsubscribe();
        clearInterval(checkInterval);
        await startChallengeWithOpponent(currentUser, result.opponent, result.matchEntry);
      }
    }, 2000);

    // Auto-cancel after 5 minutes
    setTimeout(() => {
      if (!matchFound) {
        clearInterval(checkInterval);
        subscription?.unsubscribe();
        waitingListDB.removeFromWaitingList(currentUserId);
        setIsSearching(false);
        setSearchProgress(0);
        alert('لم يتم العثور على خصم خلال 5 دقائق. حاول مرة أخرى لاحقاً');
      }
    }, 5 * 60 * 1000);
  };

  // Start challenge with found opponent
  const startChallengeWithOpponent = async (currentUser: UserAccountFrontend, opponent: Opponent, matchEntry: any) => {
    const currentUserId = currentUser.id!;
    
    // Remove both users from waiting list
    await waitingListDB.removeFromWaitingList(currentUserId);
    await waitingListDB.removeFromWaitingList(matchEntry.user_id);
    
    // Create challenge in database
    const challenge = await challengeDB.createChallenge(currentUserId, opponent.id, 600);
    
    if (!challenge) {
      setIsSearching(false);
      setSearchProgress(0);
      alert('فشل إنشاء التحدي. حاول مرة أخرى');
      return;
    }
    
    // Create sessions for both users
    const userSession = await challengeSessionDB.createSession(challenge.id!, currentUserId);
    const opponentSession = await challengeSessionDB.createSession(challenge.id!, opponent.id);
    
    if (!userSession || !opponentSession) {
      setIsSearching(false);
      setSearchProgress(0);
      alert('فشل إنشاء جلسة التحدي. حاول مرة أخرى');
      return;
    }
    
    const startTime = Date.now();
    
    setChallengeState({
      isActive: true,
      opponent,
      startTime,
      userStudyTime: 0,
      opponentStudyTime: 0,
      winner: null,
      isUserStudying: true,
      challengeDuration: 0,
      userProgress: 0,
      opponentProgress: 0,
      challengeId: challenge.id!,
      userSessionId: userSession.id!,
      opponentSessionId: opponentSession.id!
    });
    
    setIsSearching(false);
    setSearchProgress(0);
    
    // Subscribe to opponent session updates
    challengeSessionDB.subscribeToChallengeSessions(challenge.id!, (payload) => {
      if (payload.new && payload.new.user_id === opponent.id) {
        updateOpponentFromSession(payload.new);
      }
    });
    
    // Start main timer
    intervalRef.current = setInterval(async () => {
      setChallengeState(prev => {
        console.log('Timer tick - startTime:', prev.startTime, 'userStudyTime:', prev.userStudyTime);
        if (!prev.startTime) {
          console.log('No startTime, skipping');
          return prev;
        }

        const now = Date.now();
        const elapsed = Math.floor((now - prev.startTime) / 1000);
        const newDuration = elapsed;
        const newUserTime = newDuration;
        const maxTime = 600;
        const newUserProgress = Math.min((newUserTime / maxTime) * 100, 100);

        console.log('Timer update - elapsed:', elapsed, 'newUserTime:', newUserTime);

        if (prev.userSessionId && prev.isUserStudying) {
          challengeSessionDB.updateSession(prev.userSessionId, newUserTime, true);
        }

        if (!prev.isUserStudying && prev.userStudyTime > 0) {
          endChallenge('opponent');
          return prev;
        }

        return {
          ...prev,
          challengeDuration: newDuration,
          userStudyTime: newUserTime,
          userProgress: newUserProgress
        };
      });

      // Points are calculated by endSession, not here
    }, 1000);
    
    setTimerActive(true);
  };

  // Handle user stopping study (user can only stop, not start)
  // Stop studying
  const stopStudying = async () => {
    if (!challengeState.isActive) return;
    
    // Update session in database to mark as not studying
    if (challengeState.userSessionId) {
      await challengeSessionDB.updateSession(challengeState.userSessionId, challengeState.userStudyTime, false);
    }
    
    setChallengeState(prev => ({
      ...prev,
      isUserStudying: false
    }));
  };

  // Handle user stopping study (user can only stop, not start)
  const handleUserStopStudy = () => {
    if (!challengeState.isActive || !challengeState.isUserStudying) return;
    
    stopStudying();
    
    setTimerActive(false);
    
    // User stopped, check if opponent is still studying
    if (challengeState.opponent?.isStudying) {
      endChallenge('opponent');
    }
  };

  // Check for winner (handled in main timer now)
  useEffect(() => {
    if (!challengeState.isActive || !challengeState.opponent) return;

    // This is now handled in the main timer interval
  }, [challengeState.isActive, challengeState.opponent]);

  const endChallenge = (winner: 'user' | 'opponent') => {
    setChallengeState(prev => ({
      ...prev,
      winner,
      isActive: false
    }));

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (opponentIntervalRef.current) {
      clearInterval(opponentIntervalRef.current);
      opponentIntervalRef.current = null;
    }

    setTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset challenge
  const resetChallenge = () => {
    clearInterval(intervalRef.current!);
    
    // Unsubscribe from sessions if exists
    if (challengeState.challengeId) {
      challengeSessionDB.unsubscribeFromChallengeSessions(challengeState.challengeId);
    }
    
    setChallengeState({
      isActive: false,
      opponent: null,
      startTime: null,
      userStudyTime: 0,
      opponentStudyTime: 0,
      winner: null,
      isUserStudying: true,
      challengeDuration: 0,
      userProgress: 0,
      opponentProgress: 0,
      challengeId: null,
      userSessionId: null,
      opponentSessionId: null
    });
    
    setTimerActive(false);
  };

  const goBack = async () => {
    await resetChallenge();
    router.push('/focus');
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (challengeState.challengeId) {
        challengeSessionDB.unsubscribeFromChallengeSessions(challengeState.challengeId);
      }
    };
  }, [challengeState.challengeId]);

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
        <button
          onClick={goBack}
          className="px-4 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة
        </button>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full">
        {!challengeState.isActive && !challengeState.winner && !isSearching && (
          /* Search Screen */
          <div className="text-center">
            <div className="mb-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-semibold text-gray-100 mb-4">
                ابدأ تحدي الدراسة
              </h2>
              <p className="text-gray-400 text-lg mb-2">
                ابحث عن متحدي وابدأ منافسة الدراسة
              </p>
              <p className="text-gray-500 text-sm">
                يبدأ التحدي تلقائياً عند العثور على خصم - أول من يتوقف يخسر
              </p>
            </div>
            
            <button
              onClick={startChallenge}
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-lg font-medium transition-colors"
            >
              البحث عن متحدي
            </button>
            
            <div className="mt-8 bg-gray-900 rounded-lg p-4 max-w-sm mx-auto">
              <h3 className="font-medium text-gray-100 mb-2">قواعد التحدي</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>الفائز هو من يدرس لفترة أطول</p>
                <p>عندما يتوقف أحد المتنافسين، يخسر التحدي</p>
              </div>
            </div>
          </div>
        )}

        {isSearching && (
          /* Searching Screen */
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                جاري البحث عن متحدي...
              </h2>
            </div>
            
            <div className="w-full max-w-sm mx-auto mb-6">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gray-900 h-full transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
              <p className="text-gray-400 mt-2 text-sm">{Math.floor(searchProgress)}%</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-gray-400 text-sm">يتم البحث عن منافس مناسب لك...</p>
            </div>
          </div>
        )}

        {challengeState.isActive && challengeState.opponent && (
          /* Active Challenge Screen */
          <div>
            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-4 bg-gray-900 border border-gray-700 rounded-lg px-6 py-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-100">
                    التحدي جارٍ
                  </h2>
                  <p className="text-gray-400 font-mono text-sm">
                    {formatTime(Math.floor((Date.now() - (challengeState.startTime || Date.now())) / 1000))}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Battle Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* User Card */}
              <div className={`bg-gray-900 border-2 rounded-lg p-6 transition-all ${
                challengeState.isUserStudying ? 'border-green-500' : 'border-gray-700 opacity-75'
              }`}>
                {/* Status Badge */}
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-4 ${
                  challengeState.isUserStudying ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {challengeState.isUserStudying ? 'نشط' : 'متوقف'}
                </div>
                
                <div className="text-center">
                  {/* User Avatar */}
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 p-1">
                      <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center">
                        {(() => {
                          const currentUser = getCurrentUser();
                          return currentUser?.avatar ? (
                            <img 
                              src={isUrl(currentUser.avatar) ? currentUser.avatar : generateAvatar(currentUser.avatar)}
                              alt="User Avatar" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <img 
                              src={generateAvatar(currentUser?.accountId || 'user')}
                              alt="User Avatar" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          );
                        })()}
                      </div>
                    </div>
                    {challengeState.isUserStudying && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{getCurrentUser()?.username || 'أنت'}</h3>
                  
                  {/* User Stats */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-center items-center gap-2 text-sm">
                      <span className="text-gray-400">المستوى:</span>
                      <span className="font-medium text-gray-100">{Math.floor(coins / 100) + 1}</span>
                    </div>
                    <div className="flex justify-center items-center gap-2 text-sm">
                      <span className="text-gray-400">العملات:</span>
                      <span className="font-medium text-gray-100">{coins}</span>
                    </div>
                  </div>
                  
                  {/* Study Time Display */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="text-2xl font-semibold text-gray-100 mb-1">
                      {formatTime(challengeState.userStudyTime)}
                    </div>
                    <div className="text-xs text-gray-400">وقت الدراسة</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{ width: `${challengeState.userProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="md:hidden flex items-center justify-center py-2">
                <div className="px-3 py-1 bg-gray-800 rounded text-sm font-medium text-gray-300">{texts.vs}</div>
              </div>

              {/* Opponent Card */}
              <div className={`bg-gray-900 border-2 rounded-lg p-6 transition-all ${
                challengeState.opponent.isStudying ? 'border-green-500' : 'border-gray-700 opacity-75'
              }`}>
                {/* Status Badge */}
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-4 ${
                  challengeState.opponent.isStudying ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {challengeState.opponent.isStudying ? 'نشط' : 'متوقف'}
                </div>
                
                <div className="text-center">
                  {/* Opponent Avatar */}
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 p-1">
                      <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center">
                        <img 
                          src={challengeState.opponent.avatar}
                          alt="Opponent Avatar" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    {challengeState.opponent.isStudying && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{challengeState.opponent.username}</h3>
                  
                  {/* Opponent Stats */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-center items-center gap-2 text-sm">
                      <span className="text-gray-400">المستوى:</span>
                      <span className="font-medium text-gray-100">{challengeState.opponent.rank}</span>
                    </div>
                    <div className="flex justify-center items-center gap-2 text-sm">
                      <span className="text-gray-400">العملات:</span>
                      <span className="font-medium text-gray-100">{challengeState.opponent.score}</span>
                    </div>
                  </div>
                  
                  {/* Study Time Display */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="text-2xl font-semibold text-gray-100 mb-1">
                      {formatTime(challengeState.opponentStudyTime)}
                    </div>
                    <div className="text-xs text-gray-400">وقت الدراسة</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{ width: `${challengeState.opponentProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* VS Badge - Desktop */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-gray-800 text-gray-300 rounded-full w-12 h-12 flex items-center justify-center font-medium text-sm">
                {texts.vs}
              </div>
            </div>

            {/* Control Button */}
            <div className="text-center">
              <button
                onClick={handleUserStopStudy}
                disabled={!challengeState.isUserStudying}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                إيقاف الدراسة
              </button>
            </div>

            {/* Challenge Info */}
            <div className="mt-6 bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-400">استراتيجية الخصم</p>
                  <p className="font-medium text-gray-100">
                    {challengeState.opponent.behavior === 'competitive' ? 'تنافسية' :
                     challengeState.opponent.behavior === 'consistent' ? 'منتظمة' : 'استراتيجية'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">حالة التحدي</p>
                  <p className="font-medium text-green-400">جارٍ</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-400">القاعدة</p>
                  <p className="font-medium text-gray-100">آخر من يتوقف يفوز</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {challengeState.winner && (
          /* Result Screen */
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">
                  {challengeState.winner === 'user' ? '🏆' : '😔'}
                </span>
              </div>
              <h2 className={`text-2xl font-semibold mb-2 ${
                challengeState.winner === 'user' ? 'text-gray-100' : 'text-gray-400'
              }`}>
                {challengeState.winner === 'user' ? 'لقد فزت!' : 'لقد خسرت'}
              </h2>
              <p className="text-gray-400">
                {challengeState.winner === 'user' 
                  ? 'أحسن عمل! لقد درست لفترة أطول من خصمك'
                  : 'حاول مرة أخرى في التحدي القادم'
                }
              </p>
            </div>

            {/* Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* User Result Card */}
              <div className={`bg-gray-900 border-2 rounded-lg p-6 ${
                challengeState.winner === 'user' ? 'border-green-500' : 'border-gray-700'
              }`}>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">أدائك</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-xl font-semibold text-gray-100 mb-1">
                        {formatTime(challengeState.userStudyTime)}
                      </div>
                      <div className="text-xs text-gray-400">وقت الدراسة</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">العملات:</span>
                      <span className="font-medium text-gray-100">{coins}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">المستوى:</span>
                      <span className="font-medium text-gray-100">{Math.floor(coins / 100) + 1}</span>
                    </div>
                  </div>
                  {challengeState.winner === 'user' && (
                    <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                      فائز!
                    </div>
                  )}
                </div>
              </div>

              {/* Opponent Result Card */}
              <div className={`bg-gray-900 border-2 rounded-lg p-6 ${
                challengeState.winner === 'opponent' ? 'border-green-500' : 'border-gray-700'
              }`}>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">الخصم</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-xl font-semibold text-gray-100 mb-1">
                        {formatTime(challengeState.opponentStudyTime)}
                      </div>
                      <div className="text-xs text-gray-400">وقت الدراسة</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">الاسم:</span>
                      <span className="font-medium text-gray-100">{challengeState.opponent?.username}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">العملات:</span>
                      <span className="font-medium text-gray-100">{challengeState.opponent?.score}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">المستوى:</span>
                      <span className="font-medium text-gray-100">{challengeState.opponent?.rank}</span>
                    </div>
                  </div>
                  {challengeState.winner === 'opponent' && (
                    <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                      فائز!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="bg-gray-900 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">إحصائيات التحدي</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-100">
                    {formatTime(challengeState.userStudyTime)}
                  </div>
                  <div className="text-xs text-gray-400">وقتك</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-100">
                    {formatTime(challengeState.opponentStudyTime)}
                  </div>
                  <div className="text-xs text-gray-400">وقت الخصم</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-100">
                    {formatTime(Math.abs(challengeState.userStudyTime - challengeState.opponentStudyTime))}
                  </div>
                  <div className="text-xs text-gray-400">فرق الوقت</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-100">
                    {formatTime(challengeState.challengeDuration)}
                  </div>
                  <div className="text-xs text-gray-400">مدة التحدي</div>
                </div>
              </div>
              {/* Test Button */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => addCoins(10, 'test', 'Test coins addition')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  إضافة 10 نقاط للتجربة
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startChallenge}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
              >
                تحدي جديد
              </button>
              <button
                onClick={resetChallenge}
                className="px-6 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-100 rounded-lg font-medium transition-colors"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
