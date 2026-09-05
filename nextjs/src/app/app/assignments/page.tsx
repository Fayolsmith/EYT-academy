'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  FileText,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Upload,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import {
  EYTService,
  Assignment,
  AssignmentSubmission,
  Child,
  Milestone,
  Resource
} from '@/lib/eyt-service';

type OwnerTab = 'queue' | 'all' | 'reviewed';
type ParentTab = 'assigned' | 'submitted' | 'reviewed';

export default function AssignmentsPage() {
  const router = useRouter();
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Tabs
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('queue');
  const [parentTab, setParentTab] = useState<ParentTab>('assigned');

  // Feedback notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reviewingAssignment, setReviewingAssignment] = useState<{
    assignment: Assignment;
    submission: AssignmentSubmission;
  } | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [photoPreviewModalUrl, setPhotoPreviewModalUrl] = useState<string | null>(null);

  // 1. Create Assignment Form State (Owner) - STRICTLY 1:1 single child
  const [createChildId, setCreateChildId] = useState<string>('');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createMilestoneId, setCreateMilestoneId] = useState<string>('');
  const [createResourceId, setCreateResourceId] = useState<string>('');
  const [createDueDate, setCreateDueDate] = useState<string>('');
  const [suggestedSessionLabel, setSuggestedSessionLabel] = useState<string | null>(null);

  // 2. Submit Assignment Form State (Parent)
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionPhotoUrl, setSubmissionPhotoUrl] = useState<string>('');

  // 3. Review Assignment Form State (Owner)
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [markMilestoneAchieved, setMarkMilestoneAchieved] = useState(true);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  // Helper to update selected child for assignment and compute smart next session due date
  const updateChildForAssignment = useCallback((childId: string) => {
    setCreateChildId(childId);
    if (!childId) {
      setCreateDueDate('');
      setSuggestedSessionLabel(null);
      return;
    }

    // Smart default: Query next upcoming confirmed session for this specific child
    const nextSession = EYTService.getNextConfirmedSession(childId);
    if (nextSession) {
      const sessionDate = new Date(nextSession.start_time).toISOString().split('T')[0];
      const sessionFormatted = new Date(nextSession.start_time).toLocaleDateString('en-GB', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      setCreateDueDate(sessionDate);
      setSuggestedSessionLabel(`Due by next session — ${sessionFormatted}`);
    } else {
      // Fallback: No upcoming session booked — plain required manual date entry with no default
      setCreateDueDate('');
      setSuggestedSessionLabel(null);
    }
  }, []);

  const handleOpenCreateForChild = useCallback((childId?: string) => {
    if (!childId) {
      router.push('/app/children');
      return;
    }
    updateChildForAssignment(childId);
    setIsCreateModalOpen(true);
  }, [router, updateChildForAssignment]);

  const loadData = useCallback(() => {
    try {
      const childList = isOwner ? EYTService.getChildren() : EYTService.getChildren(profile?.id);
      setChildren(childList);
      setMilestones(EYTService.getMilestones());
      setResources(EYTService.getResources());

      const asgnList = EYTService.getAssignments();
      setAssignments(asgnList);
    } catch (err) {
      console.error('Failed to load assignments data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isOwner, profile?.id]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    return () => clearTimeout(timer);
  }, [profile, loadData]);

  // Read URL params on mount (e.g. ?childId=xxx&action=create)
  useEffect(() => {
    if (typeof window !== 'undefined' && children.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlChildId = params.get('childId');
      const action = params.get('action');
      if (urlChildId) {
        setSelectedChildFilter(urlChildId);
        if (action === 'create' && isOwner) {
          updateChildForAssignment(urlChildId);
          setIsCreateModalOpen(true);
          window.history.replaceState({}, '', `/app/assignments?childId=${urlChildId}`);
        }
      }
    }
  }, [isOwner, children, updateChildForAssignment]);

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    if (selectedChildFilter !== 'all' && a.child_id !== selectedChildFilter) {
      return false;
    }
    return true;
  });

  // Split by status
  const assignedList = filteredAssignments.filter((a) => a.status === 'assigned');
  const submittedList = filteredAssignments.filter((a) => a.status === 'submitted');
  const reviewedList = filteredAssignments.filter((a) => a.status === 'reviewed');

  // Submissions map
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission>>({});

  useEffect(() => {
    const allSubs = EYTService.getAssignmentSubmissions();
    const map: Record<string, AssignmentSubmission> = {};
    for (const sub of allSubs) {
      map[sub.assignment_id] = sub;
    }
    setSubmissions(map);
  }, [assignments]);

  // ------------------------------------------------
  // HANDLERS
  // ------------------------------------------------
  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createChildId) {
      showError('Please select a student for this assignment.');
      return;
    }
    if (!createTitle.trim() || !createDescription.trim()) {
      showError('Title and home practice instructions are required.');
      return;
    }
    if (!createDueDate || !createDueDate.trim()) {
      showError('Target due date is required. Homework must have a clear completion deadline.');
      return;
    }

    try {
      const created = EYTService.createAssignment({
        childId: createChildId,
        title: createTitle,
        description: createDescription,
        milestoneId: createMilestoneId || null,
        resourceId: createResourceId || null,
        dueDate: createDueDate.trim(),
      });

      showSuccess(
        `Successfully assigned "${createTitle}" to ${created.child_name || 'student'}. Parent email notification sent.`
      );
      setIsCreateModalOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateMilestoneId('');
      setCreateResourceId('');
      setCreateDueDate('');
      setSuggestedSessionLabel(null);
      loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create assignment.');
    }
  };

  const handleOpenSubmitModal = (assignment: Assignment) => {
    setSubmittingAssignment(assignment);
    const existingSub = submissions[assignment.id];
    setSubmissionNote(existingSub?.submission_note || '');
    setSubmissionPhotoUrl(existingSub?.submission_photo_url || '');
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    if (!submissionNote.trim()) {
      showError('Please include a brief note explaining how your child completed the activity.');
      return;
    }

    try {
      EYTService.submitAssignment(submittingAssignment.id, {
        submissionNote: submissionNote.trim(),
        submissionPhotoUrl: submissionPhotoUrl.trim() || null,
      });

      showSuccess(
        'Homework submitted for Mrs Sarah’s review! An alert has been dispatched to her review queue.'
      );
      setSubmittingAssignment(null);
      setSubmissionNote('');
      setSubmissionPhotoUrl('');
      loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit homework.');
    }
  };

  const handleOpenReviewModal = (assignment: Assignment) => {
    const sub = submissions[assignment.id];
    if (!sub) {
      showError('Submission record not found.');
      return;
    }
    setReviewingAssignment({ assignment, submission: sub });
    setReviewFeedback(sub.tutor_feedback || '');
    setMarkMilestoneAchieved(Boolean(assignment.milestone_id));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingAssignment) return;

    if (!reviewFeedback.trim()) {
      showError('Please provide teacher feedback for the learner and parents.');
      return;
    }

    try {
      EYTService.reviewAssignment(reviewingAssignment.assignment.id, {
        tutorFeedback: reviewFeedback.trim(),
        markMilestoneAchieved: Boolean(markMilestoneAchieved),
      });

      showSuccess(
        `Assignment reviewed and feedback saved.${
          markMilestoneAchieved ? ' Linked milestone marked as Achieved!' : ''
        } Parent notification dispatched.`
      );
      setReviewingAssignment(null);
      setReviewFeedback('');
      loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to record review.');
    }
  };

  // Sample photos for convenient evidence preview testing
  const SAMPLE_EVIDENCE_PHOTOS = [
    { label: 'Scissor cutting', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Beads counting', url: 'https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sound card tracing', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80' },
  ];

  const selectedChild = children.find((c) => c.id === createChildId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
            Continuous Assessment & Home Practice
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Homework & Assessment Activities
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'Assign 1:1 individualized Montessori activities, inspect student evidence/notes, and certify curriculum progression.'
              : 'Practice developmental milestones at home with your learner, upload photos/notes, and receive Mrs Sarah’s feedback.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Child Filter */}
          {children.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14263F]">Filter Student:</span>
              <select
                value={selectedChildFilter}
                onChange={(e) => setSelectedChildFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white text-[#1E4E8C] focus:ring-2 focus:ring-[#1E4E8C] outline-none shadow-2xs"
              >
                <option value="all">All Enrolled Students</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Owner Create Assignment Button */}
          {isOwner && (
            selectedChildFilter !== 'all' ? (
              <button
                onClick={() => handleOpenCreateForChild(selectedChildFilter)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shadow-xs cursor-pointer"
                title={`Assign homework to ${children.find((c) => c.id === selectedChildFilter)?.name || 'Student'}`}
              >
                <PlusCircle className="w-4 h-4 text-[#D4A017]" />
                <span>Assign Homework to {children.find((c) => c.id === selectedChildFilter)?.name || 'Student'}</span>
              </button>
            ) : (
              <Link
                href="/app/children"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-[#D4A017]" />
                <span>Assign Homework (Select Student in Directory)</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TABS NAVIGATION                                           */}
      {/* ========================================================= */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        {isOwner ? (
          <>
            <button
              onClick={() => setOwnerTab('queue')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                ownerTab === 'queue'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14263F] hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Review Queue</span>
              {submittedList.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4A017] text-white">
                  {submittedList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setOwnerTab('all')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                ownerTab === 'all'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14263F] hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>All Active Assignments</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
                {assignedList.length}
              </span>
            </button>

            <button
              onClick={() => setOwnerTab('reviewed')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                ownerTab === 'reviewed'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14263F] hover:bg-gray-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Reviewed History</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
                {reviewedList.length}
              </span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setParentTab('assigned')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                parentTab === 'assigned'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14263F] hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>To Do at Home</span>
              {assignedList.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A017] text-white">
                  {assignedList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setParentTab('submitted')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                parentTab === 'submitted'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14263F] hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Awaiting Review</span>
              {submittedList.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {submittedList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setParentTab('reviewed')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                parentTab === 'reviewed'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14263F] hover:bg-gray-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Reviewed & Feedback</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {reviewedList.length}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-3xl border border-gray-200" />
          ))}
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* OWNER VIEW: REVIEW QUEUE                                  */}
          {/* ========================================================= */}
          {isOwner && ownerTab === 'queue' && (
            <div className="space-y-6">
              {submittedList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F0FA] flex items-center justify-center mx-auto text-[#1E4E8C]">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                    Review Queue is Clear!
                  </h3>
                  <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                    There are no pending homework submissions awaiting review right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {submittedList.map((assignment) => {
                    const sub = submissions[assignment.id];
                    return (
                      <div
                        key={assignment.id}
                        className="bg-white rounded-3xl border-2 border-amber-200 p-6 space-y-5 shadow-xs relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                          Ready for Review
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F0FA] text-[#1E4E8C]">
                              {assignment.child_name}
                            </span>
                            <span className="text-[11px] text-[#6B7280]">
                              Submitted by {sub?.submitted_by_name || assignment.parent_name}
                            </span>
                          </div>
                          <h3 className="font-heading font-bold text-lg text-[#14263F]">
                            {assignment.title}
                          </h3>
                        </div>

                        {/* Milestone Tag */}
                        {assignment.milestone_name && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                            <Award className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                            <span>Linked Skill: {assignment.milestone_name}</span>
                          </div>
                        )}

                        {/* Parent Note & Evidence */}
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                            Parent Observation / Note:
                          </span>
                          <p className="text-xs text-[#14263F] italic leading-relaxed">
                            &ldquo;{sub?.submission_note}&rdquo;
                          </p>

                          {/* Evidence Photo */}
                          {sub?.submission_photo_url && (
                            <div>
                              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">
                                Photo Evidence:
                              </span>
                              <div
                                onClick={() => setPhotoPreviewModalUrl(sub.submission_photo_url)}
                                className="relative group cursor-pointer w-32 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-2xs"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={sub.submission_photo_url}
                                  alt="Homework evidence"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                  Enlarge 🔍
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Review Action Button */}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleOpenReviewModal(assignment)}
                            className="px-4 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <span>Review & Leave Feedback</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#D4A017]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* OWNER VIEW: ALL ACTIVE ASSIGNMENTS                        */}
          {/* ========================================================= */}
          {isOwner && ownerTab === 'all' && (
            <div className="space-y-6">
              {assignedList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                  <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
                  <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
                    No Active Assigned Homework
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    To assign homework, open any student&apos;s card in the Student Directory and click &ldquo;Assign Homework&rdquo;.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/app/children"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8F0FA] text-[#1E4E8C] font-bold text-xs hover:bg-[#d8e6f7] transition-all border border-[#1E4E8C]/20 shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>Select Student in Directory →</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignedList.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F0FA] text-[#1E4E8C]">
                            {a.child_name}
                          </span>
                          <span className="text-[11px] text-[#1E4E8C] flex items-center gap-1 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            <Calendar className="w-3 h-3 text-[#D4A017]" />
                            Due: {new Date(a.due_date || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        <h3 className="font-heading font-bold text-base text-[#14263F]">
                          {a.title}
                        </h3>

                        <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">
                          {a.description}
                        </p>

                        {a.milestone_name && (
                          <div className="text-[11px] font-semibold text-[#1E4E8C] flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                            <span className="truncate">{a.milestone_name}</span>
                          </div>
                        )}

                        {a.resource_title && (
                          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{a.resource_title}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#6B7280]">
                        <span>Assigned {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Awaiting Family
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* OWNER: REVIEWED ARCHIVE                                   */}
          {/* ========================================================= */}
          {isOwner && ownerTab === 'reviewed' && (
            <div className="space-y-6">
              {reviewedList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-gray-400 mx-auto" />
                  <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
                    No Reviewed Assignments Yet
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Completed and approved homework will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviewedList.map((a) => {
                    const sub = submissions[a.id];
                    return (
                      <div
                        key={a.id}
                        className="bg-white rounded-3xl border border-gray-200 p-6 space-y-5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F0FA] text-[#1E4E8C]">
                            {a.child_name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Reviewed & Approved
                          </span>
                        </div>

                        <div>
                          <h3 className="font-heading font-bold text-lg text-[#14263F]">
                            {a.title}
                          </h3>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {a.description}
                          </p>
                        </div>

                        {/* Milestone Achieved Banner */}
                        {sub?.milestone_marked_achieved && a.milestone_name && (
                          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
                            <Award className="w-4 h-4 text-[#D4A017] shrink-0" />
                            <span>Milestone Achieved: {a.milestone_name} 🎉</span>
                          </div>
                        )}

                        {/* Mrs Sarah Feedback Card */}
                        {sub?.tutor_feedback && (
                          <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider">
                                Mrs Sarah&apos;s Feedback:
                              </span>
                              {sub.reviewed_at && (
                                <span className="text-[10px] text-[#6B7280]">
                                  {new Date(sub.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#14263F] leading-relaxed">
                              &ldquo;{sub.tutor_feedback}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PARENT PORTAL: GROUPED PER CHILD                          */}
          {/* ========================================================= */}
          {!isOwner && (
            <div className="space-y-10">
              {children.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                  <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
                  <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
                    No Enrolled Learners Found
                  </h3>
                </div>
              ) : (
                children.map((child) => {
                  if (selectedChildFilter !== 'all' && selectedChildFilter !== child.id) {
                    return null;
                  }

                  const childAssigned = assignedList.filter((a) => a.child_id === child.id);
                  const childSubmitted = submittedList.filter((a) => a.child_id === child.id);
                  const childReviewed = reviewedList.filter((a) => a.child_id === child.id);

                  return (
                    <div
                      key={child.id}
                      className="bg-white/90 rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6"
                    >
                      {/* Visual Child Section Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3.5">
                          {child.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={child.avatar_url}
                              alt={child.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-[#D4A017] shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#1E4E8C] text-[#D4A017] font-heading font-bold text-xl flex items-center justify-center shadow-2xs shrink-0">
                              {child.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h2 className="font-heading text-xl font-bold text-[#14263F]">
                              {child.name}&apos;s Homework & Activities
                            </h2>
                            <p className="text-xs text-[#6B7280]">
                              Age {child.age_years || 'Early Years'} • Individualized 1:1 Montessori practice
                            </p>
                          </div>
                        </div>

                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#E8F0FA] text-[#1E4E8C]">
                          <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
                          <span>{childAssigned.length} To Do</span>
                        </span>
                      </div>

                      {/* Content by active Parent Tab */}
                      {parentTab === 'assigned' && (
                        <div>
                          {childAssigned.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                              <p className="text-xs font-semibold text-[#14263F]">
                                All caught up! No pending activities for {child.name}.
                              </p>
                              <p className="text-[11px] text-[#6B7280]">
                                Check back after your next scheduled session with Mrs Sarah.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {childAssigned.map((a) => (
                                <div
                                  key={a.id}
                                  className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-2xs flex flex-col justify-between hover:border-[#1E4E8C]/40 transition-colors"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                                        Home Practice
                                      </span>
                                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-100">
                                        <Calendar className="w-3 h-3 text-[#D4A017]" />
                                        Due: {new Date(a.due_date || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </div>

                                    <h3 className="font-heading font-bold text-base text-[#14263F]">
                                      {a.title}
                                    </h3>
                                    <p className="text-xs text-[#6B7280] leading-relaxed">
                                      {a.description}
                                    </p>

                                    {/* Linked Milestone */}
                                    {a.milestone_name && (
                                      <div className="p-3 bg-[#FCFBF7] rounded-xl border border-[#F3E7C4] flex items-center gap-2 text-xs">
                                        <Award className="w-4 h-4 text-[#D4A017] shrink-0" />
                                        <div>
                                          <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                                            Skill Aim:
                                          </span>
                                          <span className="font-bold text-[#14263F]">{a.milestone_name}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Attached Resource */}
                                    {a.resource_title && (
                                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 truncate pr-2">
                                          <FileText className="w-4 h-4 text-[#1E4E8C] shrink-0" />
                                          <span className="font-bold text-[#1E4E8C] truncate">
                                            {a.resource_title}
                                          </span>
                                        </div>
                                        {a.resource_url && (
                                          <a
                                            href={a.resource_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[11px] font-bold text-[#1E4E8C] hover:underline flex items-center gap-1 shrink-0"
                                          >
                                            View <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] text-[#6B7280]">
                                      Tutor: Mrs Sarah
                                    </span>
                                    <button
                                      onClick={() => handleOpenSubmitModal(a)}
                                      className="px-3.5 py-1.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                    >
                                      <span>Mark Complete</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-[#D4A017]" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {parentTab === 'submitted' && (
                        <div>
                          {childSubmitted.length === 0 ? (
                            <div className="p-6 text-center bg-gray-50/70 rounded-2xl border border-gray-200/80 text-xs text-[#6B7280]">
                              No submissions awaiting review for {child.name}.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {childSubmitted.map((a) => {
                                const sub = submissions[a.id];
                                return (
                                  <div
                                    key={a.id}
                                    className="bg-white rounded-2xl border border-blue-200 p-5 space-y-4 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        <Clock className="w-3 h-3 text-blue-600 animate-spin" />
                                        Awaiting Mrs Sarah&apos;s Review
                                      </span>
                                      <span className="text-[11px] text-[#6B7280]">
                                        Due {new Date(a.due_date || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </div>

                                    <h3 className="font-heading font-bold text-base text-[#14263F]">
                                      {a.title}
                                    </h3>

                                    {sub && (
                                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                                          Your Observation:
                                        </span>
                                        <p className="italic text-[#14263F]">
                                          &ldquo;{sub.submission_note}&rdquo;
                                        </p>

                                        {sub.submission_photo_url && (
                                          <div
                                            onClick={() => setPhotoPreviewModalUrl(sub.submission_photo_url)}
                                            className="w-20 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-pointer shadow-2xs"
                                          >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={sub.submission_photo_url}
                                              alt="Evidence"
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {parentTab === 'reviewed' && (
                        <div>
                          {childReviewed.length === 0 ? (
                            <div className="p-6 text-center bg-gray-50/70 rounded-2xl border border-gray-200/80 text-xs text-[#6B7280]">
                              No reviewed assignments yet for {child.name}.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {childReviewed.map((a) => {
                                const sub = submissions[a.id];
                                return (
                                  <div
                                    key={a.id}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-heading font-bold text-base text-[#14263F]">
                                        {a.title}
                                      </h3>
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Approved
                                      </span>
                                    </div>

                                    {sub?.milestone_marked_achieved && a.milestone_name && (
                                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-emerald-900 text-xs font-bold">
                                        <Award className="w-4 h-4 text-[#D4A017] shrink-0" />
                                        <span>Milestone Achieved: {a.milestone_name} 🎉</span>
                                      </div>
                                    )}

                                    {sub?.tutor_feedback && (
                                      <div className="p-3.5 rounded-xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-1 text-xs">
                                        <span className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider block">
                                          Mrs Sarah&apos;s Feedback:
                                        </span>
                                        <p className="text-[#14263F] leading-relaxed">
                                          &ldquo;{sub.tutor_feedback}&rdquo;
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CREATE 1:1 INDIVIDUAL ASSIGNMENT (Owner)         */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Assign Homework to Student
                </h3>
                <p className="text-xs text-[#6B7280]">
                  1:1 individualized assignment based on student progress.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4 text-xs">
              {/* Locked Student Banner (Read-only static text - strictly 1:1) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider">
                    Student (1:1 Individual Assignment)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E4E8C] bg-[#E8F0FA] px-2.5 py-0.5 rounded-full border border-[#1E4E8C]/20">
                    <Lock className="w-3 h-3 text-[#D4A017]" />
                    Locked to Student
                  </span>
                </div>

                {selectedChild ? (
                  <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-gray-200 flex items-center gap-3.5">
                    {selectedChild.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedChild.avatar_url}
                        alt={selectedChild.name}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-[#D4A017] shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#1E4E8C] text-[#D4A017] font-heading font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                        {selectedChild.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-xs min-w-0 flex-1">
                      <p className="text-[#14263F] leading-snug">
                        Assigning homework to: <strong className="font-bold text-[#1E4E8C]">{selectedChild.name}</strong>
                        {selectedChild.age_years ? ` (Age ${selectedChild.age_years})` : ''}
                        {selectedChild.parent_name ? ` · Parent: ${selectedChild.parent_name}` : ''}
                      </p>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {selectedChild.parent_email ? `Contact: ${selectedChild.parent_email} • ` : ''}
                        To assign homework to a different child, close this modal and click &ldquo;Assign Homework&rdquo; on that child&apos;s card in the Student Directory.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>No Student Selected</span>
                    </div>
                    <p>
                      In Mrs Sarah&apos;s 1:1 tutoring model, assignments must be created directly from a specific child&apos;s card.
                    </p>
                    <Link
                      href="/app/children"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4E8C] text-white font-bold rounded-xl text-xs hover:bg-[#153763] transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>Select Student in Student Directory →</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Tactile Sandpaper Letter Sound Articulation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              {/* Description / Instructions */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Home Practice Guide & Instructions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Provide clear step-by-step guidance for parent and learner at home..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none resize-none"
                />
              </div>

              {/* Milestone Tag */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Tag to Milestone / Skill (Optional)
                </label>
                <select
                  value={createMilestoneId}
                  onChange={(e) => setCreateMilestoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                >
                  <option value="">-- No linked milestone --</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.subject_area.toUpperCase()}] {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Learning Resource Attachment */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Attach Learning Resource (Optional)
                </label>
                <select
                  value={createResourceId}
                  onChange={(e) => setCreateResourceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                >
                  <option value="">-- No resource attachment --</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.file_type?.toUpperCase() || 'DOCUMENT'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date (STRICTLY REQUIRED & SMART PRE-FILLED) */}
              <div className="p-3.5 bg-[#FCFBF7] rounded-2xl border border-[#F3E7C4] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#14263F] uppercase tracking-wider">
                    Target Due Date *
                  </label>
                  {suggestedSessionLabel && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#1E4E8C] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      <Sparkles className="w-3 h-3 text-[#D4A017]" />
                      <span>{suggestedSessionLabel}</span>
                    </div>
                  )}
                </div>

                {!suggestedSessionLabel && (
                  <p className="text-[11px] text-amber-800">
                    No upcoming confirmed session booked for this student — please select a target deadline manually.
                  </p>
                )}

                <input
                  type="date"
                  required
                  value={createDueDate}
                  onChange={(e) => setCreateDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#1E4E8C] outline-none bg-white"
                />
                <p className="text-[10px] text-[#6B7280]">
                  Every homework assignment must have a due date to keep the learner engaged between sessions.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedChild}
                  className="px-5 py-2.5 rounded-xl bg-[#1E4E8C] disabled:bg-gray-300 text-white font-bold text-xs hover:bg-[#153763] disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  Assign Homework to {selectedChild?.name || 'Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PARENT SUBMIT HOMEWORK EVIDENCE                  */}
      {/* ========================================================= */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Complete Home Activity
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {submittingAssignment.title} • {submittingAssignment.child_name}
                </p>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleParentSubmit} className="space-y-4 text-xs">
              {/* Instructions Reminder */}
              <div className="p-3.5 bg-[#FCFBF7] rounded-2xl border border-[#F3E7C4] text-[#14263F] space-y-1">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Mrs Sarah&apos;s Instructions:
                </span>
                <p className="text-xs leading-relaxed">{submittingAssignment.description}</p>
              </div>

              {/* Notes Field */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Observation & Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="e.g. Leo spent 15 minutes practicing. He successfully blended c-a-t and d-o-g with enthusiasm!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none resize-none"
                />
              </div>

              {/* Photo Evidence URL or Quick Picker */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Photo Evidence URL (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={submissionPhotoUrl}
                    onChange={(e) => setSubmissionPhotoUrl(e.target.value)}
                    placeholder="https://... photo link (e.g. Cloudinary/Supabase Storage)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />

                  {/* Demo Helper: Quick Select Preset Photos */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] text-[#6B7280]">Quick photo preset:</span>
                    {SAMPLE_EVIDENCE_PHOTOS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSubmissionPhotoUrl(p.url)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-[#1E4E8C] cursor-pointer"
                      >
                        + {p.label}
                      </button>
                    ))}
                  </div>

                  {submissionPhotoUrl && (
                    <div className="mt-2 w-24 h-20 rounded-xl overflow-hidden border border-gray-200 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={submissionPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSubmissionPhotoUrl('')}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>Submit for Sarah&apos;s Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: OWNER REVIEW SUBMISSION                          */}
      {/* ========================================================= */}
      {reviewingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Review Homework Submission
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {reviewingAssignment.assignment.child_name} • {reviewingAssignment.assignment.title}
                </p>
              </div>
              <button
                onClick={() => setReviewingAssignment(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Submission Details */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Parent&apos;s Observation Note:
                  </span>
                  <span className="text-[10px] text-[#6B7280]">
                    Submitted by {reviewingAssignment.submission.submitted_by_name}
                  </span>
                </div>
                <p className="text-xs text-[#14263F] italic leading-relaxed">
                  &ldquo;{reviewingAssignment.submission.submission_note}&rdquo;
                </p>

                {reviewingAssignment.submission.submission_photo_url && (
                  <div>
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                      Evidence Photo:
                    </span>
                    <div
                      onClick={() => setPhotoPreviewModalUrl(reviewingAssignment.submission.submission_photo_url)}
                      className="w-28 h-20 rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-2xs hover:opacity-90"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reviewingAssignment.submission.submission_photo_url}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Field */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Teacher Feedback & Affirmation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="e.g. Excellent work! Leo displayed sharp phonemic awareness and confidence. Keep reinforcing this in daily reading."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none resize-none"
                />
              </div>

              {/* Milestone Achievement Option */}
              {reviewingAssignment.assignment.milestone_name ? (
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#D4A017]" />
                      <span className="font-bold text-[#14263F]">
                        Mark Milestone as Achieved
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={markMilestoneAchieved}
                      onChange={(e) => setMarkMilestoneAchieved(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#1E4E8C] focus:ring-[#1E4E8C]"
                    />
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    Linked Skill: <strong>{reviewingAssignment.assignment.milestone_name}</strong>.
                    Checking this updates the student’s Montessori curriculum status from In Progress to Achieved.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-[#6B7280] italic">
                  This assignment is not tagged to a curriculum milestone.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewingAssignment(null)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>Approve & Mark Reviewed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: PHOTO ENLARGEMENT PREVIEW                        */}
      {/* ========================================================= */}
      {photoPreviewModalUrl && (
        <div
          onClick={() => setPhotoPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl w-full bg-white p-2 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreviewModalUrl}
              alt="Enlarged evidence"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="p-3 text-center text-xs font-bold text-gray-600">
              Click anywhere to close preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
