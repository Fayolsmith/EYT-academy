'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Hash, Scissors, Globe, Palette, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WhatITutorSection() {
  const subjects = [
    {
      id: 'phonics',
      title: 'Phonics & Early Literacy',
      badgeText: 'ABC',
      badgeColor: 'bg-rose-500',
      icon: BookOpen,
      iconColor: 'text-rose-500',
      summary: 'Letter sounds, blending, sight words, reading readiness',
      description: 'Building confident early readers through systematic phonics instruction. Children master phoneme recognition, learn to blend CVC words, expand their high-frequency vocabulary, and develop emergent reading fluency.',
      skills: [
        'Letter sound recognition (Phase 1–3)',
        'CVC & 4-letter word blending',
        'Sight word automaticity',
        'Story comprehension & vocabulary',
        'Pencil grip & handwriting strokes',
      ],
    },
    {
      id: 'numeracy',
      title: 'Early Numeracy',
      badgeText: '123',
      badgeColor: 'bg-amber-500',
      icon: Hash,
      iconColor: 'text-[#D4A017]',
      summary: 'Counting, number sense, addition, subtraction, shapes & patterns',
      description: 'Montessori-inspired mathematical foundations using concrete objects before abstract symbols. Developing true number sense, 1-to-1 correspondence, and joyful problem-solving.',
      skills: [
        'Numeral recognition 1 to 100',
        'One-to-one object counting',
        'Hands-on addition & subtraction',
        '2D/3D shapes & geometric patterns',
        'Measurement, sorting & comparisons',
      ],
    },
    {
      id: 'practical-life',
      title: 'Practical Life Skills',
      badgeIcon: Scissors,
      badgeColor: 'bg-emerald-500',
      icon: Scissors,
      iconColor: 'text-emerald-500',
      summary: 'Independence, routines, fine & gross motor skills',
      description: 'Core Montessori exercises that foster self-reliance, physical coordination, self-discipline, and deep concentration that directly enhances academic readiness.',
      skills: [
        'Pincer grip & finger dexterity',
        'Scissor cutting & bead threading',
        'Independent study routines & packing away',
        'Sustained task concentration (15–30 mins)',
        'Self-regulation & emotional awareness',
      ],
    },
    {
      id: 'cultural',
      title: 'Cultural & General Knowledge',
      badgeIcon: Globe,
      badgeColor: 'bg-sky-500',
      icon: Globe,
      iconColor: 'text-[#1E4E8C]',
      summary: 'Our world, seasons, animals, countries and more',
      description: 'Broadening your child’s worldview with fascinating investigations into our planet, natural sciences, geography, and living creatures through engaging visual stories.',
      skills: [
        'The four seasons & weather observation',
        'Living vs. non-living classification',
        'Animal habitats, diet & life cycles',
        'Continents, flags & global cultures',
        'Community helpers & day-to-day science',
      ],
    },
    {
      id: 'arts',
      title: 'Creative & Expressive Arts',
      badgeIcon: Palette,
      badgeColor: 'bg-purple-500',
      icon: Palette,
      iconColor: 'text-purple-500',
      summary: 'Art, creativity, storytelling & imagination',
      description: 'Encouraging self-expression, innovative thinking, and confidence through imaginative drama, rhymes, music, and diverse art media.',
      skills: [
        'Color mixing & paintbrush exploration',
        'Multi-texture collaging & clay modeling',
        'Puppet play & expressive storytelling',
        'Rhythmic songs, rhymes & memory verse',
        'Creative confidence & imaginative flair',
      ],
    },
  ];

  const [activeSubject, setActiveSubject] = useState(subjects[0]);

  return (
    <section id="services" className="py-20 bg-[#F3F7FD]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F0FA] border border-[#C7DAF3] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            Curriculum Areas
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E4E8C]">
            WHAT I TUTOR
          </h2>
          <p className="text-base sm:text-lg text-[#6B7280]">
            Holistic, child-centered instruction tailored to build rock-solid foundations in essential academic and developmental domains.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSubject.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveSubject(item)}
                className={`cursor-pointer rounded-2xl p-6 transition-all border ${
                  isSelected
                    ? 'bg-white border-[#D4A017] shadow-xl ring-2 ring-[#D4A017]/20 -translate-y-1'
                    : 'bg-white border-gray-200/80 shadow-sm hover:border-[#1E4E8C]/40 hover:shadow-md'
                }`}
              >
                {/* Card Top: Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0FA] flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <span className={`w-8 h-8 rounded-full ${item.badgeColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {item.badgeIcon ? (
                      <item.badgeIcon className="w-4 h-4 text-white" />
                    ) : (
                      item.badgeText
                    )}
                  </span>
                </div>

                {/* Title & Flyer Summary */}
                <h3 className="font-heading text-xl font-bold text-[#1E4E8C] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-[#D4A017] mb-3">
                  ({item.summary})
                </p>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#14263F]/80 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Skills Bullet points */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  {item.skills.slice(0, 3).map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#14263F]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                  {item.skills.length > 3 && (
                    <div className="text-[11px] font-semibold text-[#1E4E8C] pt-1">
                      + {item.skills.length - 3} more developmental skills
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 6th Card: Call to action */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1E4E8C] to-[#153763] text-white flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <span className="bg-[#D4A017] text-[#14263F] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Tailored Assessment
              </span>
              <h3 className="font-heading text-2xl font-bold text-white">
                Not sure where your child needs support?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Book an introductory diagnostic session with Mrs Sarah. We evaluate phonemic awareness, number sense, and pencil grip to craft a custom learning roadmap.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="#enquiry"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow shadow-amber-900/30"
              >
                <span>Request Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
