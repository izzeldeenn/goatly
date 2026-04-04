'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';

interface PDFStudyTimerProps {
  onClose?: () => void;
}

export function PDFStudyTimer({ onClose }: PDFStudyTimerProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const { getCurrentUser, setTimerActive } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved PDF on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPdf = localStorage.getItem('pdf_study_file');
      if (savedPdf) {
        try {
          const pdfData = JSON.parse(savedPdf);
          setPdfUrl(pdfData.url);
          setPdfTitle(pdfData.title);
        } catch (error) {
          console.error('Error loading saved PDF:', error);
          localStorage.removeItem('pdf_study_file');
        }
      }
    }
  }, []);
  
  // Timer state
  const [time, setTime] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdf_timer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.time || 0;
      }
    }
    return 0;
  });
  const [isRunning, setIsRunning] = useState(false);
  const realtimeUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = { time };
      localStorage.setItem('pdf_timer_state', JSON.stringify(state));
    }
  }, [time]);

  useEffect(() => {
    if (isRunning) {
      setTimerActive(true);
      
      intervalRef.current = setInterval(() => {
        setTime((prevTime: number) => prevTime + 1);
      }, 1000);
      
      realtimeUpdateRef.current = setInterval(async () => {
        const currentUser = getCurrentUser();
        if (currentUser?.accountId) {
          updateSessionTime(120); // Update session time by 120 seconds (2 minutes)
        }
      }, 120000); // Update every 2 minutes
    } else {
      setTimerActive(false);
      if (realtimeUpdateRef.current) {
        clearInterval(realtimeUpdateRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (realtimeUpdateRef.current) {
        clearInterval(realtimeUpdateRef.current);
      }
    };
  }, [isRunning]);

  
  // Timer functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.accountId) {
      return;
    }
    
    setIsRunning(true);
  };

  const handleStop = async () => {
    if (isRunning) {
      const currentUser = getCurrentUser();
      if (currentUser?.accountId) {
        await endSession(currentUser.accountId);
      }
    }
    setIsRunning(false);
  };

  const handleReset = async () => {
    if (isRunning) {
      await handleStop();
    }
    setTime(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pdf_timer_state');
    }
  };

  // Handle file upload - Open directly from device
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Set PDF URL and title for display
        setPdfUrl(result);
        setPdfTitle(file.name.replace('.pdf', ''));
        setIsLoading(false);
        
        // Save PDF to localStorage for persistence
        if (typeof window !== 'undefined') {
          const pdfData = {
            url: result,
            title: file.name.replace('.pdf', ''),
            fileName: file.name
          };
          localStorage.setItem('pdf_study_file', JSON.stringify(pdfData));
        }
        
        // Clear input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read PDF file');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  return (
    <div className={`w-full h-full flex flex-col ${
      theme === 'light' ? 'bg-white' : 'bg-gray-900'
    }`}>
      <div className="flex-1 flex flex-col items-center justify-center">
        {!pdfUrl ? (
          /* File Upload Section */
          <div className="w-full max-w-md">
            <h3 className={`text-lg font-semibold mb-6 text-center ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {t.rank === 'ترتيب' ? 'اختر ملف PDF للدراسة' : 'Select PDF File for Study'}
            </h3>

            {/* File Upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className={`block w-full p-6 text-center rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                  theme === 'light' 
                    ? 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700' 
                    : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                }`}
              >
                {isLoading ? (
                  <span>{t.rank === 'ترتيب' ? 'جاري التحميل...' : 'Loading...'}</span>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📄</div>
                    <span>{t.rank === 'ترتيب' ? 'اختر ملف PDF من جهازك' : 'Choose PDF File from Your Device'}</span>
                  </div>
                )}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg text-center ${
                theme === 'light' ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'
              }`}>
                {error}
              </div>
            )}
          </div>
        ) : (
          /* PDF Viewer Section - Full Screen */
          <div className="w-full h-full relative">
            {/* File Info - Top Bar */}
            <div className={`absolute top-4 left-4 z-50 px-3 py-2 rounded-lg shadow-lg border ${
              theme === 'light' 
                ? 'bg-white/90 border-gray-200 backdrop-blur-sm' 
                : 'bg-gray-800/90 border-gray-600 backdrop-blur-sm'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">📄</span>
                <div>
                  <h3 className={`text-sm font-semibold ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                  }`}>
                    {pdfTitle}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = `${pdfTitle}.pdf`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className={`ml-2 p-1 rounded transition-colors ${
                    theme === 'light' 
                      ? 'hover:bg-gray-100 text-gray-600' 
                      : 'hover:bg-gray-700 text-gray-400'
                  }`}
                  title="فتح في نافذة جديدة"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF Display - Full Screen with Native Browser */}
            <div className="w-full h-full relative">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={pdfTitle}
              />
            </div>

            {/* Floating Timer - Modern Design */}
            <div className="absolute bottom-4 right-4 z-50">
              <div
                className={`flex overflow-hidden rounded-lg divide-x mb-2 ${
                  theme === 'light' 
                    ? 'bg-white/90 border border-gray-200' 
                    : 'bg-gray-900/90 border border-gray-700 divide-gray-700'
                } rtl:flex-row-reverse`}
              >
                <button
                  onClick={handleReset}
                  className={`px-3 py-2 font-medium transition-colors duration-200 sm:px-4 ${
                    theme === 'light'
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </button>

                <button
                  onClick={isRunning ? handleStop : handleStart}
                  className={`px-3 py-2 font-medium transition-colors duration-200 sm:px-4 ${
                    theme === 'light'
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {isRunning ? (
                      <path
                        d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 015.25 16.5v-9z"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      ></path>
                    ) : (
                      <path
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      ></path>
                    )}
                  </svg>
                </button>
              </div>
              
              <div className={`text-2xl font-bold font-mono px-4 py-2 rounded-lg backdrop-blur-sm ${
                theme === 'light' 
                  ? 'text-white bg-black/50' 
                  : 'text-black bg-white/50'
              }`}>
                {formatTime(time)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
