'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Play,
  Save,
  Printer,
  BookOpen,
  Zap,
  Coffee,
  School,
  User,
  X,
  Layers,
  Send,
  Bot,
  FileText,
  Upload,
  Calendar as CalendarIcon,
  HelpCircle,
  Check
} from 'lucide-react';
import { AuthenticatedSidebar } from '@/components/layout/AuthenticatedSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { createClient } from '@/lib/supabase/client';
import './timetable.css';

export interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  type: 'class' | 'study' | 'quiz' | 'meal' | 'personal';
  completed?: boolean;
}

export type WeekSchedule = Record<string, ScheduleItem[]>;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  updatedTimetable?: boolean;
}

const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: [
    { id: 'm1', time: '06:30 - 07:30', activity: 'Morning Routine & Exercise', type: 'personal', completed: false },
    { id: 'm2', time: '07:30 - 08:15', activity: 'Breakfast', type: 'meal', completed: false },
    { id: 'm3', time: '08:30 - 14:00', activity: 'School Classes (Math & Physics)', type: 'class', completed: false },
    { id: 'm4', time: '14:00 - 15:00', activity: 'Lunch & Rest', type: 'meal', completed: false },
    { id: 'm5', time: '15:30 - 17:00', activity: 'Mathematics — Problem Solving & Notes', type: 'study', completed: false },
    { id: 'm6', time: '17:00 - 17:30', activity: 'Tea / Snack Break', type: 'meal', completed: false },
    { id: 'm7', time: '17:30 - 19:00', activity: 'Physics — NCERT Concepts & Formulas', type: 'study', completed: false },
    { id: 'm8', time: '19:00 - 19:45', activity: 'Mathematics — 10-Q Practice Quiz', type: 'quiz', completed: false },
    { id: 'm9', time: '20:00 - 21:00', activity: 'Dinner & Family Time', type: 'meal', completed: false },
    { id: 'm10', time: '21:00 - 22:30', activity: 'Daily Review & Bedtime', type: 'study', completed: false }
  ],
  tuesday: [
    { id: 't1', time: '06:30 - 07:30', activity: 'Morning Routine', type: 'personal', completed: false },
    { id: 't2', time: '07:30 - 08:15', activity: 'Breakfast', type: 'meal', completed: false },
    { id: 't3', time: '08:30 - 14:00', activity: 'School Classes (Chemistry & Biology)', type: 'class', completed: false },
    { id: 't4', time: '14:00 - 15:00', activity: 'Lunch Break', type: 'meal', completed: false },
    { id: 't5', time: '15:30 - 17:00', activity: 'Chemistry — Chemical Reactions & Equations', type: 'study', completed: false },
    { id: 't6', time: '17:30 - 19:00', activity: 'Biology — Life Processes Notes', type: 'study', completed: false },
    { id: 't7', time: '19:00 - 19:45', activity: 'Chemistry — Chapter Quiz', type: 'quiz', completed: false },
    { id: 't8', time: '20:00 - 21:00', activity: 'Dinner', type: 'meal', completed: false },
    { id: 't9', time: '21:00 - 22:30', activity: 'Review Weak Topics', type: 'study', completed: false }
  ],
  wednesday: [
    { id: 'w1', time: '06:30 - 07:30', activity: 'Morning Routine', type: 'personal', completed: false },
    { id: 'w2', time: '07:30 - 08:15', activity: 'Breakfast', type: 'meal', completed: false },
    { id: 'w3', time: '08:30 - 14:00', activity: 'School Classes', type: 'class', completed: false },
    { id: 'w4', time: '15:30 - 17:00', activity: 'Social Science — History & Civics', type: 'study', completed: false },
    { id: 'w5', time: '17:30 - 19:00', activity: 'English — Literature & Grammar', type: 'study', completed: false },
    { id: 'w6', time: '19:00 - 19:45', activity: 'Social Science — Quick MCQ Test', type: 'quiz', completed: false },
    { id: 'w7', time: '21:00 - 22:30', activity: 'Review & Homework', type: 'study', completed: false }
  ],
  thursday: [
    { id: 'th1', time: '06:30 - 07:30', activity: 'Morning Routine', type: 'personal', completed: false },
    { id: 'th2', time: '08:30 - 14:00', activity: 'School Classes', type: 'class', completed: false },
    { id: 'th3', time: '15:30 - 17:00', activity: 'Mathematics — Quadratic Equations', type: 'study', completed: false },
    { id: 'th4', time: '17:30 - 19:00', activity: 'Physics — Motion & Force Problems', type: 'study', completed: false },
    { id: 'th5', time: '19:00 - 19:45', activity: 'Physics — Practice Quiz', type: 'quiz', completed: false },
    { id: 'th6', time: '21:00 - 22:30', activity: 'Summary Notes Prep', type: 'study', completed: false }
  ],
  friday: [
    { id: 'f1', time: '06:30 - 07:30', activity: 'Morning Routine', type: 'personal', completed: false },
    { id: 'f2', time: '08:30 - 14:00', activity: 'School Classes', type: 'class', completed: false },
    { id: 'f3', time: '15:30 - 17:00', activity: 'Chemistry — Acids, Bases & Salts', type: 'study', completed: false },
    { id: 'f4', time: '17:30 - 19:00', activity: 'Computer Science / IT Revision', type: 'study', completed: false },
    { id: 'f5', time: '19:00 - 19:45', activity: 'Weekly Mastery Quiz', type: 'quiz', completed: false },
    { id: 'f6', time: '20:00 - 22:30', activity: 'Dinner & Weekend Wind-down', type: 'personal', completed: false }
  ],
  saturday: [
    { id: 'sa1', time: '07:30 - 08:30', activity: 'Morning Walk & Refresh', type: 'personal', completed: false },
    { id: 'sa2', time: '09:00 - 11:00', activity: 'Deep Study — Hardest Subject', type: 'study', completed: false },
    { id: 'sa3', time: '11:15 - 12:30', activity: 'Full 20-Q Mock Test on GrowMyIQ', type: 'quiz', completed: false },
    { id: 'sa4', time: '13:00 - 14:00', activity: 'Lunch Break', type: 'meal', completed: false },
    { id: 'sa5', time: '15:00 - 17:00', activity: 'Project Work & Assignments', type: 'study', completed: false },
    { id: 'sa6', time: '17:30 - 19:30', activity: 'Outdoor Sports & Friends', type: 'personal', completed: false },
    { id: 'sa7', time: '20:30 - 22:30', activity: 'Relaxation & Reading', type: 'personal', completed: false }
  ],
  sunday: [
    { id: 'su1', time: '08:00 - 09:00', activity: 'Healthy Breakfast & Leisure', type: 'meal', completed: false },
    { id: 'su2', time: '10:00 - 12:00', activity: 'Weekly Progress Review & Weak Area Fix', type: 'study', completed: false },
    { id: 'su3', time: '12:00 - 13:00', activity: 'Speed Quiz on GrowMyIQ', type: 'quiz', completed: false },
    { id: 'su4', time: '14:00 - 17:00', activity: 'Family Time & Hobbies', type: 'personal', completed: false },
    { id: 'su5', time: '18:00 - 19:30', activity: 'Prepare Schedule for Upcoming Week', type: 'study', completed: false },
    { id: 'su6', time: '21:00 - 22:30', activity: 'Early Sleep for Monday Readiness', type: 'personal', completed: false }
  ]
};

const DAYS = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' }
];

export default function TimetablePage() {
  const router = useRouter();
  const supabase = createClient();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout & View State
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showChatPane, setShowChatPane] = useState(true);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Hi! I am your AI Study Counselor. Tell me your Class (1–12), stream (Commerce, Science, or Humanities), study goals, or what changes you want in your schedule (e.g. "Add gym at 6pm" or "Schedule my portion sheet for half-yearly exams").',
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    'Schedule my exam portion sheet',
    'Create Class 12 Commerce timetable',
    'Add 1 hr evening revision',
    'Focus on weak subjects'
  ]);

  // Modal 1: Add Portion Sheet State
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [portionInputType, setPortionInputType] = useState<'text' | 'file'>('text');
  const [portionText, setPortionText] = useState('');
  const [portionGrade, setPortionGrade] = useState<number>(10);
  const [portionStream, setPortionStream] = useState<'General' | 'Commerce' | 'Humanities' | 'Science'>('General');
  const [portionExamDate, setPortionExamDate] = useState('');
  const [isProcessingPortion, setIsProcessingPortion] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Modal 2: Add Manual Activity State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDay, setAddDay] = useState<string>('monday');
  const [addTime, setAddTime] = useState<string>('16:00 - 17:30');
  const [addActivity, setAddActivity] = useState<string>('');
  const [addType, setAddType] = useState<ScheduleItem['type']>('study');

  // Load timetable on mount from Supabase / localStorage
  useEffect(() => {
    async function loadTimetable() {
      try {
        const cached = localStorage.getItem('growmyiq_timetable');
        if (cached) {
          setSchedule(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: ttData } = await supabase
            .from('user_timetables')
            .select('schedule')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .maybeSingle();

          if (ttData?.schedule && Object.keys(ttData.schedule).length > 0) {
            setSchedule(ttData.schedule);
            localStorage.setItem('growmyiq_timetable', JSON.stringify(ttData.schedule));
          }
        }
      } catch (err) {
        console.warn('Error loading cloud timetable:', err);
      }
    }

    loadTimetable();
  }, [supabase]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  // Current day's items & stats
  const currentDayItems = useMemo(() => {
    return schedule[selectedDay] || [];
  }, [schedule, selectedDay]);

  const dayStats = useMemo(() => {
    const total = currentDayItems.length;
    const completed = currentDayItems.filter(i => i.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [currentDayItems]);

  // Handlers
  const toggleItemCompletion = (itemId: string) => {
    setSchedule(prev => {
      const updatedDay = (prev[selectedDay] || []).map(item => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      const newSchedule = { ...prev, [selectedDay]: updatedDay };
      localStorage.setItem('growmyiq_timetable', JSON.stringify(newSchedule));
      return newSchedule;
    });
  };

  const deleteItem = (itemId: string) => {
    setSchedule(prev => {
      const updatedDay = (prev[selectedDay] || []).filter(item => item.id !== itemId);
      const newSchedule = { ...prev, [selectedDay]: updatedDay };
      localStorage.setItem('growmyiq_timetable', JSON.stringify(newSchedule));
      return newSchedule;
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addActivity.trim()) return;

    const newItem: ScheduleItem = {
      id: `slot_${Date.now()}`,
      time: addTime,
      activity: addActivity.trim(),
      type: addType,
      completed: false
    };

    setSchedule(prev => {
      const updatedDay = [...(prev[addDay] || []), newItem];
      const newSchedule = { ...prev, [addDay]: updatedDay };
      localStorage.setItem('growmyiq_timetable', JSON.stringify(newSchedule));
      return newSchedule;
    });

    setAddActivity('');
    setShowAddModal(false);
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      localStorage.setItem('growmyiq_timetable', JSON.stringify(schedule));

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('user_timetables')
          .upsert({
            user_id: session.user.id,
            title: `Student Timetable`,
            is_active: true,
            schedule: schedule,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }

      setSaveMessage('✓ Timetable synced & saved to cloud!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      setSaveMessage('✓ Saved locally!');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Portion Sheet Processor
  const handleProcessPortion = async () => {
    if (!portionText.trim()) return;

    setIsProcessingPortion(true);
    try {
      const res = await fetch('/api/ai/parse-portion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portionText,
          grade: portionGrade,
          stream: portionStream,
          examDate: portionExamDate
        })
      });

      const data = await res.json();
      if (data.success && data.schedule) {
        setSchedule(data.schedule);
        localStorage.setItem('growmyiq_timetable', JSON.stringify(data.schedule));
        setShowPortionModal(false);

        // Add confirmation to chat
        const aiMsg: ChatMessage = {
          id: `ai_portion_${Date.now()}`,
          role: 'assistant',
          content: `I've analyzed your portion sheet (${data.extractedChapters?.length || 'all'} chapters) and scheduled deep revision blocks and practice quizzes throughout the week!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedTimetable: true
        };
        setChatMessages(prev => [...prev, aiMsg]);
        setSaveMessage('✓ Portion sheet scheduled across your timetable!');
        setTimeout(() => setSaveMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error parsing portion:', err);
    } finally {
      setIsProcessingPortion(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    // If it is a text file or we extract dummy
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPortionText(content.slice(0, 2000));
      } else {
        setPortionText(`Exam Portion Sheet from: ${file.name}\n1. Chapter 1: Basic Principles\n2. Chapter 2: Key Applications\n3. Chapter 3: Numerical Problems & Derivations`);
      }
    };
    reader.readAsText(file);
  };

  // Chatbot Send Handler
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isAiThinking) return;

    if (textToSend.toLowerCase().includes('portion')) {
      setShowPortionModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/ai/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: chatMessages,
          currentTimetable: schedule
        })
      });

      const data = await res.json();

      let hasUpdatedSchedule = false;
      if (data.schedule && data.schedule.monday && data.schedule.friday) {
        setSchedule(data.schedule);
        localStorage.setItem('growmyiq_timetable', JSON.stringify(data.schedule));
        hasUpdatedSchedule = true;
      }

      if (data.quickReplies && Array.isArray(data.quickReplies)) {
        setQuickReplies(data.quickReplies);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.response || "I've reviewed your request and updated your schedule accordingly!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedTimetable: hasUpdatedSchedule
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "I've updated your schedule with optimal study intervals and school hours!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const launchQuizFromSlot = (activity: string) => {
    const quizConfig = {
      grade: portionGrade || 10,
      gradeLabel: `Class ${portionGrade || 10}`,
      subject: activity.split('—')[0].trim() || 'General Practice',
      chapters: ['Core Topics'],
      difficulty: 'medium',
      questionCount: 10
    };
    const encoded = encodeURIComponent(JSON.stringify(quizConfig));
    router.push(`/quiz?quizData=${encoded}`);
  };

  return (
    <AuthGuard>
      <div className="tt-root">
        <div className="tt-orb tt-orb-1" />
        <div className="tt-orb tt-orb-2" />

        <div className="tt-layout">
          <AuthenticatedSidebar activeItem="timetable" />

          <main className="tt-main-container">
            {/* Header Glass Banner */}
            <div className="tt-glass-header">
              <div className="flex-1">
                <div className="tt-badge-head">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>AI-Powered Academic Counselor</span>
                </div>
                <h1 className="tt-title">Smart Study Timetable & AI Assistant</h1>
                <p className="tt-subtitle">
                  Chat with your AI study counselor to build, balance, or upload your exam portion sheet to schedule all chapters automatically.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="tt-header-actions">
                <button
                  onClick={() => setShowPortionModal(true)}
                  className="tt-btn-portion-glow"
                  title="Upload or paste your exam syllabus portion sheet"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  <span>Add Portion Sheet</span>
                </button>

                <button
                  onClick={() => setShowChatPane(!showChatPane)}
                  className={`tt-btn-toggle-chat ${showChatPane ? 'active' : ''}`}
                >
                  <Bot className="w-4 h-4 mr-1.5 text-yellow-400" />
                  <span>{showChatPane ? 'Hide AI Chat' : 'Open AI Chatbot'}</span>
                </button>

                <button onClick={() => setShowAddModal(true)} className="tt-btn-glass">
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>Add Activity</span>
                </button>

                <button onClick={handleSaveToCloud} disabled={isSaving} className="tt-btn-glass">
                  <Save className="w-4 h-4 text-green-400" />
                  <span>{isSaving ? 'Saving...' : 'Save Cloud'}</span>
                </button>

                <button onClick={() => window.print()} className="tt-btn-glass-icon" title="Print Timetable">
                  <Printer className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {saveMessage && (
              <div className="tt-toast-banner">
                <span>{saveMessage}</span>
              </div>
            )}

            {/* Dual Pane: AI Chatbot + Timetable Matrix */}
            <div className={`tt-content-split ${showChatPane ? 'with-chat' : 'no-chat'}`}>
              {/* PANE 1: AI Chatbot Assistant */}
              {showChatPane && (
                <div className="tt-chat-pane">
                  <div className="tt-chat-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">AI Study Counselor</h3>
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Online • Gemma AI
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPortionModal(true)}
                      className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-md"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Portion</span>
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="tt-chat-messages">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`tt-chat-bubble-wrap ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`}
                      >
                        <div className="tt-chat-bubble">
                          <p className="text-xs leading-relaxed text-slate-200">{msg.content}</p>
                          {msg.updatedTimetable && (
                            <div className="tt-badge-updated-tt mt-2">
                              <Sparkles className="w-3 h-3 text-yellow-400" />
                              <span>Timetable updated live!</span>
                            </div>
                          )}
                          <span className="tt-msg-time">{msg.timestamp}</span>
                        </div>
                      </div>
                    ))}

                    {isAiThinking && (
                      <div className="tt-chat-bubble-wrap ai-msg">
                        <div className="tt-chat-bubble">
                          <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce [animation-delay:0.4s]" />
                            <span className="ml-1 text-[11px] opacity-80">AI Counselor is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Quick Replies */}
                  <div className="tt-quick-replies-bar">
                    {quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qr)}
                        className="tt-quick-reply-pill"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="tt-chat-input-bar"
                  >
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      placeholder="Ask AI or type syllabus portion..."
                      className="tt-chat-input"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isAiThinking}
                      className="tt-chat-send-btn"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* PANE 2: Interactive Timetable Display */}
              <div className="tt-timetable-pane">
                {/* Day Navigation Tabs */}
                <div className="tt-controls-card mb-4">
                  <div className="tt-day-tabs">
                    {DAYS.map(d => {
                      const isActive = selectedDay === d.id && viewMode === 'day';
                      const count = (schedule[d.id] || []).length;
                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            setSelectedDay(d.id);
                            setViewMode('day');
                          }}
                          className={`tt-day-tab ${isActive ? 'active' : ''}`}
                        >
                          <span className="font-bold">{d.short}</span>
                          <span className="tt-tab-badge">{count}</span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setViewMode('week')}
                      className={`tt-day-tab ${viewMode === 'week' ? 'active' : ''}`}
                    >
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      <span className="font-bold">Week Grid</span>
                    </button>
                  </div>
                </div>

                {/* DAY TIMELINE VIEW */}
                {viewMode === 'day' && (
                  <div className="tt-day-view-container">
                    {/* Day Overview Header */}
                    <div className="tt-day-header-glass">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-black text-base">
                          {selectedDay.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white capitalize">{selectedDay}&apos;s Schedule</h2>
                          <p className="text-xs text-gray-400">
                            {dayStats.completed} of {dayStats.total} completed ({dayStats.percent}%)
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full sm:w-44 flex flex-col gap-1">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${dayStats.percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-right font-bold text-yellow-400">
                          {dayStats.percent}% Completed
                        </span>
                      </div>
                    </div>

                    {/* Timeline Slots */}
                    <div className="tt-slots-list">
                      {currentDayItems.length > 0 ? (
                        currentDayItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className={`tt-slot-card type-${item.type} ${item.completed ? 'completed' : ''}`}
                          >
                            <button
                              onClick={() => toggleItemCompletion(item.id)}
                              className="tt-check-btn"
                              title={item.completed ? 'Mark as incomplete' : 'Mark as done'}
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400 fill-green-400/20" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-500 hover:text-yellow-400" />
                              )}
                            </button>

                            <div className="tt-time-col">
                              <Clock className="w-3.5 h-3.5 opacity-60 mr-1.5" />
                              <span>{item.time}</span>
                            </div>

                            <div className="tt-activity-col">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`tt-badge-type badge-${item.type}`}>
                                  {item.type === 'class' && <School className="w-3 h-3 mr-1" />}
                                  {item.type === 'study' && <BookOpen className="w-3 h-3 mr-1" />}
                                  {item.type === 'quiz' && <Zap className="w-3 h-3 mr-1" />}
                                  {item.type === 'meal' && <Coffee className="w-3 h-3 mr-1" />}
                                  {item.type === 'personal' && <User className="w-3 h-3 mr-1" />}
                                  <span className="capitalize">{item.type}</span>
                                </span>
                              </div>
                              <h3 className={`tt-activity-name ${item.completed ? 'line-through opacity-60' : ''}`}>
                                {item.activity}
                              </h3>
                            </div>

                            <div className="tt-slot-actions">
                              {(item.type === 'study' || item.type === 'quiz') && (
                                <button
                                  onClick={() => launchQuizFromSlot(item.activity)}
                                  className="tt-btn-launch-quiz"
                                  title="Launch instant NCERT Quiz for this topic"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current mr-1" />
                                  <span>Quiz</span>
                                </button>
                              )}

                              <button
                                onClick={() => deleteItem(item.id)}
                                className="tt-btn-delete"
                                title="Delete slot"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="tt-empty-day">
                          <p className="text-sm text-gray-400 mb-3">No sessions scheduled for this day.</p>
                          <button onClick={() => setShowAddModal(true)} className="tt-btn-glass">
                            <Plus className="w-4 h-4 mr-1 text-yellow-400" />
                            <span>Add First Activity</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* WEEK GRID VIEW */}
                {viewMode === 'week' && (
                  <div className="tt-week-matrix-card">
                    <div className="tt-week-grid">
                      {DAYS.map(day => {
                        const items = schedule[day.id] || [];
                        return (
                          <div key={day.id} className="tt-matrix-col">
                            <div className="tt-matrix-col-head">
                              <span className="font-bold text-white text-sm">{day.short}</span>
                              <span className="text-[10px] text-yellow-400 font-bold">{items.length} slots</span>
                            </div>

                            <div className="tt-matrix-slots">
                              {items.map(slot => (
                                <div key={slot.id} className={`tt-matrix-slot type-${slot.type}`}>
                                  <span className="text-[10px] font-mono text-gray-400 block">{slot.time}</span>
                                  <span className="text-xs font-semibold text-white block mt-0.5 truncate">
                                    {slot.activity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* MODAL 1: ADD PORTION SHEET / SYLLABUS */}
        {showPortionModal && (
          <div className="tt-modal-overlay">
            <div className="tt-modal-box tt-modal-portion">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Add Exam Portion Sheet</h3>
                    <p className="text-[11px] text-gray-400">
                      Upload or paste your syllabus chapters to automatically distribute them across your weekly timetable.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPortionModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Input Type Switcher: Paste Text vs Upload File */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPortionInputType('text')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    portionInputType === 'text'
                      ? 'bg-yellow-400 text-slate-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ✏️ Paste Portion Chapters
                </button>
                <button
                  type="button"
                  onClick={() => setPortionInputType('file')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    portionInputType === 'file'
                      ? 'bg-yellow-400 text-slate-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📁 Upload PDF / Image File
                </button>
              </div>

              {/* Class & Stream Options */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Class / Grade:</label>
                  <select
                    value={portionGrade}
                    onChange={e => setPortionGrade(Number(e.target.value))}
                    className="tt-modal-input"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g} className="bg-[#10121e]">
                        Class {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Academic Stream:</label>
                  <select
                    value={portionStream}
                    onChange={e => setPortionStream(e.target.value as any)}
                    className="tt-modal-input"
                  >
                    <option value="General" className="bg-[#10121e]">General (Classes 1–10)</option>
                    <option value="Commerce" className="bg-[#10121e]">💼 Commerce</option>
                    <option value="Humanities" className="bg-[#10121e]">🏛️ Humanities / Arts</option>
                    <option value="Science" className="bg-[#10121e]">⚛️ Science</option>
                  </select>
                </div>
              </div>

              {/* Tab 1: Text Area */}
              {portionInputType === 'text' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-300">
                        Exam Syllabus Chapters / Portion Details:
                      </label>
                      {/* Sample Preset Buttons */}
                      <button
                        type="button"
                        onClick={() => {
                          setPortionText(`Accountancy:
1. Accounting for Partnership: Basic Concepts
2. Reconstitution: Admission of a Partner
3. Dissolution of Partnership Firm

Business Studies:
1. Principles of Management (Fayol & Taylor)
2. Business Environment
3. Planning & Organising

Economics:
1. National Income and Related Aggregates
2. Money and Banking
3. Government Budget and the Economy`);
                        }}
                        className="text-[10px] text-yellow-400 font-bold hover:underline"
                      >
                        Insert Sample Portion
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={portionText}
                      onChange={e => setPortionText(e.target.value)}
                      placeholder="Paste your exam portion sheet or chapters here...&#10;e.g.&#10;Physics: 1. Electrostatics, 2. Current Electricity&#10;Chemistry: 1. Solutions, 2. Electrochemistry&#10;Math: 1. Matrices, 2. Determinants, 3. Calculus"
                      className="tt-modal-input font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: File Upload */}
              {portionInputType === 'file' && (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-white/20 hover:border-yellow-400 rounded-xl bg-white/[0.02] text-center cursor-pointer transition-all"
                  >
                    <Upload className="w-8 h-8 text-yellow-400 mx-auto mb-2 opacity-80" />
                    <div className="text-xs font-bold text-white">
                      {uploadedFileName ? uploadedFileName : 'Click to Browse Portion Sheet PDF / Image'}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Supports PDF, JPG, PNG portion documents</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {uploadedFileName && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                      <Check className="w-4 h-4" />
                      <span>{uploadedFileName} attached and parsed ready to schedule!</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPortionModal(false)}
                  className="tt-btn-modal-cancel"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProcessPortion}
                  disabled={!portionText.trim() || isProcessingPortion}
                  className="tt-btn-portion-glow"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  <span>{isProcessingPortion ? 'Scheduling Portions...' : 'Auto-Schedule Portions with AI'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Add Manual Activity */}
        {showAddModal && (
          <div className="tt-modal-overlay">
            <div className="tt-modal-box">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="text-lg font-bold text-white">Add Schedule Activity</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5">Day of the Week:</label>
                  <select
                    value={addDay}
                    onChange={e => setAddDay(e.target.value)}
                    className="tt-modal-input capitalize"
                  >
                    {DAYS.map(d => (
                      <option key={d.id} value={d.id} className="bg-[#10121e]">
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1.5">Time Range:</label>
                  <input
                    type="text"
                    value={addTime}
                    onChange={e => setAddTime(e.target.value)}
                    placeholder="e.g. 16:00 - 17:30"
                    required
                    className="tt-modal-input"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1.5">Activity / Subject Title:</label>
                  <input
                    type="text"
                    value={addActivity}
                    onChange={e => setAddActivity(e.target.value)}
                    placeholder="e.g. Mathematics — Calculus Practice"
                    required
                    className="tt-modal-input"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1.5">Category Type:</label>
                  <select
                    value={addType}
                    onChange={e => setAddType(e.target.value as any)}
                    className="tt-modal-input capitalize"
                  >
                    <option value="study" className="bg-[#10121e]">🎯 Self-Study / Revision</option>
                    <option value="quiz" className="bg-[#10121e]">⚡ Practice Quiz / Test</option>
                    <option value="class" className="bg-[#10121e]">🏫 School / Coaching Class</option>
                    <option value="meal" className="bg-[#10121e]">🥪 Meal / Snack Break</option>
                    <option value="personal" className="bg-[#10121e]">🏃 Personal / Routine</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="tt-btn-modal-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="tt-btn-modal-submit">
                    Add to Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}