'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Trophy,
  Target,
  Flame,
  Clock,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Award,
  GraduationCap,
  Play,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { NCERT_CURRICULUM } from '@/data/ncertCurriculum';
import './dashboard.css';

interface UserOverviewStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  recentQuizzes: Array<{
    id: string;
    subject: string;
    score: number;
    date: string;
    status: string;
  }>;
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState<string>('Scholar');
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [stats, setStats] = useState<UserOverviewStats>({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    recentQuizzes: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user session & real stats from Supabase
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const name =
            session.user.user_metadata?.display_name ||
            session.user.user_metadata?.username ||
            session.user.email?.split('@')[0] ||
            'Scholar';
          setUserName(name);

          // Fetch real quiz sessions
          const { data: sessions } = await supabase
            .from('quiz_sessions')
            .select('id, subject, score_percentage, status, created_at')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (sessions && sessions.length > 0) {
            const completed = sessions.filter(s => s.status === 'completed');
            const avg =
              completed.length > 0
                ? completed.reduce((sum, s) => sum + (s.score_percentage || 0), 0) / completed.length
                : 0;

            setStats({
              totalQuizzes: sessions.length,
              completedQuizzes: completed.length,
              averageScore: Math.round(avg),
              recentQuizzes: sessions.map(s => ({
                id: s.id,
                subject: s.subject,
                score: Math.round(s.score_percentage || 0),
                date: new Date(s.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                }),
                status: s.status
              }))
            });
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [supabase]);

  const quickSubjects = NCERT_CURRICULUM[selectedGrade]?.subjects || NCERT_CURRICULUM[10].subjects;

  const launchQuickQuiz = (subject: any) => {
    const quizConfig = {
      grade: selectedGrade,
      gradeLabel: `Class ${selectedGrade}`,
      subject: `${subject.name} (Class ${selectedGrade})`,
      subjectId: subject.id,
      chapters: subject.chapters.slice(0, 3),
      difficulty: 'medium',
      questionCount: 10
    };
    const encoded = encodeURIComponent(JSON.stringify(quizConfig));
    router.push(`/quiz?quizData=${encoded}`);
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <main className="db-root">
      {/* Ambient background glow */}
      <div className="db-orb db-orb-1" />
      <div className="db-orb db-orb-2" />

      <div className="db-content-area">
        {/* Welcome Hero Banner */}
        <div className="db-hero-glass">
          <div className="db-hero-left">
            <div className="db-badge-date">
              <span className="db-live-dot" />
              <span>{todayDate}</span>
            </div>
            <h1 className="db-hero-title">
              Welcome back, <span className="text-yellow-400">{userName}</span>!
            </h1>
            <p className="db-hero-sub">
              Master your NCERT curriculum through adaptive AI quizzes and real-time concept tracking.
            </p>
          </div>

          <div className="db-hero-actions">
            <Link href="/quizzer" className="db-btn-glow-primary">
              <Play className="w-4 h-4 fill-current mr-2" />
              <span>Start Custom Quiz</span>
            </Link>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="db-metrics-grid">
          <div className="db-stat-card">
            <div className="db-stat-icon-wrap icon-gold">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="db-stat-number">{stats.completedQuizzes}</p>
              <p className="db-stat-label">Quizzes Completed</p>
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-icon-wrap icon-cyan">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="db-stat-number">
                {stats.averageScore > 0 ? `${stats.averageScore}%` : '—'}
              </p>
              <p className="db-stat-label">Average Mastery</p>
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-icon-wrap icon-flame">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="db-stat-number">{stats.completedQuizzes > 0 ? 'Active' : 'Start Today'}</p>
              <p className="db-stat-label">Study Streak</p>
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-icon-wrap icon-green">
              <GraduationCap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="db-stat-number">Classes 1–12</p>
              <p className="db-stat-label">NCERT Syllabus Ready</p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Dashboard Layout */}
        <div className="db-main-grid">
          {/* Left Column: Quick NCERT Practice Cards */}
          <div className="db-col-left">
            <div className="db-card-panel">
              <div className="db-panel-header">
                <div>
                  <h2 className="db-panel-title flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    <span>NCERT Quick Practice</span>
                  </h2>
                  <p className="db-panel-sub">Select your class and jump straight into high-yield chapter quizzes</p>
                </div>

                {/* Grade Switcher Pills */}
                <div className="db-grade-pills">
                  {[9, 10, 11, 12].map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGrade(g)}
                      className={`db-grade-pill ${selectedGrade === g ? 'active' : ''}`}
                    >
                      Class {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Cards Grid */}
              <div className="db-subjects-grid">
                {quickSubjects.map((subj, idx) => (
                  <div key={subj.id} className="db-subj-box">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl">{subj.icon}</div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                        {subj.chapters.length} Chapters
                      </span>
                    </div>

                    <h3 className="db-subj-name">{subj.name}</h3>
                    <p className="db-subj-preview">
                      {subj.chapters.slice(0, 2).join(', ')}...
                    </p>

                    <button
                      onClick={() => launchQuickQuiz(subj)}
                      className="db-subj-action-btn"
                    >
                      <span>Take 10-Q Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Looking for other grades (Classes 1 to 8)?</span>
                <Link href="/quizzer" className="text-yellow-400 font-semibold hover:underline">
                  Open Full Grade Selector (1–12) →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Real History & Quick Actions */}
          <div className="db-col-right">
            {/* Recent Quiz Performance */}
            <div className="db-card-panel">
              <div className="db-panel-header mb-4">
                <h3 className="db-panel-title text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Recent Quiz Activity</span>
                </h3>
              </div>

              {stats.recentQuizzes.length > 0 ? (
                <div className="space-y-2.5">
                  {stats.recentQuizzes.map(quiz => (
                    <div key={quiz.id} className="db-quiz-row">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{quiz.subject}</p>
                        <p className="text-[11px] text-gray-400">{quiz.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-black ${
                            quiz.score >= 80
                              ? 'text-green-400'
                              : quiz.score >= 60
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          {quiz.score}%
                        </span>
                        {quiz.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="db-empty-state">
                  <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center mb-3">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">No quizzes taken yet</h4>
                  <p className="text-xs text-gray-400 mb-4 max-w-xs">
                    Start your first AI quiz above to track your accuracy and strengths.
                  </p>
                  <Link href="/quizzer" className="db-btn-small-primary">
                    Take First Quiz
                  </Link>
                </div>
              )}
            </div>

            {/* AI Learning Tips */}
            <div className="db-card-panel mt-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Study Recommendation</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Regular 10-minute active recall testing improves retention by over <strong>200%</strong> compared to passive re-reading. Try taking a quiz after reviewing any NCERT chapter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}