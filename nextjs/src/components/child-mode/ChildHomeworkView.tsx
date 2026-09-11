'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
  Smile,
  PartyPopper,
  Check
} from 'lucide-react';
import { Assignment, EYTService } from '@/lib/eyt-service';

interface ChildHomeworkViewProps {
  childId: string;
  childName: string;
  assignments: Assignment[];
  onAssignmentCompleted?: () => void;
}

export default function ChildHomeworkView({
  childName,
  assignments,
  onAssignmentCompleted,
}: ChildHomeworkViewProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const activeAssignments = assignments.filter((a) => a.status === 'assigned');
  const completedAssignments = assignments.filter((a) => a.status === 'submitted' || a.status === 'reviewed');

  const handleStartComplete = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsConfirming(true);
  };

  const handleConfirmCompletion = async () => {
    if (!selectedAssignment) return;
    setIsSubmitting(true);

    try {
      // Under parent's authenticated session, mark assignment as completed with friendly child mode note
      EYTService.submitAssignment(selectedAssignment.id, {
        submissionNote: `Completed during Child Mode play session with ${childName}. Activity attempted and finished!`,
      });

      setCelebratingId(selectedAssignment.id);
      setIsConfirming(false);
      setSelectedAssignment(null);
      onAssignmentCompleted?.();

      setTimeout(() => {
        setCelebratingId(null);
      }, 4000);
    } catch (e) {
      console.error('Failed to submit assignment in child mode', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#FCFBF7] rounded-3xl p-6 sm:p-8 border-2 border-[#D4A017]/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1E4E8C] text-[#D4A017] flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#1E4E8C]">
              {childName}&apos;s Learning Adventures
            </h3>
            <p className="text-xs text-[#6B7280]">
              Fun home activities and practice specially selected by Mrs Sarah!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-amber-200">
          <Sparkles className="w-4 h-4 text-[#D4A017]" />
          <span className="text-xs font-bold text-[#14263F]">
            {activeAssignments.length} Activities Ready
          </span>
        </div>
      </div>

      {/* Active Homework Cards */}
      <div className="space-y-4">
        <h4 className="font-heading font-extrabold text-base text-[#1E4E8C] flex items-center gap-2">
          <span>Let&apos;s Do This Together!</span>
          <Smile className="w-4 h-4 text-[#D4A017]" />
        </h4>

        {activeAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-emerald-200 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <PartyPopper className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#1E4E8C]">
              All Caught Up, {childName}!
            </h4>
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto">
              You have completed all your home activities! You can explore the 5 Montessori games in the activities tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeAssignments.map((asgn) => {
              const isCelebrating = celebratingId === asgn.id;
              return (
                <div
                  key={asgn.id}
                  className="relative bg-white rounded-3xl p-6 border-2 border-[#D4A017]/30 shadow-xs hover:border-[#D4A017] transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#D4A017] border border-amber-200 text-[11px] font-extrabold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        {asgn.milestone_area || 'Montessori Practice'}
                      </span>

                      {asgn.due_date && (
                        <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due {new Date(asgn.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-[#1E4E8C]">
                      {asgn.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-[#14263F]/90 leading-relaxed">
                      {asgn.description}
                    </p>

                    {asgn.materials_needed && (
                      <div className="bg-[#FCFBF7] p-3.5 rounded-2xl border border-[#F3E7C4] text-xs text-[#14263F]">
                        <span className="font-bold text-[#D4A017]">What you need: </span>
                        <span>{asgn.materials_needed}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {isCelebrating ? (
                      <div className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs">
                        <PartyPopper className="w-5 h-5" />
                        <span>Completed! Great Job, {childName}!</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartComplete(asgn)}
                        className="w-full py-3.5 rounded-2xl bg-[#1E4E8C] text-white font-heading font-extrabold text-sm hover:bg-[#153763] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Check className="w-5 h-5 text-[#D4A017]" />
                        <span>I Did This Activity!</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Activities Showcase */}
      {completedAssignments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="font-heading font-extrabold text-base text-[#1E4E8C] flex items-center gap-2">
            <span>Completed Star Work</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {completedAssignments.length}
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedAssignments.map((cAsgn) => (
              <div
                key={cAsgn.id}
                className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-heading font-bold text-xs text-[#1E4E8C] truncate">
                    {cAsgn.title}
                  </h5>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Completed &bull; Mrs Sarah notified!
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple Big-Button Confirmation Modal for Child */}
      <AnimatePresence>
        {isConfirming && selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#D4A017] text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 text-[#D4A017] flex items-center justify-center mx-auto shadow-xs">
                <PartyPopper className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#1E4E8C]">
                  All Done, {childName}?
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Did you finish &ldquo;<strong className="text-[#14263F]">{selectedAssignment.title}</strong>&rdquo; with Mummy, Daddy, or Mrs Sarah?
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmCompletion}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#D4A017] text-white font-heading font-extrabold text-base hover:bg-[#B4820A] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>{isSubmitting ? 'Saving...' : 'Yes, I Completed It!'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Not yet, keep working
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
