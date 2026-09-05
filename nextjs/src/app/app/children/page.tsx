'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, PlusCircle, Award, Calendar, Sparkles, CheckCircle2, Clock, Mail, Phone, Info, BookOpen } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Child } from '@/lib/eyt-service';
import AddChildModal from '@/components/AddChildModal';
import { StaggerContainer, StaggerItem, MotionCard, MotionButton, Skeleton, useToast } from '@/components/motion';

export default function ChildrenPage() {
  const { profile } = useGlobal();
  const { showToast } = useToast();
  const isOwner = profile?.role === 'owner';

  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  const loadData = useCallback(() => {
    if (isOwner) {
      setChildren(EYTService.getChildren());
    } else {
      setChildren(EYTService.getChildren(profile?.id));
    }
    setIsLoading(false);
  }, [isOwner, profile?.id]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      loadData();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleChildAdded = (newChild: Child) => {
    setChildren([...children, newChild]);
    loadData();
    showToast(isOwner ? 'Student profile enrolled successfully!' : 'Child profile registered successfully!');
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
              ? 'View all enrolled early years learners, link parent contacts, and track portal activation status.'
              : 'Manage your children’s profiles, age groupings, and tailored learning focus goals.'}
          </p>
        </div>

        <MotionButton
          onClick={() => setIsAddChildOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          {isOwner ? 'Enroll Student' : 'Add Child Profile'}
        </MotionButton>
      </div>

      {/* Owner Info Box regarding Parent Linking */}
      {isOwner && (
        <div className="p-4 bg-[#E8F0FA]/70 border border-[#C7DAF3] rounded-2xl flex items-start gap-3 text-xs text-[#1E4E8C]">
          <Info className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#1E4E8C]">Montessori Learner & Parent Profile Binding</p>
            <p className="text-gray-600 leading-relaxed">
              When you enroll a child with a parent’s email, you can immediately manage schedules, lesson notes, and milestones.
              As soon as the parent registers at <strong>/signup</strong> with that matching email, this profile will automatically connect to their Parent Portal account without creating duplicates.
            </p>
          </div>
        </div>
      )}

      {/* Children List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-36 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-16 rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-xl" />
                <Skeleton className="h-8 flex-1 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : children.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] mx-auto">
            <Users className="w-8 h-8 text-[#D4A017]" />
          </div>
          <h3 className="font-heading text-xl font-bold text-[#1E4E8C]">
            {isOwner ? 'No students enrolled yet' : 'No children registered yet'}
          </h3>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto">
            {isOwner
              ? 'Enroll your existing tutorial students and connect them with their parent contacts to begin tracking milestones.'
              : 'Add your child’s profile to get started with tailored Montessori lessons, milestone tracking, and lesson scheduling.'}
          </p>
          <MotionButton
            onClick={() => setIsAddChildOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all"
          >
            {isOwner ? 'Enroll First Student' : 'Register First Child'}
          </MotionButton>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => {
            const childMilestones = EYTService.getChildMilestones(child.id);
            const achievedCount = childMilestones.filter((m) => m.status === 'achieved').length;
            const inProgressCount = childMilestones.filter((m) => m.status === 'in_progress').length;

            return (
              <StaggerItem key={child.id}>
                <MotionCard
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#D4A017] hover:shadow-md transition-all space-y-4 flex flex-col justify-between h-full"
                >
                  <div className="space-y-4">
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {child.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={child.avatar_url}
                            alt={child.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-[#D4A017] shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-[#1E4E8C] text-[#D4A017] font-heading font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
                            {child.name.charAt(0)}
                          </div>
                        )}
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#14263F]">
                          {child.name}
                        </h2>
                        <p className="text-xs text-[#6B7280]">
                          Age: {child.age_years ? `${child.age_years} years` : 'Early Years'} • DOB: {child.date_of_birth || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge in Owner View */}
                    {isOwner ? (
                      <div>
                        {child.has_portal_account ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Portal Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            No portal access yet
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="bg-[#FCFBF7] border border-amber-200 text-[#D4A017] text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {achievedCount} Skills Mastered
                      </span>
                    )}
                  </div>

                  {/* Owner View: Parent Contact Details & Transition Status */}
                  {isOwner && (
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-gray-200/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[#1E4E8C]">
                        <span>Parent Contact:</span>
                        {!child.has_portal_account && (
                          <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded font-semibold">
                            Awaiting Signup
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-[#14263F]">
                        {child.parent_name || 'Parent name unrecorded'}
                      </div>
                      <div className="text-xs text-[#6B7280] flex flex-wrap items-center gap-x-4 gap-y-1">
                        {child.parent_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {child.parent_email}
                          </span>
                        )}
                        {child.parent_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {child.parent_phone}
                          </span>
                        )}
                      </div>
                      {!child.has_portal_account && child.parent_email && (
                        <p className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-100">
                          Auto-links when parent creates an account with {child.parent_email}
                        </p>
                      )}
                    </div>
                  )}

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
                      <strong>{achievedCount}</strong> Mastered
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-lg font-medium border border-amber-100">
                      <strong>{inProgressCount}</strong> In Progress
                    </div>
                  </div>
                </div>

                {/* Footer Link Actions */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <Link
                    href="/app/milestones"
                    className="font-bold text-[#1E4E8C] hover:underline flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>View Milestones</span>
                  </Link>

                  {isOwner && (
                    <Link
                      href={`/app/assignments?childId=${child.id}&action=create`}
                      className="font-bold text-[#1E4E8C] bg-[#E8F0FA] hover:bg-[#d8e6f7] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors border border-[#1E4E8C]/20 shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>Assign Homework</span>
                    </Link>
                  )}

                  <Link
                    href="/app/schedule"
                    className="font-bold text-[#D4A017] hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isOwner ? 'Schedule Slot' : 'Schedule Tutorial'}</span>
                  </Link>
                </div>
              </MotionCard>
            </StaggerItem>
            );
          })}
        </StaggerContainer>
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
