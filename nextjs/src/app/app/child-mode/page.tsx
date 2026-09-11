'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lock,
  BookOpen,
  Trophy,
  Palette,
  Users,
  Compass,
  Hash,
  Scissors,
  Globe,
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Child, Assignment, ChildMilestone, Milestone } from '@/lib/eyt-service';
import { AdaptiveTutorService, LearningPillar, MascotDialogueOption } from '@/lib/adaptive-tutor';
import MascotCharacter from '@/components/child-mode/MascotCharacter';
import ParentalGateModal from '@/components/child-mode/ParentalGateModal';
import ChildHomeworkView from '@/components/child-mode/ChildHomeworkView';
import MilestoneTrophyRoom from '@/components/child-mode/MilestoneTrophyRoom';
import MontessoriPillarActivities from '@/components/MontessoriPillarActivities';
import AlphabetArtActivity from '@/components/child-mode/AlphabetArtActivity';

type ChildModeTab = 'adventure' | 'homework' | 'activities' | 'trophies' | 'alphabet_art';

// Native Web Audio API sound synthesis (zero external dependencies)
function playTone(freq: number, duration: number, type: OscillatorType = 'sine') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback if audio is blocked by browser policies
  }
}

function playChime() {
  playTone(523.25, 0.25, 'triangle'); // C5
  setTimeout(() => playTone(659.25, 0.25, 'triangle'), 100); // E5
  setTimeout(() => playTone(783.99, 0.35, 'triangle'), 200); // G5
  setTimeout(() => playTone(1046.5, 0.45, 'triangle'), 300); // C6
}

function playCelebration() {
  playTone(587.33, 0.2, 'triangle'); // D5
  setTimeout(() => playTone(739.99, 0.2, 'triangle'), 80); // F#5
  setTimeout(() => playTone(880.0, 0.25, 'triangle'), 160); // A5
  setTimeout(() => playTone(1174.66, 0.45, 'triangle'), 240); // D6
}

export default function ChildModePage() {
  const router = useRouter();
  const { profile, user, loading } = useGlobal();

  // Navigation & Gate state
  const [activeTab, setActiveTab] = useState<ChildModeTab>('adventure');
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Child Selection state
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);

  // Learning data for selected child
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [childMilestones, setChildMilestones] = useState<ChildMilestone[]>([]);
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
  const [activePillar, setActivePillar] = useState<LearningPillar>('numeracy');
  const [completedPillars, setCompletedPillars] = useState<LearningPillar[]>([]);
  const [isDailyCompleted, setIsDailyCompleted] = useState(false);

  // Verify parent authentication: STRICT REQUIREMENT — no child can authenticate directly
  useEffect(() => {
    if (!loading && !profile && !user && !EYTService.isAuthenticated()) {
      router.replace('/login');
    }
  }, [loading, profile, user, router]);

  // Load parent's children
  useEffect(() => {
    const parentChildren = EYTService.getChildren();
    setChildrenList(parentChildren);
    setAllMilestones(EYTService.getMilestones());

    if (parentChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(parentChildren[0].id);
    }
  }, [selectedChildId]);

  // Reload child-specific records when active child changes
  const refreshChildData = useCallback(() => {
    if (!selectedChildId) return;
    setAssignments(EYTService.getAssignments(selectedChildId));
    setChildMilestones(EYTService.getChildMilestones(selectedChildId));
  }, [selectedChildId]);

  // Synchronize daily pillar completion and determine resuming pillar
  const refreshDailyProgress = useCallback(() => {
    if (!selectedChildId) return;
    const progress = EYTService.getChildModeProgress(selectedChildId);
    const completed = progress?.pillars_completed || [];
    setCompletedPillars(completed);

    const isAll = EYTService.isAllPillarsCompletedToday(selectedChildId);
    setIsDailyCompleted(isAll);

    if (!isAll) {
      const nextPillar = EYTService.getNextIncompletePillar(selectedChildId);
      if (nextPillar) {
        setActivePillar(nextPillar);
      }
    }
  }, [selectedChildId]);

  useEffect(() => {
    refreshChildData();
    refreshDailyProgress();
  }, [refreshChildData, refreshDailyProgress]);

  const activeChild = useMemo(() => {
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0];
  }, [childrenList, selectedChildId]);

  const activeChildName = activeChild?.name || 'Superstar';

  // Compute adaptive recommendation for the active child
  const recommendation = useMemo(() => {
    if (!selectedChildId) return null;
    return AdaptiveTutorService.getNextRecommendation(selectedChildId, activeChildName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId, activeChildName, isDailyCompleted, completedPillars]);

  // Handle Mascot Dialogue Option Selection
  const handleSelectOption = (option: MascotDialogueOption) => {
    if (soundEnabled) playChime();

    if (option.action === 'start_activity') {
      if (option.pillar) {
        setActivePillar(option.pillar);
      }
      setActiveTab('activities');
    } else if (option.action === 'view_homework') {
      setActiveTab('homework');
    } else if (option.action === 'switch_activity') {
      setActiveTab('activities');
    }
  };

  const handleActivityCompleted = (pillar: LearningPillar) => {
    if (soundEnabled) playCelebration();
    console.log(`Child completed activity: ${pillar}`);
  };

  const handlePillarCompleted = (pillar: LearningPillar, nextPillar: LearningPillar | null) => {
    if (!selectedChildId) return;
    const result = EYTService.recordPillarCompletion(selectedChildId, pillar);
    setCompletedPillars(result.progress.pillars_completed);
    if (result.isAllCompleted) {
      setIsDailyCompleted(true);
    } else if (nextPillar) {
      setActivePillar(nextPillar);
    }
  };

  const handleResetToday = () => {
    if (!selectedChildId) return;
    EYTService.resetChildModeProgress(selectedChildId);
    setCompletedPillars([]);
    setIsDailyCompleted(false);
    setActivePillar('numeracy');
  };

  // Exit back to Parent Dashboard after solving Parental Gate
  const handleGateSuccess = () => {
    setIsGateOpen(false);
    router.push('/app');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
          <span className="font-heading font-bold text-sm text-[#1E4E8C]">
            Opening Play &amp; Learn Mode...
          </span>
        </div>
      </div>
    );
  }

  // If parent has no children enrolled yet
  if (childrenList.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6 text-center">
        <div className="bg-white max-w-md rounded-3xl p-8 border-2 border-[#D4A017] shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E4E8C] text-[#D4A017] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-bold text-xl text-[#1E4E8C]">
            No Child Profile Enrolled Yet
          </h2>
          <p className="text-xs text-[#6B7280]">
            Please add your child in the Parent Portal first so Mrs Sarah can personalize their activities.
          </p>
          <button
            type="button"
            onClick={() => router.push('/app/children')}
            className="w-full py-3 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all"
          >
            Return to Parent Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FCFBF7] to-[#F3F7FD] text-[#14263F] flex flex-col justify-between selection:bg-amber-200">
      
      {/* 1. CHILD MODE TOP BAR (Distraction-free, no adult links) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Child Identity Badge & Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1E4E8C] border-2 border-[#D4A017] text-white flex items-center justify-center font-heading font-extrabold text-base shadow-xs">
              {activeChildName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-sm sm:text-base text-[#1E4E8C]">
                  {activeChildName}&apos;s Learning Space
                </h1>
                <span className="text-[10px] font-extrabold text-[#D4A017] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Child Mode
                </span>
              </div>

              {childrenList.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsChildSelectorOpen(true)}
                  className="text-[11px] text-[#1E4E8C] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Switch Learner ({childrenList.length} children)
                </button>
              )}
            </div>
          </div>

          {/* Parental Exit Gate Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsGateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-gray-300 hover:border-[#1E4E8C] text-[#6B7280] hover:text-[#1E4E8C] text-xs font-extrabold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Parent Dashboard (Lock Protected)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Parents Only</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CHILD MODE INTERACTION STAGE */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        
        {/* Transparent Learning Disclosure: Persistent notice for parents and children */}
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-[#1E4E8C] font-medium text-center shadow-2xs max-w-2xl mx-auto">
          <Sparkles className="w-4 h-4 text-[#D4A017] shrink-0" />
          <span>
            Mrs Sarah can see which activities you practice each week, to help support your learning journey.
          </span>
        </div>

        {/* Child Mode Playful Tab Navigation */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setActiveTab('adventure');
              if (soundEnabled) playChime();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
              activeTab === 'adventure'
                ? 'bg-[#1E4E8C] text-white shadow-md shadow-blue-900/20 ring-2 ring-[#D4A017]'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-[#E8F0FA]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#D4A017]" />
            <span>Today&apos;s Adventure</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('homework');
              if (soundEnabled) playChime();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
              activeTab === 'homework'
                ? 'bg-[#1E4E8C] text-white shadow-md shadow-blue-900/20 ring-2 ring-[#D4A017]'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-[#E8F0FA]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D4A017]" />
            <span>My Homework ({assignments.filter((a) => a.status === 'assigned').length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('activities');
              if (soundEnabled) playChime();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-[#1E4E8C] text-white shadow-md shadow-blue-900/20 ring-2 ring-[#D4A017]'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-[#E8F0FA]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#D4A017]" />
            <span>5 Montessori Games</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('trophies');
              if (soundEnabled) playChime();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
              activeTab === 'trophies'
                ? 'bg-[#1E4E8C] text-white shadow-md shadow-blue-900/20 ring-2 ring-[#D4A017]'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-[#E8F0FA]'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#D4A017]" />
            <span>Star Trophies</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('alphabet_art');
              if (soundEnabled) playChime();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
              activeTab === 'alphabet_art'
                ? 'bg-[#1E4E8C] text-white shadow-md shadow-blue-900/20 ring-2 ring-[#D4A017]'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-[#E8F0FA]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4A017]" />
            <span>Bonus: Alphabet Art</span>
          </button>
        </div>

        {/* Tab 1: Today's Adventure (Mascot Helper + Adaptive Recommendation) */}
        {activeTab === 'adventure' && recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <MascotCharacter
              childName={activeChildName}
              greeting={recommendation.mascotGreeting}
              message={recommendation.mascotPrompt}
              reason={recommendation.reason}
              options={recommendation.options}
              onSelectOption={handleSelectOption}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onPlaySound={playChime}
            />

            {/* Quick Access Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Activity Preview Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#D4A017]/30 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-[#D4A017] shrink-0">
                      {isDailyCompleted ? (
                        <Trophy className="w-5 h-5 text-[#D4A017]" />
                      ) : recommendation.pillar === 'numeracy' ? (
                        <Hash className="w-5 h-5 text-amber-600" />
                      ) : recommendation.pillar === 'phonics' ? (
                        <BookOpen className="w-5 h-5 text-rose-500" />
                      ) : recommendation.pillar === 'practical_life' ? (
                        <Scissors className="w-5 h-5 text-emerald-600" />
                      ) : recommendation.pillar === 'cultural' ? (
                        <Globe className="w-5 h-5 text-sky-600" />
                      ) : (
                        <Palette className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <span className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {isDailyCompleted ? 'Today’s Journey Finished' : "Mrs Sarah's Pick For Today"}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-[#1E4E8C]">
                    {isDailyCompleted ? 'All 5 Montessori Pillars Complete!' : recommendation.pillarTitle}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {isDailyCompleted
                      ? `Great job today, ${activeChildName}! You completed every pillar activity. Explore your trophies or rest until tomorrow!`
                      : recommendation.reason}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isDailyCompleted) {
                      setActiveTab('trophies');
                    } else {
                      setActivePillar(recommendation.pillar);
                      setActiveTab('activities');
                    }
                    if (soundEnabled) playChime();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#D4A017] text-white font-heading font-extrabold text-sm hover:bg-[#B4820A] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isDailyCompleted
                      ? 'Explore Star Trophies'
                      : `Start ${recommendation.pillarTitle}`}
                  </span>
                </button>
              </div>

              {/* Homework Card Preview */}
              {recommendation.activeAssignment ? (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#1E4E8C] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        Home Practice Due Soon
                      </span>
                    </div>

                    <h3 className="font-heading font-extrabold text-lg text-[#1E4E8C]">
                      {recommendation.activeAssignment.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#6B7280] line-clamp-2">
                      {recommendation.activeAssignment.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('homework');
                      if (soundEnabled) playChime();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#1E4E8C] text-white font-heading font-extrabold text-sm hover:bg-[#153763] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#D4A017]" />
                    <span>Open Home Activity</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        Achievement Showcase
                      </span>
                    </div>

                    <h3 className="font-heading font-extrabold text-lg text-[#1E4E8C]">
                      Your Star Trophies
                    </h3>

                    <p className="text-xs sm:text-sm text-[#6B7280]">
                      Look at all the incredible milestones you have unlocked with Mrs Sarah!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('trophies');
                      if (soundEnabled) playChime();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-white border-2 border-[#1E4E8C] text-[#1E4E8C] font-heading font-extrabold text-sm hover:bg-[#E8F0FA] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-[#D4A017]" />
                    <span>View Trophy Room</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 2: My Homework */}
        {activeTab === 'homework' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChildHomeworkView
              childId={selectedChildId}
              childName={activeChildName}
              assignments={assignments}
              onAssignmentCompleted={refreshChildData}
            />
          </motion.div>
        )}

        {/* Tab 3: 5 Montessori Games (Reusing MontessoriPillarActivities in Child Mode) */}
        {activeTab === 'activities' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <MontessoriPillarActivities
              activePillar={activePillar}
              onPillarChange={(p) => {
                setActivePillar(p);
                if (soundEnabled) playChime();
              }}
              isChildMode={true}
              childId={selectedChildId}
              childName={activeChildName}
              completedPillars={completedPillars}
              isDailyCompleted={isDailyCompleted}
              onCompleteActivity={handleActivityCompleted}
              onCompletePillar={handlePillarCompleted}
              onAllCompletedToday={() => {
                setIsDailyCompleted(true);
                if (soundEnabled) playCelebration();
              }}
              onViewTrophies={() => {
                setActiveTab('trophies');
                if (soundEnabled) playChime();
              }}
              onViewHomework={() => {
                setActiveTab('homework');
                if (soundEnabled) playChime();
              }}
              onOpenGate={() => setIsGateOpen(true)}
              onResetToday={handleResetToday}
              onPlayAlphabetArt={() => {
                setActiveTab('alphabet_art');
                if (soundEnabled) playChime();
              }}
            />
          </motion.div>
        )}

        {/* Tab 4: Star Trophies Room */}
        {activeTab === 'trophies' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MilestoneTrophyRoom
              childName={activeChildName}
              childMilestones={childMilestones}
              allMilestones={allMilestones}
              onPlayChime={playCelebration}
            />
          </motion.div>
        )}

        {/* Tab 5: Bonus Alphabet Art Activity (Optional Fun, Not a 6th curriculum pillar) */}
        {activeTab === 'alphabet_art' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AlphabetArtActivity
              childName={activeChildName}
              soundEnabled={soundEnabled}
              onBackToActivities={() => {
                setActiveTab('activities');
                if (soundEnabled) playChime();
              }}
            />
          </motion.div>
        )}

      </main>

      {/* 3. CHILD MODE FOOTER (Persistent Disclosure) */}
      <footer className="py-4 text-center text-xs text-[#6B7280] border-t border-amber-200/60 bg-white/50 space-y-1">
        <p className="font-medium text-[#1E4E8C]">
          Mrs Sarah can see which activities you practice each week, to help support your learning journey.
        </p>
        <p className="text-[11px] text-[#9CA3AF]">
          Mrs Sarah Early Years Tutoring &bull; Supervised Child Learning Space
        </p>
      </footer>

      {/* 4. PARENTAL GATE MODAL (To exit Child Mode back to adult dashboard) */}
      <ParentalGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onSuccess={handleGateSuccess}
      />

      {/* 5. MULTI-CHILD SWITCHER MODAL */}
      <AnimatePresence>
        {isChildSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border-2 border-[#D4A017] space-y-4 text-center"
            >
              <h3 className="font-heading font-extrabold text-lg text-[#1E4E8C]">
                Who is Learning Now?
              </h3>
              <p className="text-xs text-[#6B7280]">
                Select which child is using this play and learn session:
              </p>

              <div className="space-y-2 pt-2">
                {childrenList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedChildId(c.id);
                      setIsChildSelectorOpen(false);
                      if (soundEnabled) playChime();
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left font-heading font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${
                      selectedChildId === c.id
                        ? 'bg-[#E8F0FA] border-[#1E4E8C] text-[#1E4E8C]'
                        : 'bg-white border-gray-200 text-[#14263F] hover:border-[#D4A017]'
                    }`}
                  >
                    <span>{c.name}</span>
                    {selectedChildId === c.id && <span className="text-xs text-[#D4A017]">Active</span>}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsChildSelectorOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
