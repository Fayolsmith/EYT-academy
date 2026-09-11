'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Key,
  Bell,
  Building2,
  Users,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Save,
  Info,
  Download,
  ExternalLink,
  Mail,
  FileText,
  Sparkles,
  Tag,
  Globe,
  Award,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useGlobal } from '@/lib/context/GlobalContext';
import {
  EYTService,
  Child,
  BankDetails,
  NotificationPreferences,
  PricingSettings,
  PublicStatsSettings,
  formatDualRate,
  detectUserTimezone,
  getTimezoneAbbr
} from '@/lib/eyt-service';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';

type ActiveTab = 'profile' | 'security' | 'notifications' | 'business' | 'children' | 'privacy';

export default function SettingsPage() {
  const { profile, updateProfileState } = useGlobal();
  const isOwner = profile?.role === 'owner';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  // Status feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Password Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Bank & Business Details (Owner only)
  const [bankDetails, setBankDetails] = useState<BankDetails>(() => EYTService.getBankDetails());

  // Pricing & Trial Settings (Owner only)
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() =>
    EYTService.getPricingSettings()
  );
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Public Career Statistics (Owner only)
  const [publicStats, setPublicStats] = useState<PublicStatsSettings>(() =>
    EYTService.getPublicStats()
  );
  const [isSavingPublicStats, setIsSavingPublicStats] = useState(false);

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() =>
    EYTService.getNotificationPreferences()
  );

  // Linked Children (Parent only)
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [childEditForm, setChildEditForm] = useState<{
    name: string;
    date_of_birth: string;
    age_years: string;
    notes: string;
    learning_goals: string;
    avatar_url?: string | null;
  }>({
    name: '',
    date_of_birth: '',
    age_years: '',
    notes: '',
    learning_goals: '',
    avatar_url: null,
  });
  const childFileInputRef = useRef<HTMLInputElement>(null);
  const [childPhotoUploading, setChildPhotoUploading] = useState(false);

  // Initialize data on mount or when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAvatarPreview(profile.avatar_url || null);
      setNotificationPrefs(EYTService.getNotificationPreferences(profile.id));
    }
    if (isOwner) {
      setBankDetails(EYTService.getBankDetails());
      setPricingSettings(EYTService.getPricingSettings());
      setPublicStats(EYTService.getPublicStats());
    } else if (profile?.id) {
      setChildrenList(EYTService.getChildren(profile.id));
    }
  }, [profile, isOwner]);

  const handleSavePricingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    try {
      const updated = EYTService.updatePricingSettings(pricingSettings);
      setPricingSettings(updated);
      showSuccess('Public pricing and trial session settings updated successfully! Rates are now live on public pages.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save pricing settings.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleSavePublicStats = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPublicStats(true);
    try {
      const updated = EYTService.updatePublicStats({
        years_of_experience: Math.max(1, Number(publicStats.years_of_experience) || 15),
        families_served: Math.max(1, Number(publicStats.families_served) || 100),
      });
      setPublicStats(updated);
      showSuccess('Public career statistics updated successfully! They are now live on your homepage counters.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save career statistics.');
    } finally {
      setIsSavingPublicStats(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  // ------------------------------------------------
  // 1. PROFILE & PHOTO HANDLERS
  // ------------------------------------------------
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be 5MB or less.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showError('Please select a JPG, PNG, or WebP image.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const publicUrl = await EYTService.uploadAvatar(
        file,
        'profiles',
        profile?.id || 'profile-user'
      );
      setAvatarPreview(publicUrl);
      updateProfileState({ avatar_url: publicUrl });
      await EYTService.updateProfileAsync({ avatar_url: publicUrl });
      showSuccess('Profile photo uploaded and saved successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upload profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setAvatarPreview(null);
    updateProfileState({ avatar_url: null });
    await EYTService.updateProfileAsync({ avatar_url: null });
    showSuccess('Profile photo removed.');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showError('Full name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedFields = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarPreview,
      };
      updateProfileState(updatedFields);
      await EYTService.updateProfileAsync(updatedFields);
      showSuccess('Account profile updated successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------------
  // 2. PASSWORD UPDATE HANDLER
  // ------------------------------------------------
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      if (EYTService.isSupabaseConfigured()) {
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();
        const { error } = await client.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
      }
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password updated successfully. Please use your new password next time you sign in.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ------------------------------------------------
  // 3. OWNER BANK & BUSINESS DETAILS
  // ------------------------------------------------
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankDetails.bank_name.trim() || !bankDetails.account_number.trim() || !bankDetails.account_name.trim()) {
      showError('Bank name, account number, and account name are all required.');
      return;
    }

    setIsSaving(true);
    try {
      EYTService.updateBankDetails(bankDetails);
      showSuccess('Bank details and business contact information updated! New invoices will now display these details.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update bank details.');
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------------
  // 4. NOTIFICATION PREFERENCES
  // ------------------------------------------------
  const handleToggleNotification = (key: keyof NotificationPreferences) => {
    const updated = {
      ...notificationPrefs,
      [key]: !notificationPrefs[key],
    };
    setNotificationPrefs(updated);
    EYTService.updateNotificationPreferences(updated, profile?.id);
    showSuccess('Notification preferences saved.');
  };

  const handleToggleChildNotification = (childId: string, type: 'session' | 'milestone') => {
    const currentList = notificationPrefs.child_notifications?.[childId] || {
      session_reminders: true,
      milestone_updates: true,
    };
    const updatedChild = {
      ...currentList,
      [type === 'session' ? 'session_reminders' : 'milestone_updates']:
        type === 'session' ? !currentList.session_reminders : !currentList.milestone_updates,
    };

    const updated: NotificationPreferences = {
      ...notificationPrefs,
      child_notifications: {
        ...(notificationPrefs.child_notifications || {}),
        [childId]: updatedChild,
      },
    };
    setNotificationPrefs(updated);
    EYTService.updateNotificationPreferences(updated, profile?.id);
    showSuccess('Child notification preferences updated.');
  };

  // ------------------------------------------------
  // 5. PARENT LINKED CHILDREN MANAGEMENT
  // ------------------------------------------------
  const startEditingChild = (child: Child) => {
    setEditingChildId(child.id);
    setChildEditForm({
      name: child.name,
      date_of_birth: child.date_of_birth || '',
      age_years: child.age_years ? String(child.age_years) : '',
      notes: child.notes || '',
      learning_goals: child.learning_goals || '',
      avatar_url: child.avatar_url || null,
    });
  };

  const handleChildPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingChildId) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be 5MB or less.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showError('Please select a JPG, PNG, or WebP image.');
      return;
    }

    setChildPhotoUploading(true);
    try {
      const publicUrl = await EYTService.uploadAvatar(file, 'children', editingChildId);
      setChildEditForm((prev) => ({ ...prev, avatar_url: publicUrl }));
      EYTService.updateChild(editingChildId, { avatar_url: publicUrl });
      if (profile?.id) {
        setChildrenList(EYTService.getChildren(profile.id));
      }
      showSuccess("Child's photo updated successfully.");
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upload child photo.');
    } finally {
      setChildPhotoUploading(false);
    }
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChildId) return;
    if (!childEditForm.name.trim()) {
      showError("Child's full name is required.");
      return;
    }

    try {
      EYTService.updateChild(editingChildId, {
        name: childEditForm.name.trim(),
        date_of_birth: childEditForm.date_of_birth || null,
        age_years: childEditForm.age_years ? parseInt(childEditForm.age_years) : null,
        notes: childEditForm.notes.trim() || null,
        learning_goals: childEditForm.learning_goals.trim() || null,
        avatar_url: childEditForm.avatar_url || null,
      });
      if (profile?.id) {
        setChildrenList(EYTService.getChildren(profile.id));
      }
      setEditingChildId(null);
      showSuccess('Child details updated successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save child details.');
    }
  };

  // ------------------------------------------------
  // 6. DATA PRIVACY & NDPA 2023 HANDLERS
  // ------------------------------------------------
  const handleExportData = () => {
    try {
      const userChildren = isOwner
        ? EYTService.getChildren()
        : (profile?.id ? EYTService.getChildren(profile.id) : []);
      const userChildIds = userChildren.map((c) => c.id);

      const userMilestones = isOwner
        ? EYTService.getMilestones()
        : userChildIds.flatMap((cid) => EYTService.getChildMilestones(cid));

      const exportData = {
        export_metadata: {
          platform: 'Mrs Sarah Early Years Tutoring Platform',
          framework: 'Nigeria Data Protection Act (NDPA) 2023 Statutory Export',
          export_timestamp: new Date().toISOString(),
          requested_by: profile?.full_name || 'Account User',
          user_role: profile?.role || 'parent',
        },
        profile: {
          id: profile?.id,
          name: profile?.full_name,
          email: profile?.email,
          phone: profile?.phone,
          role: profile?.role,
          parental_consent_given: profile?.parental_consent_given,
          parental_consent_at: profile?.parental_consent_at,
          parental_consent_version: profile?.parental_consent_version,
        },
        children: userChildren,
        milestones: userMilestones,
        invoices: EYTService.getInvoices(isOwner ? undefined : profile?.id),
        bookings: EYTService.getBookings(),
        messages: EYTService.getMessages().filter(
          (m) =>
            isOwner ||
            m.sender_profile_id === profile?.id ||
            m.recipient_profile_id === profile?.id
        ),
        notification_preferences: EYTService.getNotificationPreferences(profile?.id),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `mrs_sarah_tutoring_ndpa_export_${(profile?.full_name || 'account').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showSuccess('Your personal data archive (NDPA Section 34) has been downloaded.');
    } catch {
      showError('Failed to generate personal data export. Please try again.');
    }
  };

  const handleConfirmConsent = async () => {
    const timestamp = new Date().toISOString();
    const version = 'NDPA-2023-v1.0';
    updateProfileState({
      parental_consent_given: true,
      parental_consent_at: timestamp,
      parental_consent_version: version,
    });
    await EYTService.updateProfileAsync({
      parental_consent_given: true,
      parental_consent_at: timestamp,
      parental_consent_version: version,
    });
    setActiveTab('privacy');
    showSuccess('Parental consent recorded successfully under NDPA 2023 Section 31 & 34.');
  };

  const deletionEmailSubject = encodeURIComponent(
    `NDPA 2023 Data Erasure Request - ${profile?.full_name || 'Parent'}`
  );
  const deletionEmailBody = encodeURIComponent(
    `Dear Mrs Sarah,\n\nIn accordance with my statutory rights under Section 34 of the Nigeria Data Protection Act (NDPA) 2023, I hereby formally request the complete erasure and deletion of all personal and child data associated with my account.\n\nAccount Details:\n- Parent Name: ${profile?.full_name || ''}\n- Registered Email: ${profile?.email || ''}\n- Phone: ${profile?.phone || ''}\n- Children Enrolled: ${childrenList.map((c) => c.name).join(', ') || 'N/A'}\n- Date of Request: ${new Date().toLocaleDateString('en-GB')}\n\nI understand that Mrs Sarah Early Years Tutoring will process this request within the statutory 30-day response window and notify me when all records, progress tracking, and uploaded media have been permanently deleted.\n\nThank you,\n${profile?.full_name || ''}`
  );
  const deletionMailto = `mailto:sarahoakhena@gmail.com?subject=${deletionEmailSubject}&body=${deletionEmailBody}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-[#D4A017]" />
            {isOwner ? 'Owner & Business Control' : 'Family Account Settings'}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'Manage your tutor profile, editable bank details for invoices, credentials, and notification settings.'
              : 'Manage your contact details, children’s profiles, profile photos, and lesson reminders.'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
          }`}
        >
          <User className="w-4 h-4" />
          Profile & Photo
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
          }`}
        >
          <Key className="w-4 h-4" />
          Security & Password
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'business'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#D4A017]" />
            Bank & Invoices
          </button>
        )}

        {!isOwner && (
          <button
            onClick={() => setActiveTab('children')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'children'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
            }`}
          >
            <Users className="w-4 h-4 text-[#D4A017]" />
            Linked Children ({childrenList.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'privacy'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
          }`}
        >
          <Shield className="w-4 h-4 text-[#D4A017]" />
          Data Privacy & NDPA
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PROFILE & PHOTO                                    */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Avatar card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6 text-center">
            <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
              Profile Photo
            </h3>

            <div className="relative mx-auto w-32 h-32 rounded-3xl overflow-hidden border-2 border-[#D4A017] shadow-sm bg-[#E8F0FA] flex items-center justify-center">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt={fullName || 'Profile photo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-bold text-4xl text-[#1E4E8C]">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                  Uploading...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={profileFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                onClick={() => profileFileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-[#D4A017]" />
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full py-2 px-4 rounded-xl text-rose-600 text-xs font-bold hover:bg-rose-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Photo
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#6B7280]">
              Recommended: Square JPG, PNG, or WebP up to 5MB.
            </p>
          </div>

          {/* Profile Details Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                Personal Details
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Update your contact details displayed on communications and lesson schedules.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Mrs Sarah Oakhena"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Used for login and automated tutorial receipts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 09133651659"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    For direct lesson reminders and urgent notices.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Scheduling & Reminder Timezone
                </label>
                <div className="p-3 bg-[#E8F0FA] rounded-xl border border-[#C7DAF3] flex items-center justify-between text-xs text-[#1E4E8C]">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#D4A017] shrink-0" />
                    <span>
                      {isOwner
                        ? 'Africa/Lagos (West Africa Time, WAT • UTC+1)'
                        : `${profile?.timezone || detectUserTimezone()} (${getTimezoneAbbr(profile?.timezone || detectUserTimezone())})`}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#1E4E8C] border border-[#C7DAF3]">
                    {isOwner ? 'Permanent Tutor Timezone' : 'Active Local Timezone'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {isOwner
                    ? 'Mrs Sarah consistently views all teaching hours and bookings in West Africa Time (WAT).'
                    : 'Session times and automated lesson reminder emails are automatically delivered in your local timezone.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-all flex items-center gap-2 shadow-xs shadow-amber-200"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SECURITY & PASSWORD                                */}
      {/* ========================================================= */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#1E4E8C] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#D4A017]" />
              Update Account Password
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Choose a secure password of at least 6 characters.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter at least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-[#D4A017]" />
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: NOTIFICATIONS                                      */}
      {/* ========================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#D4A017]" />
                Notification Preferences
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Customize which alerts and progress reports you receive.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#14263F]">Email Reminders & Summaries</h4>
                  <p className="text-xs text-[#6B7280]">Receive email updates about account events and upcoming sessions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('email_reminders')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationPrefs.email_reminders ? 'bg-[#1E4E8C]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      notificationPrefs.email_reminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#14263F]">Session Booking Reminders</h4>
                  <p className="text-xs text-[#6B7280]">Get reminders 24 hours and 1 hour before every scheduled tutorial.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('session_reminders')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationPrefs.session_reminders ? 'bg-[#1E4E8C]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      notificationPrefs.session_reminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#14263F]">Invoice & Billing Alerts</h4>
                  <p className="text-xs text-[#6B7280]">Instant notification when new monthly invoices or payment receipts are generated.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('invoice_alerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationPrefs.invoice_alerts ? 'bg-[#1E4E8C]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      notificationPrefs.invoice_alerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#14263F]">Montessori Milestone Updates</h4>
                  <p className="text-xs text-[#6B7280]">Notifies you as soon as new skills are mastered or lesson notes are logged by Mrs Sarah.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('milestone_updates')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationPrefs.milestone_updates ? 'bg-[#1E4E8C]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      notificationPrefs.milestone_updates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Per-Child Notification toggles for Parents */}
          {!isOwner && childrenList.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
                Per-Child Notification Preferences
              </h3>
              <p className="text-xs text-[#6B7280]">
                Choose which specific notifications you wish to receive for each registered child.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {childrenList.map((c) => {
                  const childPrefs = notificationPrefs.child_notifications?.[c.id] || {
                    session_reminders: true,
                    milestone_updates: true,
                  };
                  return (
                    <div key={c.id} className="p-4 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-3">
                      <div className="flex items-center gap-3">
                        {c.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.avatar_url}
                            alt={c.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#D4A017]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-[#D4A017] font-bold flex items-center justify-center text-sm">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-[#14263F]">{c.name}</div>
                          <div className="text-[11px] text-[#6B7280]">Age {c.age_years || '—'}</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-amber-100 text-xs">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#14263F] font-medium">Session Reminders</span>
                          <input
                            type="checkbox"
                            checked={childPrefs.session_reminders}
                            onChange={() => handleToggleChildNotification(c.id, 'session')}
                            className="rounded border-gray-300 text-[#1E4E8C] focus:ring-[#1E4E8C] h-4 w-4"
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#14263F] font-medium">Milestone Progress Alerts</span>
                          <input
                            type="checkbox"
                            checked={childPrefs.milestone_updates}
                            onChange={() => handleToggleChildNotification(c.id, 'milestone')}
                            className="rounded border-gray-300 text-[#1E4E8C] focus:ring-[#1E4E8C] h-4 w-4"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: OWNER BANK & INVOICE DETAILS                        */}
      {/* ========================================================= */}
      {isOwner && activeTab === 'business' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D4A017]" />
                Invoice Payment & Bank Account Details
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                These bank details dynamically populate parents’ invoice payment banners, receipt instructions, and WhatsApp payment links.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBankDetails} className="space-y-6">
            <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[#F3E7C4] text-xs text-[#1E4E8C] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
              <p>
                <strong>Dynamic Invoicing Guarantee:</strong> Updating your bank details below will instantly update all active parent invoice views and payment instruction banners without hardcoded values.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.bank_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                  required
                  placeholder="e.g. Guaranty Trust Bank (GTBank)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.account_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_name: e.target.value })}
                  required
                  placeholder="e.g. Sarah Adeleke / EYT Academy"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankDetails.account_number}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                  required
                  placeholder="e.g. 0123456789"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Payment Instructions for Parents
              </label>
              <textarea
                rows={2}
                value={bankDetails.instructions}
                onChange={(e) => setBankDetails({ ...bankDetails, instructions: e.target.value })}
                placeholder="Instructions displayed to parents when settling invoices..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-heading font-bold text-sm text-[#1E4E8C] mb-3">
                Business Contact Channels
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    WhatsApp Proof Number
                  </label>
                  <input
                    type="tel"
                    value={bankDetails.whatsapp_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, whatsapp_number: e.target.value })}
                    placeholder="e.g. 09133651659"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Used for WhatsApp payment proof submission link.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={bankDetails.business_phone}
                    onChange={(e) => setBankDetails({ ...bankDetails, business_phone: e.target.value })}
                    placeholder="e.g. 09133651659"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={bankDetails.business_email}
                    onChange={(e) => setBankDetails({ ...bankDetails, business_email: e.target.value })}
                    placeholder="e.g. sarahoakhena@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4A017]" />
                <h4 className="font-heading font-bold text-sm text-[#1E4E8C]">
                  International Payment Instructions & Links (EUR / GBP / USD)
                </h4>
              </div>
              <p className="text-xs text-[#6B7280]">
                Configure instructions and payment handles displayed to international families on non-NGN tuition invoices.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  International Payment Instructions
                </label>
                <textarea
                  rows={2}
                  value={bankDetails.international_payment_instructions || ''}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, international_payment_instructions: e.target.value })
                  }
                  placeholder="Instructions displayed on EUR, GBP, and USD invoices..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    PayPal.me Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={bankDetails.paypal_link || ''}
                    onChange={(e) => setBankDetails({ ...bankDetails, paypal_link: e.target.value })}
                    placeholder="https://paypal.me/yourusername"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Direct PayPal payment link.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Wise Account / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankDetails.wise_details || ''}
                    onChange={(e) => setBankDetails({ ...bankDetails, wise_details: e.target.value })}
                    placeholder="e.g. @sarah-eyt-academy or IBAN"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Wise tag or IBAN/sort code instructions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Stripe Payment Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={bankDetails.stripe_link || ''}
                    onChange={(e) => setBankDetails({ ...bankDetails, stripe_link: e.target.value })}
                    placeholder="https://buy.stripe.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Direct card payment checkout link.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-all flex items-center gap-2 shadow-xs shadow-amber-200"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Updating...' : 'Save Bank & Business Details'}
              </button>
            </div>
          </form>
        </div>

        {/* PUBLIC PRICING & TRIAL SESSION SETTINGS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D4A017]" />
                Public Pricing & Trial Session Offerings
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Manage your public tutoring rates, monthly package descriptions, and introductory trial session availability.
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePricingSettings} className="space-y-6">
            <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[#F3E7C4] text-xs text-[#1E4E8C] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
              <p>
                <strong>Transparent Pricing Guarantee:</strong> Rates entered here are displayed directly on the public learning options section. If left blank or set to 0, the card will display &ldquo;Contact for pricing&rdquo;.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Online Tutorial Rate (per session)
                </label>
                <input
                  type="text"
                  value={pricingSettings.online_session_rate || ''}
                  onChange={(e) => setPricingSettings({ ...pricingSettings, online_session_rate: e.target.value })}
                  placeholder="e.g. ₦15,000 (leave blank for 'Contact for pricing')"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Displayed on the Online Tutorial card on the homepage.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Home Tutorial Rate (per session)
                </label>
                <input
                  type="text"
                  value={pricingSettings.home_session_rate || ''}
                  onChange={(e) => setPricingSettings({ ...pricingSettings, home_session_rate: e.target.value })}
                  placeholder="e.g. ₦25,000 (leave blank for 'Contact for pricing')"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Displayed on the Home Tutorial card on the homepage.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Monthly Package Description / Pricing (Optional)
              </label>
              <textarea
                rows={2}
                value={pricingSettings.monthly_package_rate || ''}
                onChange={(e) => setPricingSettings({ ...pricingSettings, monthly_package_rate: e.target.value })}
                placeholder="e.g. Custom monthly packages available — enquire for tailored 2x or 3x weekly bundles..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none resize-none"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Optional highlight banner displayed beneath learning options for bundled monthly tuition.
              </p>
            </div>

            {/* SECONDARY CURRENCY & DUAL RATE CONFIGURATION */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4A017]" />
                <h4 className="font-heading font-bold text-sm text-[#1E4E8C]">
                  Secondary Rate Display (Optional for International Clients)
                </h4>
              </div>
              <p className="text-xs text-[#6B7280]">
                Optionally display a second rate alongside your primary Nigerian rate (e.g. &ldquo;Online session: ₦15,000 / €30&rdquo;). If only one rate is set, only that one displays on the public website.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Secondary Currency
                  </label>
                  <select
                    value={pricingSettings.secondary_currency || ''}
                    onChange={(e) =>
                      setPricingSettings({ ...pricingSettings, secondary_currency: e.target.value || null })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none bg-white font-medium"
                  >
                    <option value="">None (Primary only)</option>
                    <option value="EUR">Euro (EUR €)</option>
                    <option value="GBP">British Pound (GBP £)</option>
                    <option value="USD">US Dollar (USD $)</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Secondary currency for foreign families.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Online Rate (Secondary Currency)
                  </label>
                  <input
                    type="text"
                    value={pricingSettings.online_session_secondary_rate || ''}
                    onChange={(e) =>
                      setPricingSettings({ ...pricingSettings, online_session_secondary_rate: e.target.value })
                    }
                    placeholder="e.g. €30 (leave blank to omit)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Rate shown on the Online card if set.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Home Rate (Secondary Currency)
                  </label>
                  <input
                    type="text"
                    value={pricingSettings.home_session_secondary_rate || ''}
                    onChange={(e) =>
                      setPricingSettings({ ...pricingSettings, home_session_secondary_rate: e.target.value })
                    }
                    placeholder="e.g. €50 (leave blank to omit)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Rate shown on the Home card if set.
                  </p>
                </div>
              </div>

              {(pricingSettings.online_session_secondary_rate || pricingSettings.home_session_secondary_rate) && (
                <div className="p-3 bg-[#E8F0FA] rounded-xl border border-[#C7DAF3] text-xs text-[#1E4E8C] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A017] shrink-0" />
                  <span>
                    <strong>Live Public Rate Preview:</strong> Online: {formatDualRate(pricingSettings.online_session_rate, pricingSettings.online_session_secondary_rate)} • Home: {formatDualRate(pricingSettings.home_session_rate, pricingSettings.home_session_secondary_rate)}
                  </span>
                </div>
              )}
            </div>

            {/* TRIAL SESSION MECHANIC */}
            <div className="pt-4 border-t border-gray-100">
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4A017]" />
                      <h4 className="font-heading font-bold text-sm text-[#1E4E8C]">
                        Introductory Trial Session Feature
                      </h4>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Offer a 1-on-1 diagnostic trial session. Strictly limited to 1 trial session per child/family to prevent repeat bookings.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={pricingSettings.trial_session_enabled}
                      onChange={(e) =>
                        setPricingSettings({ ...pricingSettings, trial_session_enabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {pricingSettings.trial_session_enabled && (
                  <div className="pt-3 border-t border-gray-200/60 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                          Trial Session Price (NGN ₦) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={pricingSettings.trial_session_price}
                          onChange={(e) =>
                            setPricingSettings({
                              ...pricingSettings,
                              trial_session_price: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          placeholder="0 for Free"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          {pricingSettings.trial_session_price === 0
                            ? 'Marked as FREE / Complimentary on public badges & invoices.'
                            : `Priced at ₦${Number(pricingSettings.trial_session_price).toLocaleString()} on trial invoices.`}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                          Trial Session Title / Description
                        </label>
                        <input
                          type="text"
                          value={pricingSettings.trial_session_description || ''}
                          onChange={(e) =>
                            setPricingSettings({
                              ...pricingSettings,
                              trial_session_description: e.target.value,
                            })
                          }
                          placeholder="e.g. 1-on-1 Montessori Diagnostic & Learning Style Evaluation"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Trial CTA is <strong>active</strong> on your public homepage and enquiry form. Bookings will enforce the 1-trial-per-child rule automatically.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingPricing}
                className="px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                {isSavingPricing ? 'Saving Pricing...' : 'Save Pricing & Trial Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* PUBLIC HOMEPAGE CAREER STATISTICS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4A017]" />
                Public Homepage Career Statistics
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Update your verified career facts displayed in the animated counters on the public homepage.
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePublicStats} className="space-y-6">
            <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[#F3E7C4] text-xs text-[#1E4E8C] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
              <p>
                <strong>Truthful Statistics Policy:</strong> These counters show your real career milestones. They animate up when parents scroll past them on the homepage. As your practice grows over time, you can update them here without touching code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Years of Teaching Experience *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={publicStats.years_of_experience}
                    onChange={(e) =>
                      setPublicStats({
                        ...publicStats,
                        years_of_experience: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#D4A017] pointer-events-none">
                    + Years
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Displays on homepage as &ldquo;{publicStats.years_of_experience}+ Years of Experience&rdquo;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Families Nurtured / Supported *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={publicStats.families_served}
                    onChange={(e) =>
                      setPublicStats({
                        ...publicStats,
                        families_served: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#D4A017] pointer-events-none">
                    + Families
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Displays on homepage as &ldquo;{publicStats.families_served}+ Families Supported&rdquo;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Core Learning Areas (Fixed)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="5 Core Pillars"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600 outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Phonics, Math, Practical Life, Arts, & Social Growth.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingPublicStats}
                className="px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                {isSavingPublicStats ? 'Saving Career Stats...' : 'Save Career Statistics'}
              </button>
            </div>
          </form>
        </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PARENT LINKED CHILDREN                             */}
      {/* ========================================================= */}
      {!isOwner && activeTab === 'children' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4A017]" />
                Manage Linked Children Profiles
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Update your children’s profile photos, learning goals, and developmental notes.
              </p>
            </div>
          </div>

          {childrenList.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-3">
              <Users className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-sm font-semibold text-[#14263F]">No children registered yet.</p>
              <p className="text-xs text-[#6B7280]">
                Add your child’s profile from the dashboard to start tracking milestones.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#E8F0FA] border border-[#D4A017] flex items-center justify-center shrink-0">
                          {child.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={child.avatar_url}
                              alt={child.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-heading font-bold text-xl text-[#1E4E8C]">
                              {child.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-base text-[#14263F]">
                            {child.name}
                          </h4>
                          <p className="text-xs text-[#6B7280]">
                            Age: {child.age_years || '—'} • DOB: {child.date_of_birth || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Linked
                      </span>
                    </div>

                    {child.learning_goals && (
                      <div className="p-3 bg-[#F3F7FD] rounded-xl text-xs space-y-0.5">
                        <span className="font-bold text-[#1E4E8C]">Focus Goals:</span>
                        <p className="text-[#14263F]/90">{child.learning_goals}</p>
                      </div>
                    )}

                    {child.notes && (
                      <p className="text-xs text-[#6B7280] italic">
                        &ldquo;{child.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => startEditingChild(child)}
                      className="px-4 py-2 rounded-xl bg-[#E8F0FA] text-[#1E4E8C] font-bold text-xs hover:bg-[#d8e6f7] transition-colors"
                    >
                      Edit Profile & Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Child Edit Modal */}
          {editingChildId && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
            >
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative my-8 animate-in fade-in zoom-in-95 duration-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                    Edit Child Profile
                  </h3>
                  <button
                    onClick={() => setEditingChildId(null)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveChild} className="space-y-4">
                  {/* Photo upload section */}
                  <div className="flex items-center gap-4 p-3 bg-[#FCFBF7] rounded-2xl border border-[#F3E7C4]">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-[#D4A017] flex items-center justify-center shrink-0">
                      {childEditForm.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={childEditForm.avatar_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-heading font-bold text-xl text-[#1E4E8C]">
                          {childEditForm.name ? childEditForm.name.charAt(0) : 'C'}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <input
                        ref={childFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleChildPhotoSelect}
                      />
                      <button
                        type="button"
                        onClick={() => childFileInputRef.current?.click()}
                        disabled={childPhotoUploading}
                        className="px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-colors flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#D4A017]" />
                        {childPhotoUploading ? 'Uploading...' : 'Upload Child Photo'}
                      </button>
                      <p className="text-[10px] text-[#6B7280]">
                        Square JPG, PNG, or WebP up to 5MB.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                      Child Full Name *
                    </label>
                    <input
                      type="text"
                      value={childEditForm.name}
                      onChange={(e) => setChildEditForm({ ...childEditForm, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="12"
                        value={childEditForm.age_years}
                        onChange={(e) => setChildEditForm({ ...childEditForm, age_years: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={childEditForm.date_of_birth}
                        onChange={(e) => setChildEditForm({ ...childEditForm, date_of_birth: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                      Target Learning Goals
                    </label>
                    <input
                      type="text"
                      value={childEditForm.learning_goals}
                      onChange={(e) => setChildEditForm({ ...childEditForm, learning_goals: e.target.value })}
                      placeholder="e.g. Phonics blending, pencil grip, counting to 20"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                      Notes / Allergies / Preferences
                    </label>
                    <textarea
                      rows={2}
                      value={childEditForm.notes}
                      onChange={(e) => setChildEditForm({ ...childEditForm, notes: e.target.value })}
                      placeholder="e.g. Needs extra encouragement with writing, peanut allergy"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingChildId(null)}
                      className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-all"
                    >
                      Save Child
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: DATA PRIVACY & NDPA 2023 STATUTORY COMPLIANCE       */}
      {/* ========================================================= */}
      {activeTab === 'privacy' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] shrink-0">
                  <Shield className="w-6 h-6 text-[#D4A017]" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#1E4E8C]">
                    Nigeria Data Protection Act (NDPA) 2023 Compliance
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Your statutory data protection rights, verified parental consent record, and data autonomy tools.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#1E4E8C] hover:bg-[#E8F0FA] transition-all shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D4A017]" />
                  Privacy Policy
                  <ExternalLink className="w-3 h-3 text-[#6B7280]" />
                </Link>
                <Link
                  href="/terms"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#1E4E8C] hover:bg-[#E8F0FA] transition-all shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D4A017]" />
                  Terms of Service
                  <ExternalLink className="w-3 h-3 text-[#6B7280]" />
                </Link>
              </div>
            </div>

            {/* Parental Consent Status */}
            <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#E5E0D8] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Check className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14263F] flex items-center gap-2">
                      <span>Statutory Parental Consent Status</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {profile?.parental_consent_given ? 'Active & Verified' : 'Standard'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      Framework: {profile?.parental_consent_version || 'NDPA-2023-v1.0'} &bull; Consented on:{' '}
                      {profile?.parental_consent_at
                        ? new Date(profile.parental_consent_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recorded during account registration'}
                    </p>
                  </div>
                </div>
                {!profile?.parental_consent_given && (
                  <button
                    onClick={handleConfirmConsent}
                    className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-all"
                  >
                    Confirm Parental Consent
                  </button>
                )}
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                In compliance with Section 31 of the Nigeria Data Protection Act (NDPA) 2023, personal data of minors (children)
                is processed strictly with lawful parental or guardian consent. All collected observations, photos, and milestones
                are utilized solely for Montessori early years educational instruction, attendance tracking, and parent updates.
              </p>
            </div>
          </div>

          {/* Two Action Cards: Access/Export and Erasure/Deletion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Right to Access & Portability */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C]">
                  <Download className="w-5 h-5 text-[#1E4E8C]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
                    Right of Access & Portability (NDPA 2023, Section 34)
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Under Section 34 of the NDPA 2023, you have the statutory right to request and receive a digital copy of
                    all personal records and child developmental information held by Mrs Sarah in an open, structured JSON format.
                  </p>
                </div>

                <div className="text-[11px] text-[#6B7280] space-y-1.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <p className="font-bold text-[#14263F]">Included in your downloadable data archive:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Parent contact info & verified consent metadata</li>
                    <li>Linked child profiles, DOB & learning goals</li>
                    <li>Montessori developmental milestones & tutor notes</li>
                    <li>Tuition invoices, fee history & payment statuses</li>
                    <li>In-app communication records & notification settings</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                Download Complete Data Archive (JSON)
              </button>
            </div>

            {/* Card 2: Right to Erasure & Deletion */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#1E4E8C]">
                    Right to Erasure / Account Deletion (NDPA 2023, Section 34)
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    You have the right to request the permanent deletion and erasure of your family account and all associated child
                    records. Deletion requests are processed directly by Mrs Sarah within the statutory 30-day window.
                  </p>
                </div>

                <div className="text-[11px] text-rose-900 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 space-y-1.5">
                  <p className="font-bold text-rose-800">Statutory 30-Day Response Window:</p>
                  <p className="leading-relaxed">
                    Upon receipt, Mrs Sarah will verify your identity and purge all child developmental assessments, session logs,
                    and uploaded media. Financial audit trails are retained only where mandated by applicable Nigerian laws.
                  </p>
                </div>
              </div>

              <a
                href={deletionMailto}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-rose-200 bg-rose-50/40 text-rose-700 font-bold text-xs hover:bg-rose-100/70 transition-all text-center"
              >
                <Mail className="w-4 h-4" />
                Request Complete Erasure / Account Deletion
              </a>
            </div>
          </div>

          {/* Retention & Controller Info Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200 shadow-xs text-xs text-[#6B7280] space-y-4">
            <h4 className="font-heading font-bold text-sm text-[#14263F]">
              Data Controller & Retention Policies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="font-bold text-[#14263F] mb-1">Designated Data Controller</div>
                <div>Mrs Sarah Early Years Tutoring</div>
                <div className="text-[#1E4E8C] mt-1 font-medium">sarahoakhena@gmail.com</div>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="font-bold text-[#14263F] mb-1">Retention Schedule</div>
                <div>Retained during active enrollment + 12 months grace period, or immediate upon verified erasure.</div>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="font-bold text-[#14263F] mb-1">Security Standards</div>
                <div>Row-Level Security (RLS), encrypted sessions, no marketing or commercial third-party sharing.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
