'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, PlusCircle, X } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Resource } from '@/lib/eyt-service';

export default function ResourcesPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding resource
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubject, setNewSubject] = useState('literacy');
  const [newAge, setNewAge] = useState('3-5');

  const loadResources = () => {
    setResources(EYTService.getResources());
  };

  useEffect(() => {
    loadResources();
  }, [profile]);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    EYTService.addResource({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      file_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      file_type: 'pdf',
      subject_area: newSubject,
      age_range: newAge,
    });

    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
    loadResources();
  };

  const filteredResources = selectedSubject === 'all'
    ? resources
    : resources.filter((r) => r.subject_area === selectedSubject);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-[#D4A017]" />
            Montessori Materials & Worksheets
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Learning Resources Library
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'Upload and assign curated phonics worksheets, math bead charts, and home activity guides.'
              : 'Download printable activity sheets and Montessori guides assigned to your child.'}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
          >
            <PlusCircle className="w-4 h-4" />
            Upload New Resource
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Resources' },
          { key: 'literacy', label: 'Phonics & Literacy' },
          { key: 'numeracy', label: 'Early Numeracy' },
          { key: 'practical_life', label: 'Practical Life' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedSubject(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedSubject === tab.key
                ? 'bg-[#1E4E8C] text-white shadow-sm'
                : 'bg-white text-[#14263F] border border-gray-200 hover:bg-[#E8F0FA]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#D4A017] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FA] text-[#1E4E8C] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-[#E8F0FA] text-[#1E4E8C]">
                    {res.subject_area || 'General'}
                  </span>
                  {res.age_range && (
                    <span className="text-[10px] font-semibold text-[#6B7280]">
                      Ages {res.age_range}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-base text-[#14263F]">
                  {res.title}
                </h3>
                {res.description && (
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-[#6B7280] uppercase font-bold">
                PDF Document
              </span>
              <a
                href={res.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] font-bold text-xs hover:bg-[#d8e6f7] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open / Print</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Resource Modal for Owner */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                Upload Learning Resource
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Phonics Digraph Flashcards (PDF)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Printable cards for sh, ch, th words with visual illustrations."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Subject Area
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
                  >
                    <option value="literacy">Phonics & Literacy</option>
                    <option value="numeracy">Early Numeracy</option>
                    <option value="practical_life">Practical Life</option>
                    <option value="cultural">Cultural</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Age Group
                  </label>
                  <select
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
                  >
                    <option value="3-5">3–5 Years</option>
                    <option value="4-6">4–6 Years</option>
                    <option value="5-8">5–8 Years</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A]"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
