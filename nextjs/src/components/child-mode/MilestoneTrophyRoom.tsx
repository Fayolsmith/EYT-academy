'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Sparkles, Award, PartyPopper } from 'lucide-react';
import { ChildMilestone, Milestone } from '@/lib/eyt-service';

interface MilestoneTrophyRoomProps {
  childName: string;
  childMilestones: ChildMilestone[];
  allMilestones: Milestone[];
  onPlayChime?: () => void;
}

export default function MilestoneTrophyRoom({
  childName,
  childMilestones,
  allMilestones,
  onPlayChime,
}: MilestoneTrophyRoomProps) {
  const [activeCelebration, setActiveCelebration] = useState<string | null>(null);

  const achievedRecords = childMilestones.filter((cm) => cm.status === 'achieved');

  const handleTrophyTap = (id: string) => {
    setActiveCelebration(id);
    onPlayChime?.();
    setTimeout(() => setActiveCelebration(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Trophy Room Banner */}
      <div className="bg-gradient-to-r from-[#1E4E8C] to-[#153763] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#D4A017] flex items-center justify-center text-[#D4A017] shadow-xs shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              {childName}&apos;s Star Trophies
            </h3>
            <p className="text-xs text-blue-100 max-w-md">
              Every badge is a special milestone you mastered in your lessons with Mrs Sarah!
            </p>
          </div>
        </div>

        <div className="bg-white/10 border border-white/20 px-5 py-2.5 rounded-2xl flex items-center gap-2 relative z-10 shrink-0">
          <Star className="w-5 h-5 text-[#D4A017] fill-[#D4A017]" />
          <span className="font-heading font-extrabold text-lg text-white">
            {achievedRecords.length} Badges Earned
          </span>
        </div>
      </div>

      {/* Trophies Grid */}
      <div className="space-y-4">
        <h4 className="font-heading font-extrabold text-base text-[#1E4E8C] flex items-center gap-2">
          <span>Tap a Star Trophy to Celebrate!</span>
          <Sparkles className="w-4 h-4 text-[#D4A017]" />
        </h4>

        {achievedRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-amber-200 space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#D4A017] flex items-center justify-center mx-auto border border-amber-200">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-base text-[#1E4E8C]">
              Your Trophy Case is Ready, {childName}!
            </h4>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              As you practice phonics, counting, and practical skills in your tutorials, Mrs Sarah will unlock your golden star trophies here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievedRecords.map((cm) => {
              const milestone =
                cm.milestone || allMilestones.find((m) => m.id === cm.milestone_id);
              const isTapped = activeCelebration === cm.id;

              return (
                <motion.div
                  key={cm.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTrophyTap(cm.id)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 select-none ${
                    isTapped
                      ? 'bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 border-[#D4A017] shadow-lg ring-4 ring-amber-200'
                      : 'bg-white border-[#E5E0D8] hover:border-[#D4A017] shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#D4A017] flex items-center justify-center shadow-xs">
                        <Star className="w-6 h-6 fill-[#D4A017]" />
                      </div>

                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Achieved
                      </span>
                    </div>

                    <div>
                      <h5 className="font-heading font-extrabold text-base text-[#1E4E8C]">
                        {milestone?.name || 'Montessori Mastery'}
                      </h5>
                      <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                        {milestone?.description || 'Milestone achieved in tutoring session.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>
                      {cm.date_achieved
                        ? `Achieved ${new Date(cm.date_achieved).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Verified with Mrs Sarah'}
                    </span>
                    <span className="font-bold text-[#D4A017] inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Tap to Shine</span>
                    </span>
                  </div>

                  {/* Celebration popover */}
                  {isTapped && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-[#1E4E8C]/95 text-white p-6 flex flex-col items-center justify-center text-center space-y-2 z-20"
                    >
                      <PartyPopper className="w-8 h-8 text-[#D4A017]" />
                      <h4 className="font-heading font-extrabold text-sm text-white">
                        Hooray, {childName}!
                      </h4>
                      <p className="text-xs text-blue-100">
                        Mrs Sarah is so proud of this milestone! Keep shining!
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
