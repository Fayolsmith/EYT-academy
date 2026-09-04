'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Enquiry } from '@/lib/eyt-service';

export default function EnquiriesPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  const loadEnquiries = () => {
    setEnquiries(EYTService.getEnquiries());
  };

  useEffect(() => {
    loadEnquiries();
  }, [profile]);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    EYTService.updateEnquiryStatus(
      id,
      currentStatus === 'new' ? 'contacted' : 'new'
    );
    loadEnquiries();
  };

  if (!isOwner) {
    return (
      <div className="bg-white rounded-3xl p-10 max-w-xl mx-auto text-center border border-gray-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] mx-auto">
          <Mail className="w-6 h-6 text-[#D4A017]" />
        </div>
        <h2 className="font-heading text-xl font-bold text-[#1E4E8C]">
          Parent Contact Hub
        </h2>
        <p className="text-xs text-[#6B7280]">
          The Enquiry Inbox is managed by Mrs Sarah. To send an enquiry or message Mrs Sarah, use the public contact form or the Messages tab.
        </p>
        <div className="pt-2">
          <Link
            href="/app/messages"
            className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs inline-flex items-center gap-1.5"
          >
            Go to Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <Mail className="w-3.5 h-3.5 text-[#D4A017]" />
            New Client Leads
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Public Enquiry Inbox
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Review and respond to parent inquiries submitted from the public website contact form.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#E8F0FA] text-[#1E4E8C] px-3.5 py-1.5 rounded-full self-start sm:self-auto">
          {enquiries.filter((e) => e.status === 'new').length} Unread / New
        </span>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#14263F]">
            <thead className="bg-[#E8F0FA] text-[#1E4E8C] uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Parent Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Child Age / Class</th>
                <th className="p-4">Preferred Mode</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-[#1E4E8C]">{enq.name}</td>
                  <td className="p-4 font-medium">{enq.contact}</td>
                  <td className="p-4 text-[#6B7280]">{enq.child_age || '—'}</td>
                  <td className="p-4 uppercase text-[10px] font-bold text-[#D4A017]">{enq.preferred_mode || 'online'}</td>
                  <td className="p-4 max-w-xs text-gray-700 leading-relaxed">{enq.message}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        enq.status === 'new'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(enq.id, enq.status)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-colors"
                    >
                      {enq.status === 'new' ? 'Mark Contacted' : 'Mark New'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
