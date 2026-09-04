'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, PlusCircle, Award, Calendar, Sparkles } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Child } from '@/lib/eyt-service';
import AddChildModal from '@/components/AddChildModal';

export default function ChildrenPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [children, setChildren] = useState<Child[]>([]);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  const loadData = () => {
    setChildren(EYTService.getChildren());
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleChildAdded = (newChild: Child) => {
    setChildren([...children, newChild]);
    loadData();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-[#D4A017]" />
            {isOwner ? 'Student Profiles Directory' : 'Family Learning Profiles'}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            {isOwner ? 'Student Directory' : 'My Children'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'View all registered early years learners, developmental age groups, and notes.'
              : 'Manage your children’s profiles, age groupings, and specific learning focus goals.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddChildOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Child Profile
        </button>
      </div>

      {/* Children List */}
      {children.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] mx-auto">
            <Users className="w-8 h-8 text-[#D4A017]" />
          </div>
          <h3 className="font-heading text-xl font-bold text-[#1E4E8C]">
            No children registered yet
          </h3>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto">
            Add your child’s profile to get started with tailored Montessori lessons, milestone tracking, and lesson scheduling.
          </p>
          <button
            onClick={() => setIsAddChildOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all"
          >
            Register First Child
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => {
            const childMilestones = EYTService.getChildMilestones(child.id);
            const achievedCount = childMilestones.filter((m) => m.status === 'achieved').length;
            const inProgressCount = childMilestones.filter((m) => m.status === 'in_progress').length;

            return (
              <div
                key={child.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#D4A017] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1E4E8C] text-[#D4A017] font-heading font-bold text-xl flex items-center justify-center shadow-xs">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#14263F]">
                          {child.name}
                        </h2>
                        <p className="text-xs text-[#6B7280]">
                          Age: {child.age_years ? `${child.age_years} years` : 'Early Years'} • DOB: {child.date_of_birth || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <span className="bg-[#FCFBF7] border border-amber-200 text-[#D4A017] text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {achievedCount} Skills Mastered
                    </span>
                  </div>

                  {/* Learning Goals */}
                  {child.learning_goals && (
                    <div className="p-3.5 bg-[#F3F7FD] rounded-xl border border-[#E8F0FA] text-xs space-y-1">
                      <div className="font-bold text-[#1E4E8C] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                        <span>Curriculum Goals:</span>
                      </div>
                      <p className="text-[#14263F]/90 leading-relaxed">{child.learning_goals}</p>
                    </div>
                  )}

                  {/* Special Notes */}
                  {child.notes && (
                    <div className="p-3 bg-[#FCFBF7] rounded-xl border border-amber-100 text-xs text-[#6B7280] italic">
                      &ldquo;{child.notes}&rdquo;
                    </div>
                  )}

                  {/* Skill stats pill */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg font-medium border border-emerald-100">
                      <strong>{achievedCount}</strong> Achieved
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-lg font-medium border border-amber-100">
                      <strong>{inProgressCount}</strong> In Progress
                    </div>
                  </div>
                </div>

                {/* Footer Link Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <Link
                    href="/app/milestones"
                    className="font-bold text-[#1E4E8C] hover:underline flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>View Milestone Progress</span>
                  </Link>

                  <Link
                    href="/app/schedule"
                    className="font-bold text-[#D4A017] hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Tutorial</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        onChildAdded={handleChildAdded}
      />
    </div>
  );
}
