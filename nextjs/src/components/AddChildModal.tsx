'use client';

import React, { useState, useRef } from 'react';
import { X, UserPlus, Mail, Phone, User, Sparkles, ShieldCheck, Camera, Trash2 } from 'lucide-react';
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

  // Child photo upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be 5MB or less.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image.');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      let finalAvatarUrl: string | null = null;
      if (avatarFile) {
        finalAvatarUrl = await EYTService.uploadAvatar(
          avatarFile,
          'children',
          `child-${Date.now()}`
        );
      }

      const newChild = EYTService.addChild({
        name: name.trim(),
        date_of_birth: dateOfBirth || undefined,
        age_years: parseInt(ageYears) || undefined,
        notes: notes.trim() || undefined,
        learning_goals: learningGoals.trim() || undefined,
        parent_name: isOwner ? parentName.trim() : undefined,
        parent_email: isOwner ? parentEmail.trim().toLowerCase() : undefined,
        parent_phone: isOwner && parentPhone.trim() ? parentPhone.trim() : undefined,
        avatar_url: finalAvatarUrl,
      });

      onChildAdded(newChild);
      setName('');
      setDateOfBirth('');
      setNotes('');
      setLearningGoals('');
      setParentName('');
      setParentEmail('');
      setParentPhone('');
      setAvatarPreview(null);
      setAvatarFile(null);
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
              <h2 className="font-heading font-bold text-lg text-[#1E4E8C]">
                {isOwner ? 'Enroll Student & Link Parent' : 'Add Child Profile'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {isOwner
                  ? 'Connect student to parent contact details for billing and progress notes'
                  : 'Add your child to start scheduling tutorials and tracking milestones'}
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

        {/* Form Error */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* OWNER VIEW: Parent Contact Information */}
          {isOwner && (
            <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E4E8C] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4A017]" />
                  Parent Contact (Required for linking)
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                  Auto Account Link
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14263F] uppercase mb-1">
                  Parent / Guardian Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Mrs Elizabeth Adeleke"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all bg-white"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14263F] uppercase mb-1">
                    Parent Email (for login) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="elizabeth@example.com"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all bg-white"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#14263F] uppercase mb-1">
                    Parent Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="08023456789"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] transition-all bg-white"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Child Photo Section */}
          <div className="flex items-center gap-4 p-3 bg-[#FCFBF7] rounded-2xl border border-[#F3E7C4]">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-[#D4A017] flex items-center justify-center shrink-0">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Child preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-bold text-lg text-[#1E4E8C]">
                  {name ? name.charAt(0).toUpperCase() : <Camera className="w-5 h-5 text-gray-400" />}
                </span>
              )}
            </div>

            <div className="space-y-1 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-[#D4A017]" />
                  {avatarPreview ? 'Change Photo' : 'Upload Child Photo (Optional)'}
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#6B7280]">
                JPG, PNG, or WebP up to 5MB.
              </p>
            </div>
          </div>

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
