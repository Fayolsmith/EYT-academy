/**
 * Stock Photography Directory & Marketing Consent Registry
 *
 * NOTE ON CLIENT PRIVACY & MARKETING CONSENT:
 * In strict compliance with NDPA and privacy guidelines, no real client or student
 * photography is used without explicit marketing-use parental consent.
 *
 * All images documented here are licensed stock photography (Unsplash License —
 * free for commercial and non-commercial use, no permission required).
 *
 * SWAPPING PROTOCOL:
 * When marketing-use consent is obtained from real EYT Academy families,
 * replace the respective stock entry's `src` path with the authenticated photo asset.
 */

export interface StockImageConfig {
  id: string;
  section: 'about' | 'learning_options_online' | 'learning_options_home' | 'why_learn' | 'moments_gallery';
  title: string;
  alt: string;
  caption?: string;
  category?: string;
  src: string;
  unsplashId: string;
  unsplashUrl: string;
  photographer: string;
  license: string;
  replacementNote: string;
  aspectRatio: string;
  width: number;
  height: number;
}

export const STOCK_IMAGERY = {
  // 1. About Mrs Sarah Section
  aboutTutorChild: {
    id: 'about-tutor-reading',
    section: 'about',
    title: 'Nurturing One-on-One Guided Reading',
    alt: 'Dedicated early years educator reading and guiding a young child through an illustrated book',
    caption: 'Patient, one-on-one phonetic guidance and story discovery',
    src: '/images/stock/about-tutor-reading.jpg',
    unsplashId: 'photo-1577896851231-70ef18881754',
    unsplashUrl: 'https://unsplash.com/photos/photo-1577896851231-70ef18881754',
    photographer: 'CDC / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '9/7',
    width: 900,
    height: 700,
  },

  // 2. Learning Options - Online Tutorial Card
  onlineTutorialChild: {
    id: 'online-tutorial-session',
    section: 'learning_options_online',
    title: 'Focused Online Interactive Lesson',
    alt: 'Young learner sitting at home desk actively participating in a live online tutorial session via laptop',
    caption: 'Interactive digital sessions from anywhere in the world',
    src: '/images/stock/online-tutorial-session.jpg',
    unsplashId: 'photo-1588072432836-e10032774350',
    unsplashUrl: 'https://unsplash.com/photos/photo-1588072432836-e10032774350',
    photographer: 'Annie Spratt / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '16/10',
    width: 800,
    height: 500,
  },

  // 3. Learning Options - Home Tutorial Card
  homeTutorialChild: {
    id: 'home-tutorial-hands-on',
    section: 'learning_options_home',
    title: 'Tactile Home Tutoring with Physical Manipulatives',
    alt: 'Tutor and young student working together at a home table with handwriting and tactile materials',
    caption: 'Hands-on Montessori apparatus brought directly to your home',
    src: '/images/stock/home-tutorial-hands-on.jpg',
    unsplashId: 'photo-1576267423445-b2e0074d68a4',
    unsplashUrl: 'https://unsplash.com/photos/photo-1576267423445-b2e0074d68a4',
    photographer: 'CDC / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '16/10',
    width: 800,
    height: 500,
  },

  // 4. Why Learn With Me - Supporting Image 1 (Sensory Montessori Apparatus)
  whyLearnSensory: {
    id: 'why-learn-montessori-apparatus',
    section: 'why_learn',
    title: 'Hands-On Montessori Sensory Manipulatives',
    alt: 'Young child arranging wooden Montessori puzzle and geometrical sensorial materials on a work table',
    caption: 'Concrete-to-abstract learning with tactile apparatus',
    src: '/images/stock/montessori-wooden-manipulatives.jpg',
    unsplashId: 'photo-1587654780291-39c9404d746b',
    unsplashUrl: 'https://unsplash.com/photos/photo-1587654780291-39c9404d746b',
    photographer: 'Sigmund / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '4/3',
    width: 800,
    height: 600,
  },

  // 5. Why Learn With Me - Supporting Image 2 (Focused Numeracy & Fine Motor)
  whyLearnNumeracy: {
    id: 'why-learn-focused-writing',
    section: 'why_learn',
    title: 'Child Developing Number Sense & Fine Motor Grip',
    alt: 'Young learner deeply focused on developing fine motor pencil grip and early numeracy exercises',
    caption: 'Tailored pacing meeting each child right where they are',
    src: '/images/stock/child-writing-numeracy.jpg',
    unsplashId: 'photo-1503676260728-1c00da094a0b',
    unsplashUrl: 'https://unsplash.com/photos/photo-1503676260728-1c00da094a0b',
    photographer: 'Santi Vedrí / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '4/3',
    width: 800,
    height: 600,
  },

  // 6. Dedicated Gallery Moments (Set of 6 Warm Stock Images)
  galleryTactileBlocks: {
    id: 'gallery-tactile-blocks',
    section: 'moments_gallery',
    title: 'Montessori Sensorial Math',
    alt: 'Child exploring numbers and spatial reasoning with colorful Montessori counting blocks',
    caption: 'Grasping foundational numeracy through self-correcting play',
    category: 'Sensorial Math',
    src: '/images/stock/gallery-tactile-blocks.jpg',
    unsplashId: 'photo-1596495578065-6e0763fa1178',
    unsplashUrl: 'https://unsplash.com/photos/photo-1596495578065-6e0763fa1178',
    photographer: 'Gautam Arora / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '1/1',
    width: 700,
    height: 700,
  },

  galleryDeepFocus: {
    id: 'gallery-deep-focus',
    section: 'moments_gallery',
    title: 'Deep Concentration & Autonomy',
    alt: 'Young student working independently at a learning desk with total concentration',
    caption: 'Building sustained attention and independent problem-solving',
    category: 'Deep Focus',
    src: '/images/stock/gallery-deep-focus.jpg',
    unsplashId: 'photo-1580582932707-520aed937b7b',
    unsplashUrl: 'https://unsplash.com/photos/photo-1580582932707-520aed937b7b',
    photographer: 'CDC / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '1/1',
    width: 700,
    height: 700,
  },

  galleryEducatorGuidance: {
    id: 'gallery-educator-guidance',
    section: 'moments_gallery',
    title: 'Warm, Empathetic 1-on-1 Guidance',
    alt: 'Caring educator leaning in warmly to scaffold and encourage a young learner',
    caption: 'Individualized coaching celebrating every small breakthrough',
    category: 'Warm Guidance',
    src: '/images/stock/gallery-educator-guidance.jpg',
    unsplashId: 'photo-1509062522246-3755977927d7',
    unsplashUrl: 'https://unsplash.com/photos/photo-1509062522246-3755977927d7',
    photographer: 'National Cancer Institute / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '1/1',
    width: 700,
    height: 700,
  },

  galleryJoyfulBuilding: {
    id: 'gallery-joyful-building',
    section: 'moments_gallery',
    title: 'Joyful Home Learning Routine',
    alt: 'Happy child playing and building with wooden Montessori architectural pieces in a home environment',
    caption: 'Safe, low-stress environments where confidence flourishes',
    category: 'Home Nook',
    src: '/images/stock/gallery-joyful-building.jpg',
    unsplashId: 'photo-1516627145497-ae6968895b74',
    unsplashUrl: 'https://unsplash.com/photos/photo-1516627145497-ae6968895b74',
    photographer: 'Tatiana Syrikova / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '1/1',
    width: 700,
    height: 700,
  },

  galleryOnlineLearner: {
    id: 'gallery-online-learner',
    section: 'moments_gallery',
    title: 'Engaging Virtual Tutorials',
    alt: 'Young student engaged with an interactive digital lesson using headphones and screen',
    caption: 'Real-time interactive lessons connecting learners across timezones',
    category: 'Online Classroom',
    src: '/images/stock/gallery-online-learner.jpg',
    unsplashId: 'photo-1581078426770-6d336e5de7bf',
    unsplashUrl: 'https://unsplash.com/photos/photo-1581078426770-6d336e5de7bf',
    photographer: 'Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '1/1',
    width: 700,
    height: 700,
  },

  galleryReadingFluency: {
    id: 'gallery-reading-fluency',
    section: 'moments_gallery',
    title: 'Reading Fluency & Phonics Joy',
    alt: 'Smiling child with an open book proud of their early reading milestone',
    caption: 'From letter sounds to fluent, confident sentence blending',
    category: 'Phonics Fluency',
    src: '/images/stock/gallery-reading-fluency.jpg',
    unsplashId: 'photo-1544717305-2782549b5136',
    unsplashUrl: 'https://unsplash.com/photos/photo-1544717305-2782549b5136',
    photographer: 'Ben White / Unsplash',
    license: 'Unsplash License (Free commercial use)',
    replacementNote: 'Stock photo — replace with real client photo once marketing consent is obtained',
    aspectRatio: '1/1',
    width: 700,
    height: 700,
  },
} as const;

/**
 * Returns all moments gallery images for display in the dedicated showcase.
 */
export function getGalleryMoments(): StockImageConfig[] {
  return [
    STOCK_IMAGERY.galleryTactileBlocks,
    STOCK_IMAGERY.galleryDeepFocus,
    STOCK_IMAGERY.galleryEducatorGuidance,
    STOCK_IMAGERY.galleryJoyfulBuilding,
    STOCK_IMAGERY.galleryOnlineLearner,
    STOCK_IMAGERY.galleryReadingFluency,
  ];
}
