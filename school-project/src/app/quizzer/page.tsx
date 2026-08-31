'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Sliders,
  Play,
  ArrowLeft,
  Search,
  Sparkles,
  ChevronRight,
  CheckSquare,
  Square,
  Flame,
  Zap,
  Target,
  Briefcase,
  Landmark,
  Atom
} from 'lucide-react';
import { NCERT_CURRICULUM, NCERTSubject } from '@/data/ncertCurriculum';
import { AuthGuard } from '@/components/auth/AuthGuard';
import './quizzer.css';

export default function QuizzerPage() {
  const router = useRouter();

  // Step flow: 1: Grade -> 2: Subject -> 3: Chapters -> 4: Configuration
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Configuration state
  const [selectedGrade, setSelectedGrade] = useState<number>(12);
  const [selectedStream, setSelectedStream] = useState<'All' | 'Commerce' | 'Humanities' | 'Science'>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('accountancy');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [chapterSearch, setChapterSearch] = useState<string>('');

  // Current grade curriculum data
  const currentGradeData = useMemo(() => {
    return NCERT_CURRICULUM[selectedGrade] || NCERT_CURRICULUM[12];
  }, [selectedGrade]);

  // Subjects filtered by stream for senior secondary
  const visibleSubjects = useMemo(() => {
    if (selectedGrade < 11 || selectedStream === 'All') {
      return currentGradeData.subjects;
    }
    return currentGradeData.subjects.filter(s => s.stream === selectedStream);
  }, [currentGradeData, selectedGrade, selectedStream]);

  // Current subject data
  const currentSubjectData = useMemo(() => {
    const found = currentGradeData.subjects.find(s => s.id === selectedSubjectId);
    return found || visibleSubjects[0] || currentGradeData.subjects[0];
  }, [currentGradeData, selectedSubjectId, visibleSubjects]);

  // Filtered chapters list
  const filteredChapters = useMemo(() => {
    if (!currentSubjectData) return [];
    if (!chapterSearch.trim()) return currentSubjectData.chapters;
    return currentSubjectData.chapters.filter(ch =>
      ch.toLowerCase().includes(chapterSearch.toLowerCase().trim())
    );
  }, [currentSubjectData, chapterSearch]);

  // Handlers
  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    const newGradeData = NCERT_CURRICULUM[grade];
    if (newGradeData && newGradeData.subjects.length > 0) {
      setSelectedSubjectId(newGradeData.subjects[0].id);
      setSelectedChapters(newGradeData.subjects[0].chapters.slice(0, 3));
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subj = currentGradeData.subjects.find(s => s.id === subjectId);
    if (subj) {
      setSelectedChapters(subj.chapters.slice(0, 3));
    }
  };

  const toggleChapter = (chapterName: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapterName)
        ? prev.filter(c => c !== chapterName)
        : [...prev, chapterName]
    );
  };

  const selectAllChapters = () => {
    if (!currentSubjectData) return;
    if (selectedChapters.length === currentSubjectData.chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...currentSubjectData.chapters]);
    }
  };

  const handleStartQuiz = () => {
    if (!currentSubjectData || selectedChapters.length === 0) return;

    const quizConfig = {
      grade: selectedGrade,
      gradeLabel: currentGradeData.gradeLabel,
      subject: `${currentSubjectData.name} (Class ${selectedGrade})`,
      subjectId: currentSubjectData.id,
      chapters: selectedChapters,
      difficulty,
      questionCount
    };

    const encoded = encodeURIComponent(JSON.stringify(quizConfig));
    router.push(`/quiz?quizData=${encoded}`);
  };

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <AuthGuard>
      <div className="qz-root">
        <div className="qz-backdrop-glow glow-1" />
        <div className="qz-backdrop-glow glow-2" />

        <div className="qz-container">
          {/* Header Navigation */}
          <div className="qz-top-bar">
            <Link href="/dashboard" className="qz-back-link">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Dashboard
            </Link>
            <div className="qz-badge-powered">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>NCERT Syllabus (Classes 1–12 • All Streams)</span>
            </div>
          </div>

          {/* Title Header */}
          <div className="qz-header">
            <h1 className="qz-title">NCERT AI Quiz Generator</h1>
            <p className="qz-subtitle">
              Select your class, stream (Commerce, Humanities, Science), and syllabus chapters to generate an AI-tailored practice exam with instant explanations.
            </p>
          </div>

          {/* Stepper Pill Tabs */}
          <div className="qz-stepper">
            <button
              onClick={() => setCurrentStep(1)}
              className={`qz-step-tab ${currentStep === 1 ? 'active' : ''}`}
            >
              <span className="qz-step-num">1</span>
              <span>Class & Subject</span>
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`qz-step-tab ${currentStep === 2 ? 'active' : ''}`}
            >
              <span className="qz-step-num">2</span>
              <span>NCERT Chapters ({selectedChapters.length})</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`qz-step-tab ${currentStep === 3 ? 'active' : ''}`}
            >
              <span className="qz-step-num">3</span>
              <span>Difficulty & Size</span>
            </button>
          </div>

          {/* STEP 1: Grade, Stream, and Subject Selection */}
          {currentStep === 1 && (
            <div className="qz-card-glass">
              {/* Grade Selector */}
              <div className="qz-section-group">
                <div className="flex items-center justify-between mb-3">
                  <label className="qz-section-label">
                    <GraduationCap className="w-4 h-4 text-yellow-400" />
                    Select Your Grade / Class:
                  </label>
                  <span className="text-xs font-bold text-yellow-400">
                    {currentGradeData.category} • {currentGradeData.gradeLabel}
                  </span>
                </div>

                <div className="qz-grade-grid">
                  {grades.map(g => {
                    const isSelected = selectedGrade === g;
                    return (
                      <button
                        key={g}
                        onClick={() => handleGradeChange(g)}
                        className={`qz-grade-btn ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="text-base font-black">Class {g}</span>
                        <span className="text-[10px] opacity-70">
                          {g <= 5 ? 'Primary' : g <= 8 ? 'Middle' : g <= 10 ? 'Secondary' : 'Senior'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stream Switcher for Class 11 & 12 */}
              {selectedGrade >= 11 && (
                <div className="qz-section-group mt-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Select Stream:</span>
                    </label>
                    <span className="text-xs text-gray-400">
                      Showing {visibleSubjects.length} subjects
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'All', label: 'All Streams', icon: null },
                      { id: 'Commerce', label: 'Commerce (Accounts, BST, Eco)', icon: Briefcase },
                      { id: 'Humanities', label: 'Humanities (History, Pol Sci, Geo)', icon: Landmark },
                      { id: 'Science', label: 'Science (Physics, Chem, Bio, CS)', icon: Atom }
                    ].map(st => {
                      const isActive = selectedStream === st.id;
                      const IconComponent = st.icon;
                      return (
                        <button
                          key={st.id}
                          onClick={() => {
                            setSelectedStream(st.id as any);
                            const filtered =
                              st.id === 'All'
                                ? currentGradeData.subjects
                                : currentGradeData.subjects.filter(s => s.stream === st.id);
                            if (filtered.length > 0) {
                              setSelectedSubjectId(filtered[0].id);
                              setSelectedChapters(filtered[0].chapters.slice(0, 3));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isActive
                              ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                              : 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] border border-white/[0.06]'
                          }`}
                        >
                          {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Subject Selector */}
              <div className="qz-section-group mt-6">
                <label className="qz-section-label mb-3">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Select Subject for {currentGradeData.gradeLabel}:
                </label>

                <div className="qz-subject-grid">
                  {visibleSubjects.map(subj => {
                    const isSelected = selectedSubjectId === subj.id;
                    return (
                      <button
                        key={subj.id}
                        onClick={() => handleSubjectChange(subj.id)}
                        className={`qz-subject-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="qz-subject-icon">{subj.icon}</div>
                        <div className="qz-subject-meta">
                          <div className="flex items-center gap-1.5">
                            <h3 className="qz-subject-name">{subj.name}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="qz-subject-count">{subj.chapters.length} Chapters</span>
                            {subj.stream && subj.stream !== 'General' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-yellow-300">
                                {subj.stream}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="qz-check-badge">
                            <CheckCircle2 className="w-4 h-4 text-yellow-400 fill-current text-slate-950" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="qz-actions-footer mt-8">
                <div className="text-xs text-gray-400">
                  Ready to choose chapters from <strong className="text-white">{currentSubjectData?.name}</strong>
                </div>
                <button onClick={() => setCurrentStep(2)} className="qz-btn-next">
                  <span>Continue to Chapters</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: NCERT Chapter Selection */}
          {currentStep === 2 && (
            <div className="qz-card-glass">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{currentSubjectData?.icon}</span>
                    <span>{currentSubjectData?.name} — {currentGradeData.gradeLabel}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Select chapters you want the quiz questions generated from
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search chapter..."
                      value={chapterSearch}
                      onChange={e => setChapterSearch(e.target.value)}
                      className="qz-search-input"
                    />
                  </div>
                  <button onClick={selectAllChapters} className="qz-btn-select-all">
                    {selectedChapters.length === currentSubjectData?.chapters.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Chapters List Grid */}
              <div className="qz-chapters-list">
                {filteredChapters.map((chapterName, idx) => {
                  const isChecked = selectedChapters.includes(chapterName);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChapter(chapterName)}
                      className={`qz-chapter-item ${isChecked ? 'checked' : ''}`}
                    >
                      <div className="qz-checkbox">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 font-semibold mb-0.5">Chapter {idx + 1}</div>
                        <div className="text-sm font-medium text-white">{chapterName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="qz-actions-footer mt-6">
                <button onClick={() => setCurrentStep(1)} className="qz-btn-back">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                <div className="text-xs font-semibold text-yellow-400">
                  {selectedChapters.length} chapter{selectedChapters.length !== 1 ? 's' : ''} selected
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={selectedChapters.length === 0}
                  className="qz-btn-next"
                >
                  <span>Configure Quiz</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Difficulty & Configuration */}
          {currentStep === 3 && (
            <div className="qz-card-glass">
              {/* Difficulty Picker */}
              <div className="qz-section-group mb-8">
                <label className="qz-section-label mb-3">
                  <Target className="w-4 h-4 text-yellow-400" />
                  Choose Difficulty Level:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => setDifficulty('easy')}
                    className={`qz-diff-card ${difficulty === 'easy' ? 'selected' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        Easy
                      </span>
                      {difficulty === 'easy' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className="text-xs text-gray-300">
                      Fundamental concepts, definitions, and direct NCERT formula/rule recall.
                    </p>
                  </div>

                  <div
                    onClick={() => setDifficulty('medium')}
                    className={`qz-diff-card ${difficulty === 'medium' ? 'selected' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4" />
                        Medium (Standard)
                      </span>
                      {difficulty === 'medium' && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <p className="text-xs text-gray-300">
                      Balanced NCERT board style with conceptual application, case studies, and reasoning.
                    </p>
                  </div>

                  <div
                    onClick={() => setDifficulty('hard')}
                    className={`qz-diff-card ${difficulty === 'hard' ? 'selected' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                        <Flame className="w-4 h-4" />
                        Hard (Exemplar / CUET)
                      </span>
                      {difficulty === 'hard' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                    </div>
                    <p className="text-xs text-gray-300">
                      Challenging questions, multi-step problem solving & competitive level.
                    </p>
                  </div>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="qz-section-group mb-8">
                <label className="qz-section-label mb-3">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  Select Number of Questions:
                </label>

                <div className="flex flex-wrap gap-3">
                  {[5, 10, 15, 20].map(count => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`qz-count-btn ${questionCount === count ? 'selected' : ''}`}
                    >
                      <span className="text-lg font-black">{count}</span>
                      <span className="text-xs opacity-70">Questions (~{count * 1.5} min)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="qz-summary-box p-4 rounded-xl mb-6">
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                  Quiz Configuration Summary
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Class / Grade:</span>
                    <span className="font-bold text-white">{currentGradeData.gradeLabel}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Subject:</span>
                    <span className="font-bold text-white">{currentSubjectData?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Chapters:</span>
                    <span className="font-bold text-white">{selectedChapters.length} Selected</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Difficulty & Length:</span>
                    <span className="font-bold text-yellow-300 capitalize">{difficulty} • {questionCount} Qs</span>
                  </div>
                </div>
              </div>

              <div className="qz-actions-footer">
                <button onClick={() => setCurrentStep(2)} className="qz-btn-back">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                <button onClick={handleStartQuiz} className="qz-btn-launch">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start NCERT AI Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}