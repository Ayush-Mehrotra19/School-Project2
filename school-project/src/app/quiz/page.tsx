'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Home,
  Check
} from 'lucide-react';
import { QuizQuestion, quizAIService } from '../quizzer/lib/quizAIService';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { quizSessionService } from '@/services/quizSessionService';
import './quiz.css';

interface UserAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Quiz configuration
  const [quizData, setQuizData] = useState<{
    subject: string;
    chapters: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
  } | null>(null);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [phase, setPhase] = useState<'loading' | 'active' | 'results' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer state
  const [totalSeconds, setTotalSeconds] = useState(600); // 10 minutes default
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Parse quiz config from query parameters
  useEffect(() => {
    const rawParam = searchParams.get('quizData');
    if (!rawParam) {
      setErrorMessage('No quiz settings found. Please start a quiz from the setup menu.');
      setPhase('error');
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(rawParam));
      if (!parsed.subject) {
        throw new Error('Subject is required');
      }
      const count = Number(parsed.questionCount) || 10;
      const initialSeconds = count * 90; // 1.5 minutes per question
      setTotalSeconds(initialSeconds);
      setTimeLeft(initialSeconds);
      setQuizData({
        subject: parsed.subject,
        chapters: parsed.chapters || [],
        difficulty: parsed.difficulty || 'medium',
        questionCount: count
      });
    } catch (e) {
      console.error('Quiz parameter parse error:', e);
      setErrorMessage('Failed to parse quiz configuration. Please try setting up a new quiz.');
      setPhase('error');
    }
  }, [searchParams]);

  // Load questions when config is ready
  useEffect(() => {
    if (!quizData) return;

    let isMounted = true;

    async function loadQuiz() {
      try {
        setPhase('loading');
        setErrorMessage(null);

        // Try creating session in Supabase (silent fallback if offline)
        try {
          await quizSessionService.createSession({
            subject: quizData!.subject,
            chapters: quizData!.chapters,
            difficulty: quizData!.difficulty,
            questionCount: quizData!.questionCount
          });
        } catch (sessErr) {
          console.warn('Session DB creation skipped/offline, continuing locally:', sessErr);
        }

        // Fetch questions via QuizAIService (uses Python FastAPI with smart fallback)
        const generated = await quizAIService.generateQuiz({
          subject: quizData!.subject,
          chapters: quizData!.chapters,
          difficulty: quizData!.difficulty,
          questionCount: quizData!.questionCount
        });

        if (!isMounted) return;

        if (!generated || generated.length === 0) {
          throw new Error('No questions could be generated. Please try again.');
        }

        setQuestions(generated);
        setAnswers({});
        setCurrentIdx(0);
        setPhase('active');
        questionStartTimeRef.current = Date.now();
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error generating quiz:', err);
        setErrorMessage(err.message || 'Failed to initialize quiz. Please try again.');
        setPhase('error');
      }
    }

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [quizData]);

  // Auto-finish quiz handler
  const handleFinishQuiz = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('results');

    try {
      await quizSessionService.completeSession();
    } catch (e) {
      console.warn('Quiz DB completion skipped/offline:', e);
    }
  }, []);

  // Timer Interval Effect
  useEffect(() => {
    if (phase !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, handleFinishQuiz]);

  // Select an answer (Instant feedback)
  const handleSelectOption = (optionIndex: number) => {
    const currQ = questions[currentIdx];
    if (!currQ) return;

    // If already answered this question, don't allow changing
    if (answers[currQ.id]) return;

    const isCorrect = optionIndex === currQ.correctAnswer;
    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));

    const newAnswer: UserAnswer = {
      questionId: currQ.id,
      selectedOption: optionIndex,
      isCorrect,
      timeSpentSeconds: timeSpent
    };

    setAnswers(prev => ({
      ...prev,
      [currQ.id]: newAnswer
    }));

    // Save to DB in background if available
    try {
      quizSessionService.saveAnswer(currQ.dbId || currQ.id, optionIndex, isCorrect);
    } catch (err) {
      // Non-blocking
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIdx(index);
      questionStartTimeRef.current = Date.now();
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Performance calculations
  const totalAnswered = Object.keys(answers).length;
  const correctAnswersCount = Object.values(answers).filter(a => a.isCorrect).length;
  const incorrectCount = totalAnswered - correctAnswersCount;
  const scorePercentage = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;
  const timeTakenSeconds = totalSeconds - timeLeft;

  const currentQ = questions[currentIdx];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const hasAnsweredCurrent = !!currentAnswer;

  // Render Loading Phase
  if (phase === 'loading') {
    return (
      <AuthGuard>
        <div className="quiz-shell">
          <div className="quiz-loader-card">
            <div className="quiz-pulse-ring">
              <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">Generating Your {quizData?.subject || 'Practice'} Quiz</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-sm text-center">
              AI is crafting custom questions tailored to your chosen chapters and difficulty level...
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Render Error Phase
  if (phase === 'error') {
    return (
      <AuthGuard>
        <div className="quiz-shell">
          <div className="quiz-loader-card">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">Could Not Start Quiz</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-sm text-center">
              {errorMessage || 'An error occurred while preparing your quiz.'}
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => router.push('/quizzer')} className="quiz-btn-primary">
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Quiz Setup
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Render Results Phase
  if (phase === 'results') {
    const mistakes = questions.filter(q => {
      const ans = answers[q.id];
      return !ans || !ans.isCorrect;
    });

    return (
      <AuthGuard>
        <div className="quiz-shell">
          <div className="quiz-results-container">
            {/* Header Trophy Banner */}
            <div className="quiz-results-hero">
              <div className="trophy-badge">
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mt-3">Quiz Completed!</h1>
              <p className="text-gray-300 text-sm mt-1">
                {scorePercentage >= 80
                  ? '🌟 Outstanding performance! You demonstrated mastery of this material.'
                  : scorePercentage >= 60
                  ? '👍 Good effort! Review the missed questions below to solidify your understanding.'
                  : '💪 Keep practicing! Check the detailed explanations below to improve.'}
              </p>
            </div>

            {/* Score Grid */}
            <div className="quiz-stats-grid">
              <div className="quiz-stat-box score-box">
                <div className="score-ring">
                  <span className="text-3xl font-black text-yellow-300">{scorePercentage}%</span>
                </div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider mt-2">Final Score</span>
              </div>

              <div className="quiz-stat-box">
                <div className="text-2xl font-extrabold text-green-400">{correctAnswersCount} / {questions.length}</div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Correct Answers</span>
              </div>

              <div className="quiz-stat-box">
                <div className="text-2xl font-extrabold text-red-400">{incorrectCount}</div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Mistakes / Skipped</span>
              </div>

              <div className="quiz-stat-box">
                <div className="text-2xl font-extrabold text-blue-400">{formatTime(timeTakenSeconds)}</div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Time Elapsed</span>
              </div>
            </div>

            {/* Mistakes & Detailed Review */}
            {mistakes.length > 0 && (
              <div className="quiz-review-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-yellow-400" />
                    Review & Explanations ({mistakes.length})
                  </h3>
                  <span className="text-xs text-gray-400">Study these concepts to boost your score</span>
                </div>

                <div className="quiz-review-list">
                  {mistakes.map((q, idx) => {
                    const ans = answers[q.id];
                    return (
                      <div key={q.id} className="quiz-review-card">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span className="font-semibold text-yellow-400">{q.subject} • {q.chapter}</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-medium">
                            {ans ? 'Incorrect' : 'Unanswered'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-3">{q.question}</h4>
                        
                        <div className="space-y-1.5 text-xs mb-3">
                          {q.options.map((opt, oIdx) => {
                            const isCorrectOpt = oIdx === q.correctAnswer;
                            const isUserSelected = ans && ans.selectedOption === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg flex items-center justify-between ${
                                  isCorrectOpt
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : isUserSelected
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : 'bg-white/5 text-gray-400'
                                }`}
                              >
                                <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                {isCorrectOpt && <Check className="w-4 h-4 text-green-400" />}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="quiz-review-explanation">
                            <strong className="text-yellow-300">Explanation: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="quiz-results-actions">
              <button onClick={() => router.push('/quizzer')} className="quiz-btn-secondary">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Quiz Setup
              </button>
              <button onClick={() => router.push('/dashboard')} className="quiz-btn-primary">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Active Quiz View
  return (
    <AuthGuard>
      <div className="quiz-shell">
        <div className="quiz-main-container">
          {/* Top Bar: Subject, Timer, Progress */}
          <header className="quiz-topbar">
            <div>
              <div className="flex items-center gap-2">
                <span className="quiz-pill-subject">{quizData?.subject}</span>
                <span className="quiz-pill-difficulty">{quizData?.difficulty}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Question {currentIdx + 1} <span className="text-gray-400 text-sm font-normal">of {questions.length}</span>
              </h2>
            </div>

            {/* Countdown Timer */}
            <div className={`quiz-timer-badge ${timeLeft < 120 ? 'quiz-timer-urgent' : ''}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold tracking-wide">{formatTime(timeLeft)}</span>
            </div>
          </header>

          {/* Question Nav Dots Track */}
          <div className="quiz-dots-track">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              let statusClass = 'dot-unanswered';
              if (idx === currentIdx) {
                statusClass = 'dot-current';
              } else if (ans) {
                statusClass = ans.isCorrect ? 'dot-correct' : 'dot-incorrect';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`quiz-dot ${statusClass}`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          {currentQ && (
            <div className="quiz-question-card">
              <div className="quiz-question-header">
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                  Chapter: {currentQ.chapter}
                </span>
                <span className="text-xs text-gray-400">
                  {hasAnsweredCurrent ? (currentAnswer?.isCorrect ? '✓ Correct' : '✗ Incorrect') : 'Select one answer'}
                </span>
              </div>

              <h3 className="quiz-question-title">{currentQ.question}</h3>

              {/* Options List */}
              <div className="quiz-options-list">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = currentAnswer?.selectedOption === optIdx;
                  const isCorrect = optIdx === currentQ.correctAnswer;
                  
                  let optionClass = 'quiz-opt-default';
                  if (hasAnsweredCurrent) {
                    if (isCorrect) {
                      optionClass = 'quiz-opt-correct';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'quiz-opt-wrong';
                    } else {
                      optionClass = 'quiz-opt-disabled';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={hasAnsweredCurrent}
                      className={`quiz-option-btn ${optionClass}`}
                    >
                      <div className="quiz-opt-badge">
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="quiz-opt-text">{optionText}</span>
                      {hasAnsweredCurrent && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 ml-2" />
                      )}
                      {hasAnsweredCurrent && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Box */}
              {hasAnsweredCurrent && currentQ.explanation && (
                <div className={`quiz-explanation-box ${currentAnswer.isCorrect ? 'exp-correct' : 'exp-incorrect'}`}>
                  <div className="flex items-center gap-2 font-bold mb-1 text-sm">
                    {currentAnswer.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">Well Done! That's Correct.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-300">Not Quite. Correct Answer: {String.fromCharCode(65 + currentQ.correctAnswer)}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <footer className="quiz-bottom-nav">
            <button
              onClick={handlePrevious}
              disabled={currentIdx === 0}
              className="quiz-nav-btn quiz-nav-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="text-xs text-gray-400">
              {totalAnswered} of {questions.length} answered
            </div>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="quiz-nav-btn quiz-nav-next"
              >
                <span>{hasAnsweredCurrent ? 'Next Question' : 'Skip / Next'}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleFinishQuiz}
                className="quiz-nav-btn quiz-nav-finish"
              >
                <span>Submit & View Results</span>
                <Trophy className="w-4 h-4 ml-1.5" />
              </button>
            )}
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="quiz-loading-container min-h-screen bg-[#08090f] flex items-center justify-center text-yellow-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold">Loading NCERT Quiz Session...</p>
          </div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}