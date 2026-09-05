'use client';

import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, User, Sparkles, ShieldCheck } from 'lucide-react';
import { EYTService, Child } from '@/lib/eyt-service';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildAdded: (child: Child) => void;
}

export default function AddChildModal({ isOpen, onClose, onChildAdded }: AddChildModalProps) {
  const currentUser = EYTService.getCurrentUser();
  const isOwner = currentUser?.role === 'owner';

  // Parent contact fields (required when Owner adds profile)
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Child details
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ageYears, setAgeYears] = useState('4');
  const [notes, setNotes] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter the child’s full name.');
      return;
    }

    if (isOwner) {
      if (!parentName.trim()) {
        setError('Please enter the parent/guardian full name.');
        return;
      }
      if (!parentEmail.trim() || !parentEmail.includes('@')) {
        setError('Please provide a valid parent email address for account matching.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const newChild = EYTService.addChild({
        name: name.trim(),
        date_of_birth: dateOfBirth || undefined,
        age_years: parseInt(ageYears) || undefined,
        notes: notes.trim() || undefined,
        learning_goals: learningGoals.trim() || undefined,
        parent_name: isOwner ? parentName.trim() : undefined,
        parent_email: isOwner ? parentEmail.trim().toLowerCase() : undefined,
        parent_phone: isOwner && parentPhone.trim() ? parentPhone.trim() : undefined,
      });

      onChildAdded(newChild);
      setName('');
      setDateOfBirth('');
      setNotes('');
      setLearningGoals('');
      setParentName('');
      setParentEmail('');
      setParentPhone('');
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add child profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] border border-[#C7DAF3]">
              <UserPlus className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1E4E8C]">
                {isOwner ? 'Enroll New Student Profile' : 'Add Child Profile'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {isOwner
                  ? 'Link a learner to a parent contact for scheduling & milestones'
                  : 'Register your child for personalized tutoring & milestones'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Owner-Only: Parent Contact Details Linking */}
          {isOwner && (
            <div className="p-4 bg-[#F3F7FD] rounded-2xl border border-[#C7DAF3]/80 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E4E8C] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#1E4E8C]">Parent Contact Linking</div>
                  <p className="text-[11px] text-[#14263F]/80">
                    When this parent later signs up at <strong>/signup</strong> with this email, this child profile automatically links to their portal with no duplicate records.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Parent / Guardian Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Mrs Chioma Okonkwo"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Parent Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Parent Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Child Information */}
          <div>
            <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
              Child&apos;s Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Leo Adeleke"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Age (Years)
              </label>
              <select
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all bg-white"
              >
                <option value="3">3 Years (Nursery 1)</option>
                <option value="4">4 Years (Nursery 2 / Preschool)</option>
                <option value="5">5 Years (Preschool / Kindergarten)</option>
                <option value="6">6 Years (Primary 1)</option>
                <option value="7">7 Years (Primary 2)</option>
                <option value="8">8 Years (Primary 3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
              Learning Goals / Focus Areas
            </label>
            <div className="relative">
              <input
                type="text"
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                placeholder="e.g. Phonics digraphs, CVC blending, number bonds"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all"
              />
              <Sparkles className="w-4 h-4 text-[#D4A017] absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
              Special Notes / Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tactile learner, loves hands-on objects, needs gentle encouragement with sound blending"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#6B7280] hover:text-[#14263F] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#D4A017] text-white text-sm font-bold hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
            >
              {isSubmitting ? 'Saving...' : isOwner ? 'Enroll Student' : 'Save Child Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
