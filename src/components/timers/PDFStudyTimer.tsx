'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';
import { useTimerState } from '@/hooks/useTimerState';
import { useTimerProgress } from '@/hooks/useTimerProgress';

interface PDFStudyTimerProps {
  onClose?: () => void;
}

export function PDFStudyTimer({ onClose }: PDFStudyTimerProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const { getCurrentUser } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  
  // Use timer state hook
  const {
    timerSettings,
    time,
    isRunning,
    hasHydrated,
    theme: timerTheme,
    handleStart,
    handleStop,
    handleReset,
    formatTime
  } = useTimerState();

  // Use timer progress hook
  const { getSessionDuration } = useStudySession();
  const sessionTime = getSessionDuration();
  
  const {
    coins,
    progressToNextPoint,
    minutesToNextPoint,
    secsToNextPoint,
    showStopConfirmation,
    handleStopClick,
    confirmStop,
    cancelStop,
    handleStartWithSound
  } = useTimerProgress(sessionTime, isRunning);

  const handleStartClick = () => handleStartWithSound(handleStart);
  const handleConfirmStop = () => confirmStop(handleStop);

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

  // Custom handle functions for PDF timer
  const handlePDFStart = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.accountId) {
      return;
    }
    handleStartClick();
  };

  const handlePDFStop = async () => {
    handleStopClick();
  };

  const handlePDFReset = async () => {
    handleReset();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pdf_study_file');
      setPdfUrl('');
      setPdfTitle('');
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
          /* File Upload Section - Modern Design */
          <div className="w-full max-w-lg p-8">
            <div className={`text-center mb-8`}>
              <div className="text-6xl mb-4">📚</div>
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>
                {t.rank === 'ترتيب' ? 'دراسة PDF' : 'PDF Study'}
              </h2>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {t.rank === 'ترتيب' ? 'اختر ملف PDF للبدء في الدراسة' : 'Select a PDF file to start studying'}
              </p>
            </div>

            {/* File Upload - Modern Card */}
            <div className="mb-6">
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
                className={`block w-full p-8 text-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  theme === 'light' 
                    ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600' 
                    : 'border-gray-600 hover:border-blue-500 hover:bg-blue-900/20 text-gray-400 hover:text-blue-400'
                }`}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span>{t.rank === 'ترتيب' ? 'جاري التحميل...' : 'Loading...'}</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-4">📄</div>
                    <span className={`font-medium ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.rank === 'ترتيب' ? 'اختر ملف PDF من جهازك' : 'Choose PDF File from Your Device'}
                    </span>
                    <p className={`text-xs mt-2 ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {t.rank === 'ترتيب' ? 'أو اسحب وأفلت الملف هنا' : 'or drag and drop file here'}
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-xl text-center ${
                theme === 'light' ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'
              }`}>
                {error}
              </div>
            )}
          </div>
        ) : (
          /* PDF Viewer Section - Full Screen */
          <div className="w-full h-full relative">
            {/* Header Bar - Modern Design */}
            <div className={`absolute top-0 left-0 right-0 z-50 px-6 py-4 border-b ${
              theme === 'light' 
                ? 'bg-white/95 border-gray-200 backdrop-blur-sm' 
                : 'bg-gray-800/95 border-gray-700 backdrop-blur-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-lg">📄</span>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      theme === 'light' ? 'text-gray-800' : 'text-white'
                    }`}>
                      {pdfTitle}
                    </h3>
                    <p className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      PDF Viewer
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Timer Display with Progress */}
                  <div className="flex flex-col items-center mr-4">
                    <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-white bg-[#222222]' : 'text-black bg-gray-100'
                    }`}>
                      {formatTime(time)}
                    </div>
                    
                    {/* Progress bar to next point */}
                    {isRunning && (
                      <div className="mt-2 w-40">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="10" fill="#FFD700"/>
                              <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#B8860B">$</text>
                            </svg>
                            <span className={`font-bold text-xs ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                              {coins}
                            </span>
                          </div>
                          <span className={`text-xs ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                            {minutesToNextPoint}:{secsToNextPoint.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="relative h-1.5 rounded-full overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                          <div
                            className="relative h-full transition-all duration-500 ease-out rounded-full"
                            style={{
                              width: `${progressToNextPoint}%`,
                              background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                              boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePDFReset}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-[#303030]'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
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
                      onClick={isRunning ? handlePDFStop : handlePDFStart}
                      disabled={!pdfUrl}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-[#303030]'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
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
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'light' 
                          ? 'hover:bg-gray-200 text-gray-600' 
                          : 'hover:bg-gray-700 text-gray-400'
                      }`}
                      title="فتح في نافذة جديدة"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>

                    <button
                      onClick={handlePDFReset}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'light' 
                          ? 'hover:bg-red-100 text-red-600' 
                          : 'hover:bg-red-900/30 text-red-400'
                      }`}
                      title="إغلاق"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Display - Full Screen */}
            <div className="w-full h-full pt-20">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={pdfTitle}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showStopConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 max-w-sm w-full ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {t.rank === 'ترتيب' ? 'تأكيد إيقاف التايمر' : 'Confirm Stop Timer'}
            </h3>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {t.rank === 'ترتيب' 
                ? 'إذا أوقفت التايمر الآن، ستفقد تركيزك ولن تحصل على النقاط لهذه الجلسة.'
                : 'If you stop the timer now, you will lose your focus and won\'t earn points for this session.'}
            </p>
            <div className="flex gap-3 rtl:flex-row-reverse">
              <button
                onClick={handleConfirmStop}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {t.rank === 'ترتيب' ? 'تأكيد الإيقاف' : 'Confirm Stop'}
              </button>
              <button
                onClick={cancelStop}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.rank === 'ترتيب' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
