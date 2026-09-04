'use client';

import React from 'react';
import { Star, Quote, Heart } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Mrs Elizabeth Adeleke',
      child: 'Leo (Age 5, Nursery 2)',
      text: 'Mrs Sarah transformed Leo’s confidence with reading. Within just 6 weeks of her phonics sessions, he went from guessing words to effortlessly blending 3-letter words. Her patience and Montessori sensory cards made all the difference!',
      highlight: 'Blended 3-letter words in 6 weeks',
      rating: 5,
    },
    {
      name: 'Dr Kemi Ogunleye',
      child: 'Tobi (Age 4, Preschool)',
      text: 'Finding a tutor who understands SEN-inclusive methods was a blessing for our family. Mrs Sarah never rushes him; she adapts each lesson to his focus levels. Tobi actually looks forward to tutorial days now!',
      highlight: 'SEN-inclusive & incredibly patient',
      rating: 5,
    },
    {
      name: 'Mr Chukwuma Eze',
      child: 'Chisom (Age 6, Primary 1)',
      text: 'The online sessions are so engaging and interactive. We receive clear session notes after every single tutorial, and the milestone tracker on the portal keeps us informed on every skill she achieves.',
      highlight: 'Interactive online tutorials & clear progress notes',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Family Experiences
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E4E8C]">
            WHAT PARENTS SAY
          </h2>
          <p className="text-base sm:text-lg text-[#6B7280]">
            Hear from families who have seen their children flourish under Mrs Sarah’s nurturing guidance.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#D4A017] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Star rating */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4A017] fill-[#D4A017]" />
                  ))}
                </div>

                {/* Highlight badge */}
                <div className="inline-block bg-[#E8F0FA] text-[#1E4E8C] text-xs font-bold px-2.5 py-1 rounded-md">
                  “{t.highlight}”
                </div>

                {/* Review body */}
                <p className="text-xs sm:text-sm text-[#14263F]/85 leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#1E4E8C]">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] font-medium">
                    Parent of {t.child}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FCFBF7] border border-amber-200 flex items-center justify-center text-[#D4A017]">
                  <Quote className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
