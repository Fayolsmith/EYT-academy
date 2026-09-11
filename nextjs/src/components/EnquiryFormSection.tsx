'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Mail, Clock, ShieldCheck, HeartHandshake, MessageCircle } from 'lucide-react';
import { EYTService, PricingSettings } from '@/lib/eyt-service';

export default function EnquiryFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    child_age: '',
    preferred_mode: 'online',
    message: '',
  });

  const [pricing, setPricing] = useState<PricingSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setPricing(EYTService.getPricingSettings());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
      setErrorMsg('Please complete your name, contact information, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await EYTService.submitEnquiry({
        name: formData.name,
        contact: formData.contact,
        child_age: formData.child_age,
        preferred_mode: formData.preferred_mode,
        message: formData.message,
      });

      setIsSubmitted(true);
      setFormData({
        name: '',
        contact: '',
        child_age: '',
        preferred_mode: 'online',
        message: '',
      });
    } catch {
      setErrorMsg('Failed to send enquiry. Please contact Mrs Sarah directly via phone or email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="enquiry" className="py-20 bg-gradient-to-b from-[#F3F7FD]/80 to-[#E8F0FA]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Info & Promise */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#C7DAF3] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-[#D4A017]" />
              Direct Communication
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E4E8C] leading-tight">
              LET&apos;S HELP YOUR CHILD <br />
              <span className="text-[#D4A017]">LEARN, GROW & SHINE!</span>
            </h2>

            <p className="text-base text-[#14263F]/80 leading-relaxed">
              Have questions about your child&apos;s developmental milestones, reading readiness, or available slots? Send an enquiry and Mrs Sarah will personally respond within 24 hours.
            </p>

            {/* Direct Contact Cards */}
            <div className="space-y-3 pt-2">
              <a
                href="https://wa.me/2349133651659"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-500 transition-all shadow-xs group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 flex items-center justify-center text-emerald-600 group-hover:text-white transition-colors shrink-0">
                  <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#6B7280]">Chat on WhatsApp</div>
                </div>
              </a>

              <a
                href="mailto:sarahoakhena@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-[#1E4E8C] transition-all shadow-xs group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E8F0FA] group-hover:bg-[#1E4E8C] flex items-center justify-center text-[#1E4E8C] group-hover:text-white transition-colors shrink-0">
                  <Mail className="w-5 h-5 text-[#D4A017] group-hover:text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#6B7280]">Email Tutor Directly</div>
                  <div className="text-sm font-bold text-[#1E4E8C] break-all">sarahoakhena@gmail.com</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#FCFBF7] border border-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#6B7280]">Available Sessions</div>
                  <div className="text-sm font-bold text-[#14263F]">Mondays to Saturdays (Flexible Slots)</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-[#C7DAF3] flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#1E4E8C] shrink-0" />
              <p className="text-xs text-[#6B7280]">
                Your information is held strictly confidential and only used for tutoring coordination.
              </p>
            </div>
          </div>

          {/* Right Column: Public Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 relative">
              
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                    Enquiry Received Successfully!
                  </h3>
                  <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
                    Thank you! Mrs Sarah has received your message and will get in touch with you shortly at your provided contact number or email.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] font-bold text-sm hover:bg-[#d8e6f7] transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                      Send an Enquiry / Request a Slot
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                      No sign-up required. Tell us a bit about your child to begin.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                      {errorMsg}
                    </div>
                  )}

                  {/* Parent Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mrs Elizabeth Adeleke"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Contact Number / Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                      Phone Number or WhatsApp (or Email) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="e.g. 08023456789 or parent@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Child Age & Preferred Mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Child&apos;s Age / Class
                      </label>
                      <input
                        type="text"
                        value={formData.child_age}
                        onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
                        placeholder="e.g. 4 years old (Preschool)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Preferred Tutorial Mode
                      </label>
                      <select
                        value={formData.preferred_mode}
                        onChange={(e) => setFormData({ ...formData, preferred_mode: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent transition-all bg-white"
                      >
                        <option value="online">Online Tutorial (Live Video)</option>
                        <option value="home">Home Tutorial (In-person)</option>
                        <option value="both">Flexible / Either</option>
                        {pricing?.trial_session_enabled && (
                          <option value="trial">
                            Diagnostic Trial Session ({pricing.trial_session_price === 0 ? 'Free' : `${pricing.currency || '₦'}${Number(pricing.trial_session_price).toLocaleString()}`})
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                      Message / What area does your child need help with? *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g. My child needs help with letter sounds, blending CVC words, or number recognition..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#D4A017] text-white font-bold text-base hover:bg-[#A9790A] transition-all shadow-md shadow-amber-200 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Sending Enquiry...' : 'Submit Enquiry to Mrs Sarah'}
                  </button>

                  <p className="text-[11px] text-center text-[#6B7280]">
                    Submitting this form records your enquiry directly into Mrs Sarah&apos;s admin inbox.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
