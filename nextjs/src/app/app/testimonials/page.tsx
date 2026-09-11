'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  Quote,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import {
  EYTService,
  Testimonial,
  TestimonialDisplayNameChoice,
  Child,
  formatTestimonialAuthor,
} from '@/lib/eyt-service';
import {
  StaggerContainer,
  StaggerItem,
  MotionCard,
  MotionButton,
  AnimatedModal,
  useToast,
} from '@/components/motion';

type OwnerTab = 'pending' | 'published' | 'rejected' | 'all';

export default function TestimonialsPage() {
  const { profile, user, loading } = useGlobal();
  const { showToast } = useToast();

  const isOwner = profile?.role === 'owner' || user?.role === 'owner';

  // State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Owner Tab
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('pending');

  // Owner Rejection Modal State
  const [rejectingTestimonial, setRejectingTestimonial] = useState<Testimonial | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Parent Form State
  const [bodyText, setBodyText] = useState('');
  const [rating, setRating] = useState<number | null>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [displayNameChoice, setDisplayNameChoice] = useState<TestimonialDisplayNameChoice>('first_name_last_initial');
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);
  const [showSubmitSuccessModal, setShowSubmitSuccessModal] = useState(false);

  // Load Data
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const items = EYTService.getTestimonials();
      setTestimonials(items);

      if (profile?.id) {
        if (isOwner) {
          setChildren(EYTService.getChildren());
        } else {
          setChildren(EYTService.getChildren(profile.id));
        }
      }
    } catch (e) {
      console.error('Failed to load testimonials:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isOwner, profile?.id]);

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [loading, loadData]);

  // Selected Child object for Parent live preview
  const previewChild = useMemo(() => {
    if (!selectedChildId) return null;
    return children.find((c) => c.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  // Live formatted author preview for the parent
  const parentPreviewFormatted = useMemo(() => {
    const parentName = profile?.full_name || 'Parent';
    return formatTestimonialAuthor(
      displayNameChoice,
      parentName,
      previewChild?.age_years,
      previewChild?.name
    );
  }, [displayNameChoice, profile?.full_name, previewChild]);

  // Owner actions: Publish
  const handlePublish = async (id: string) => {
    setIsSubmittingAction(true);
    try {
      EYTService.updateTestimonialStatus(id, 'published');
      loadData();
      showToast({
        message: 'Testimonial published to public website!',
        type: 'success',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to publish testimonial.';
      showToast({
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Owner actions: Reject with optional reason
  const handleConfirmReject = async () => {
    if (!rejectingTestimonial) return;
    setIsSubmittingAction(true);
    try {
      EYTService.updateTestimonialStatus(
        rejectingTestimonial.id,
        'rejected',
        rejectionReason.trim() || undefined
      );
      setRejectingTestimonial(null);
      setRejectionReason('');
      loadData();
      showToast({
        message: 'Testimonial rejected. Parent has been notified to resubmit.',
        type: 'success',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject testimonial.';
      showToast({
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Parent action: Submit testimonial
  const handleSubmitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyText.trim()) {
      showToast({
        message: 'Please write your testimonial before submitting.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingTestimonial(true);
    try {
      EYTService.submitTestimonial({
        child_id: selectedChildId || null,
        rating: rating || null,
        body_text: bodyText.trim(),
        display_name_choice: displayNameChoice,
      });

      // Clear form
      setBodyText('');
      setRating(5);
      setSelectedChildId('');
      setDisplayNameChoice('first_name_last_initial');

      loadData();
      setShowSubmitSuccessModal(true);
      showToast({
        message: 'Thank you! Your testimonial has been submitted for Mrs Sarah’s review.',
        type: 'success',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit testimonial.';
      showToast({
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  // Filtered testimonials for Owner
  const filteredOwnerTestimonials = useMemo(() => {
    if (ownerTab === 'all') return testimonials;
    return testimonials.filter((t) => t.status === ownerTab);
  }, [testimonials, ownerTab]);

  // Counts for Owner tabs
  const ownerCounts = useMemo(() => {
    return {
      pending: testimonials.filter((t) => t.status === 'pending').length,
      published: testimonials.filter((t) => t.status === 'published').length,
      rejected: testimonials.filter((t) => t.status === 'rejected').length,
      all: testimonials.length,
    };
  }, [testimonials]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#1E4E8C]">Loading Testimonials...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. OWNER VIEW: MODERATION REVIEW QUEUE
  // ==========================================
  if (isOwner) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Testimonial Moderation
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
              Parent Testimonials Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              Review and approve parent-submitted testimonials for the public homepage. Parent words cannot be altered to preserve authenticity.
            </p>
          </div>

          <Link
            href="/#testimonials"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#C7DAF3] text-[#1E4E8C] font-bold text-xs hover:bg-[#E8F0FA] transition-all self-start sm:self-auto shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-[#D4A017]" />
            View Public Testimonials
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setOwnerTab('pending')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              ownerTab === 'pending'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Review
            {ownerCounts.pending > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4A017] text-white">
                {ownerCounts.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setOwnerTab('published')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              ownerTab === 'published'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Live on Website ({ownerCounts.published})
          </button>

          <button
            onClick={() => setOwnerTab('rejected')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              ownerTab === 'rejected'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Needs Resubmission ({ownerCounts.rejected})
          </button>

          <button
            onClick={() => setOwnerTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              ownerTab === 'all'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Submissions ({ownerCounts.all})
          </button>
        </div>

        {/* Testimonials List */}
        {filteredOwnerTestimonials.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] mx-auto">
              <Quote className="w-7 h-7 text-[#D4A017]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#14263F]">
              No {ownerTab === 'all' ? '' : ownerTab} testimonials found
            </h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
              {ownerTab === 'pending'
                ? 'All parent testimonials have been reviewed. New submissions will appear here for your moderation.'
                : 'There are no testimonials under this tab at present.'}
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOwnerTestimonials.map((t) => (
              <StaggerItem key={t.id}>
                <MotionCard className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    {/* Top Row: Parent identity & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
                            {t.parent_name || 'Parent'}
                          </h3>
                          {t.child_name && (
                            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              Re: {t.child_name} {t.child_age ? `(Age ${t.child_age})` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {t.parent_email || 'No email'} {t.parent_phone ? `• ${t.parent_phone}` : ''}
                        </p>
                      </div>

                      <div>
                        {t.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                        {t.status === 'published' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Live on Website
                          </span>
                        )}
                        {t.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Needs Resubmission
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Star Rating & Submission Date */}
                    <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                      <div className="flex items-center gap-1">
                        {t.rating ? (
                          [...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-[#D4A017] fill-[#D4A017]" />
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">No star rating specified</span>
                        )}
                      </div>
                      <span className="text-[11px]">
                        Submitted {new Date(t.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Testimonial Quote Body (Strictly Read-Only) */}
                    <div className="bg-[#FCFBF7] p-4 rounded-2xl border border-[#F3E7C4] relative">
                      <Quote className="w-5 h-5 text-[#D4A017]/40 absolute top-3 right-3" />
                      <p className="text-xs sm:text-sm text-[#14263F] leading-relaxed italic pr-6 whitespace-pre-wrap">
                        &ldquo;{t.body_text}&rdquo;
                      </p>
                    </div>

                    {/* Chosen Public Display Format Preview */}
                    <div className="bg-[#E8F0FA]/60 p-3.5 rounded-xl border border-[#C7DAF3] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1E4E8C] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#D4A017]" />
                          Parent’s Public Attribution Choice:
                        </span>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-white text-[#1E4E8C] rounded border border-[#C7DAF3]">
                          {t.display_name_choice.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[#14263F] font-semibold">
                        Will appear as: <span className="text-[#1E4E8C] font-bold underline">{t.formatted_display_name}</span>
                        {t.formatted_subtitle && (
                          <span className="text-gray-500 font-normal"> ({t.formatted_subtitle})</span>
                        )}
                      </p>
                    </div>

                    {/* Rejection Note (if any) */}
                    {t.rejection_reason && (
                      <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs space-y-1">
                        <span className="font-bold text-rose-800 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          Note sent to parent:
                        </span>
                        <p className="text-rose-700 italic">&ldquo;{t.rejection_reason}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Actions (Publish or Reject only — NO wording editing allowed) */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                    {t.status !== 'published' && (
                      <MotionButton
                        onClick={() => handlePublish(t.id)}
                        disabled={isSubmittingAction}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E4E8C] hover:bg-[#153763] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#D4A017]" />
                        Publish to Public Site
                      </MotionButton>
                    )}

                    {t.status !== 'rejected' && (
                      <MotionButton
                        onClick={() => {
                          setRejectingTestimonial(t);
                          setRejectionReason(t.rejection_reason || '');
                        }}
                        disabled={isSubmittingAction}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        {t.status === 'published' ? 'Withdraw / Reject' : 'Reject'}
                      </MotionButton>
                    )}
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Reject / Resubmit Note Modal */}
        {rejectingTestimonial && (
          <AnimatedModal
            isOpen={Boolean(rejectingTestimonial)}
            onClose={() => setRejectingTestimonial(null)}
            maxWidth="max-w-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-heading text-base sm:text-lg font-bold text-[#1E4E8C]">
                  Reject Testimonial & Request Resubmission
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectingTestimonial(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Preserving Parent Authenticity
                </p>
                <p className="leading-relaxed">
                  To preserve trust, you cannot edit parent words directly. If any changes are desired (e.g. adding the child’s age, fixing a personal detail), explain below so the parent can resubmit.
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700 italic">
                &ldquo;{rejectingTestimonial.body_text}&rdquo;
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#14263F]">
                  Reason / Resubmission Note to Parent (Optional):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Hi Elizabeth, thank you! Could you please resubmit with Leo's age included?"
                  rows={3}
                  className="w-full text-xs rounded-xl border border-gray-200 p-3 focus:outline-hidden focus:border-[#1E4E8C] focus:ring-1 focus:ring-[#1E4E8C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingTestimonial(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                >
                  {isSubmittingAction ? 'Updating...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </AnimatedModal>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. PARENT VIEW: SUBMIT & TRACK TESTIMONIALS
  // ==========================================
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          Parent & Family Feedback
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
          Leave a Testimonial for Mrs Sarah
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
          Share your child’s learning journey, confidence growth, and milestones. All testimonials are reviewed by Mrs Sarah before appearing on the public website.
        </p>
      </div>

      {/* Submission Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4A017]" />
            Your Experience & Story
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Available to share anytime — your words help other families find trusted Montessori tutoring.
          </p>
        </div>

        <form onSubmit={handleSubmitTestimonial} className="space-y-6">
          {/* Rating (1 to 5 stars, optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider">
              Rating (Optional):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? null : star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-lg hover:bg-amber-50 transition-colors focus:outline-hidden"
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        (hoverRating !== null ? star <= hoverRating : star <= (rating || 0))
                          ? 'text-[#D4A017] fill-[#D4A017]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating && (
                <span className="text-xs font-bold text-[#D4A017]">
                  {rating} Star{rating > 1 ? 's' : ''}
                </span>
              )}
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 underline ml-2"
                >
                  Clear rating
                </button>
              )}
            </div>
          </div>

          {/* Child Selector (Optional) */}
          {children.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#14263F]">
                Which child is this testimonial about? (Optional):
              </label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-3 bg-white focus:outline-hidden focus:border-[#1E4E8C] focus:ring-1 focus:ring-[#1E4E8C]"
              >
                <option value="">General Family Experience (No specific child)</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.age_years ? `(Age ${c.age_years})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Testimonial Body Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#14263F]">
                Your Testimonial <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {bodyText.length} characters
              </span>
            </div>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Tell other parents about your child's learning journey, how Mrs Sarah's sessions have helped build confidence, or key milestones achieved..."
              rows={5}
              required
              className="w-full text-xs sm:text-sm rounded-2xl border border-gray-200 p-4 focus:outline-hidden focus:border-[#1E4E8C] focus:ring-1 focus:ring-[#1E4E8C] leading-relaxed"
            />
          </div>

          {/* Display Name Choice (Explicit choice required) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider">
                Public Display Name Preference <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Choose exactly how you would like to be identified if your testimonial is published on our public website.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: First Name + Last Initial */}
              <label
                className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                  displayNameChoice === 'first_name_last_initial'
                    ? 'border-[#1E4E8C] bg-[#E8F0FA]/40 ring-2 ring-[#1E4E8C]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="displayNameChoice"
                    value="first_name_last_initial"
                    checked={displayNameChoice === 'first_name_last_initial'}
                    onChange={() => setDisplayNameChoice('first_name_last_initial')}
                    className="text-[#1E4E8C] focus:ring-[#1E4E8C]"
                  />
                  <span className="text-xs font-bold text-[#1E4E8C]">First Name + Last Initial</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  e.g. &ldquo;Elizabeth A.&rdquo;
                </span>
              </label>

              {/* Option 2: Full Name */}
              <label
                className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                  displayNameChoice === 'full_name'
                    ? 'border-[#1E4E8C] bg-[#E8F0FA]/40 ring-2 ring-[#1E4E8C]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="displayNameChoice"
                    value="full_name"
                    checked={displayNameChoice === 'full_name'}
                    onChange={() => setDisplayNameChoice('full_name')}
                    className="text-[#1E4E8C] focus:ring-[#1E4E8C]"
                  />
                  <span className="text-xs font-bold text-[#1E4E8C]">Full Name</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  e.g. &ldquo;{profile?.full_name || 'Mrs Elizabeth Adeleke'}&rdquo;
                </span>
              </label>

              {/* Option 3: Anonymous */}
              <label
                className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                  displayNameChoice === 'anonymous'
                    ? 'border-[#1E4E8C] bg-[#E8F0FA]/40 ring-2 ring-[#1E4E8C]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="displayNameChoice"
                    value="anonymous"
                    checked={displayNameChoice === 'anonymous'}
                    onChange={() => setDisplayNameChoice('anonymous')}
                    className="text-[#1E4E8C] focus:ring-[#1E4E8C]"
                  />
                  <span className="text-xs font-bold text-[#1E4E8C]">Anonymous</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  e.g. &ldquo;A parent of a {previewChild?.age_years ? `${previewChild.age_years}-year-old` : '5-year-old'}&rdquo;
                </span>
              </label>
            </div>

            {/* Live Attribution Preview Box */}
            <div className="bg-[#FCFBF7] p-3.5 rounded-2xl border border-[#F3E7C4] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#D4A017] shrink-0" />
                <span>
                  <strong className="text-[#1E4E8C]">Live Website Attribution Preview:</strong>{' '}
                  <span className="font-bold underline text-[#14263F]">{parentPreviewFormatted.name}</span>
                  {parentPreviewFormatted.subtitle && (
                    <span className="text-gray-500 font-medium"> ({parentPreviewFormatted.subtitle})</span>
                  )}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#D4A017] uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                Respected Exactly
              </span>
            </div>
          </div>

          {/* Privacy & Moderation Notice */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-start gap-3 text-xs text-[#6B7280] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#14263F] block mb-0.5">Authenticity & Privacy Policy</strong>
              Mrs Sarah personally moderates every testimonial before publication. Once submitted, your wording cannot be edited to guarantee authenticity. If revisions are needed, Mrs Sarah will notify you so you can review and resubmit.
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-2">
            <MotionButton
              type="submit"
              disabled={isSubmittingTestimonial || !bodyText.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1E4E8C] hover:bg-[#153763] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#D4A017]" />
              {isSubmittingTestimonial ? 'Submitting...' : 'Submit Testimonial'}
            </MotionButton>
          </div>
        </form>
      </div>

      {/* Parent Testimonial Status History */}
      <div className="space-y-4 pt-4">
        <h3 className="font-heading text-lg font-bold text-[#1E4E8C] flex items-center gap-2">
          <Quote className="w-4 h-4 text-[#D4A017]" />
          My Submitted Testimonials
        </h3>

        {testimonials.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center text-xs text-[#6B7280]">
            You haven’t submitted any testimonials yet. Fill out the form above to share your experience!
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    {t.rating && (
                      <div className="flex items-center gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-[#D4A017] fill-[#D4A017]" />
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-[#6B7280]">
                      Submitted on {new Date(t.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    {t.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending Review by Mrs Sarah
                      </span>
                    )}
                    {t.status === 'published' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Live on Public Website
                      </span>
                    )}
                    {t.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Needs Resubmission
                      </span>
                    )}
                  </div>
                </div>

                {/* Body (Read-only) */}
                <div className="bg-[#FCFBF7] p-4 rounded-2xl border border-[#F3E7C4] text-xs sm:text-sm text-[#14263F] italic leading-relaxed">
                  &ldquo;{t.body_text}&rdquo;
                </div>

                {/* Attribution info */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
                  <span>
                    Public Attribution: <strong className="text-[#1E4E8C]">{t.formatted_display_name}</strong>
                  </span>
                  <span className="text-[11px] text-gray-400 italic">
                    (Submitted text cannot be edited)
                  </span>
                </div>

                {/* Rejection / Resubmission Note */}
                {t.rejection_reason && (
                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs space-y-1.5">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-rose-600" />
                      Mrs Sarah’s Feedback:
                    </span>
                    <p className="text-rose-700 leading-relaxed italic">
                      &ldquo;{t.rejection_reason}&rdquo;
                    </p>
                    <p className="text-[11px] text-rose-600 pt-1">
                      Please use the submission form above to submit an updated testimonial based on Mrs Sarah’s feedback.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Success Modal */}
      {showSubmitSuccessModal && (
        <AnimatedModal
          isOpen={showSubmitSuccessModal}
          onClose={() => setShowSubmitSuccessModal(false)}
          maxWidth="max-w-md"
        >
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-heading text-lg font-bold text-[#1E4E8C]">
              Thank You For Your Support!
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Your testimonial has been safely received. Mrs Sarah will review it before publishing it to the public website under your chosen name format.
            </p>
            <button
              type="button"
              onClick={() => setShowSubmitSuccessModal(false)}
              className="w-full py-2.5 px-4 bg-[#1E4E8C] hover:bg-[#153763] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Back to Portal
            </button>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
}
