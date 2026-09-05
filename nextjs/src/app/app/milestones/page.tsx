'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, BookOpen, Hash, Scissors, Globe, Palette } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Milestone, Child, MilestoneStatus } from '@/lib/eyt-service';
import {
  StaggerContainer,
  StaggerItem,
  Skeleton,
  MilestoneAchievementBadge,
  useToast,
} from '@/components/motion';

export default function MilestonesPage() {
  const { profile } = useGlobal();
  const { showToast } = useToast();
  const isOwner = profile?.role === 'owner';

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAchievedId, setRecentAchievedId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const childList = EYTService.getChildren();
    setChildren(childList);
    if (childList.length > 0 && !selectedChildId) {
      setSelectedChildId(childList[0].id);
    }
    setMilestones(EYTService.getMilestones());
    setIsLoading(false);
  }, [selectedChildId]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      loadData();
    }, 150);
    return () => clearTimeout(timer);
  }, [profile, loadData]);

  const subjectAreas: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'all', label: 'All Areas', icon: Award },
    { key: 'literacy', label: 'Phonics & Literacy', icon: BookOpen },
    { key: 'numeracy', label: 'Early Numeracy', icon: Hash },
    { key: 'practical_life', label: 'Practical Life', icon: Scissors },
    { key: 'cultural', label: 'Cultural & World', icon: Globe },
    { key: 'arts', label: 'Creative Arts', icon: Palette },
  ];

  const filteredMilestones = selectedArea === 'all'
    ? milestones
    : milestones.filter((m) => m.subject_area === selectedArea);

  const childMilestones = selectedChildId
    ? EYTService.getChildMilestones(selectedChildId)
    : [];

  const handleStatusChange = (milestoneId: string, newStatus: MilestoneStatus) => {
    if (!selectedChildId) return;
    EYTService.updateChildMilestone(selectedChildId, milestoneId, newStatus);
    if (newStatus === 'achieved') {
      setRecentAchievedId(milestoneId);
      showToast('🌟 Milestone marked Achieved! Developmental milestone recorded.');
      setTimeout(() => setRecentAchievedId(null), 3500);
    } else {
      showToast(`Milestone marked as ${newStatus.replace('_', ' ')}.`);
    }
    loadData();
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-[#D4A017]" />
            Montessori Curriculum Progression
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Milestones & Progress Tracking
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'Evaluate student developmental milestones across the 5 Montessori foundational areas.'
              : 'Follow your child’s mastery in phonics, numbers, independence, and fine motor skills.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app/assignments"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-colors border border-[#1E4E8C]/20 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>{isOwner ? 'Assign & Review Homework →' : 'Home Activities & Homework →'}</span>
          </Link>

          {/* Child Selector */}
          {children.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14263F]">Student:</span>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white text-[#1E4E8C] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Age {c.age_years || '—'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="w-24 h-14 rounded-xl" />
              <Skeleton className="w-24 h-14 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ) : children.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0FA] flex items-center justify-center mx-auto text-[#1E4E8C]">
            <Award className="w-7 h-7 text-[#D4A017]" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-heading font-bold text-lg text-[#14263F]">
              No Children Profiles Found
            </h3>
            <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
              {isOwner
                ? 'To track Montessori milestones, add student profiles under My Children or link them during registration.'
                : 'To view developmental milestones, please add your child’s profile under My Children in your dashboard.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Child Summary Card */}
          {selectedChild && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                {selectedChild.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedChild.avatar_url}
                    alt={selectedChild.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#D4A017] shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#1E4E8C] text-[#D4A017] font-heading font-bold text-2xl flex items-center justify-center border border-[#D4A017] shrink-0">
                    {selectedChild.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#14263F]">
                    {selectedChild.name}&apos;s Learning Journey
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Montessori Early Years • Age {selectedChild.age_years || '3-8'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-center">
                  <span className="block text-lg font-bold">
                    {childMilestones.filter((m) => m.status === 'achieved').length}
                  </span>
                  Skills Achieved
                </div>
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-center">
                  <span className="block text-lg font-bold">
                    {childMilestones.filter((m) => m.status === 'in_progress').length}
                  </span>
                  In Progress
                </div>
                <div className="p-3 bg-blue-50 text-[#1E4E8C] rounded-xl border border-blue-100 text-center">
                  <span className="block text-lg font-bold">{milestones.length}</span>
                  Total Curriculum
                </div>
              </div>
            </div>
          )}

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {subjectAreas.map((area) => {
              const Icon = area.icon;
              const isActive = selectedArea === area.key;
              return (
                <button
                  key={area.key}
                  onClick={() => setSelectedArea(area.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#1E4E8C] text-white shadow-sm'
                      : 'bg-white text-[#14263F] border border-gray-200 hover:bg-[#E8F0FA]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4A017]' : 'text-[#6B7280]'}`} />
                  <span>{area.label}</span>
                </button>
              );
            })}
          </div>

          {/* Milestones Cards Grid */}
          {filteredMilestones.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-[#6B7280]">
              No milestones defined for this subject area.
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMilestones.map((milestone) => {
                const record = childMilestones.find((cm) => cm.milestone_id === milestone.id);
                const currentStatus = record?.status || 'not_started';

                return (
                  <StaggerItem key={milestone.id}>
                    <div
                      className={`bg-white rounded-2xl p-5 border transition-all space-y-3 h-full ${
                        currentStatus === 'achieved'
                          ? 'border-emerald-200 bg-emerald-50/15'
                          : currentStatus === 'in_progress'
                          ? 'border-amber-200 bg-amber-50/15'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F0FA] text-[#1E4E8C]">
                              {milestone.subject_area.replace('_', ' ')}
                            </span>
                            {milestone.target_age_group && (
                              <span className="text-[10px] text-[#6B7280]">
                                Age {milestone.target_age_group}
                              </span>
                            )}
                          </div>
                          <h3 className="font-heading font-bold text-base text-[#14263F]">
                            {milestone.name}
                          </h3>
                          {milestone.description && (
                            <p className="text-xs text-[#6B7280] leading-relaxed">
                              {milestone.description}
                            </p>
                          )}
                        </div>

                        {/* Status Badge with Achievement Moment */}
                        {currentStatus === 'achieved' ? (
                          <MilestoneAchievementBadge
                            label="Achieved"
                            isRecent={recentAchievedId === milestone.id}
                          />
                        ) : (
                          <span
                            className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 uppercase ${
                              currentStatus === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {currentStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>

              {record?.notes && (
                <div className="p-2.5 bg-white rounded-lg border border-gray-100 text-xs text-[#14263F]/90 italic">
                  Teacher note: &ldquo;{record.notes}&rdquo;
                </div>
              )}

              {record?.date_achieved && (
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Achieved on {record.date_achieved}
                </div>
              )}

              {/* Owner Evaluation Controls */}
              {isOwner && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[#6B7280] font-medium">Update status:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange(milestone.id, 'not_started')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        currentStatus === 'not_started' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Not Started
                    </button>
                    <button
                      onClick={() => handleStatusChange(milestone.id, 'in_progress')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        currentStatus === 'in_progress' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(milestone.id, 'achieved')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        currentStatus === 'achieved' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Achieved ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
      </>
      )}
    </div>
  );
}
