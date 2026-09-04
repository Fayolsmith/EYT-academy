'use client';

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { EYTService, Child } from '@/lib/eyt-service';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildAdded: (child: Child) => void;
}

export default function AddChildModal({ isOpen, onClose, onChildAdded }: AddChildModalProps) {
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
    if (!name.trim()) {
      setError('Please enter the child’s full name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newChild = EYTService.addChild({
        name: name.trim(),
        date_of_birth: dateOfBirth || undefined,
        age_years: parseInt(ageYears) || undefined,
        notes: notes.trim() || undefined,
        learning_goals: learningGoals.trim() || undefined,
      });

      onChildAdded(newChild);
      setName('');
      setDateOfBirth('');
      setNotes('');
      setLearningGoals('');
      onClose();
    } catch {
      setError('Failed to add child profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C]">
              <UserPlus className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#1E4E8C]">
                Add Child Profile
              </h3>
              <p className="text-xs text-[#6B7280]">
                Register your child for personalized tutoring & milestones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                Date of Birth
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
            <input
              type="text"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              placeholder="e.g. Phonics blending, letter sounds, number recognition"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
              Special Notes / Preferences
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Highly energetic, loves hands-on objects, needs patient encouragement"
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
              {isSubmitting ? 'Saving...' : 'Save Child Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
