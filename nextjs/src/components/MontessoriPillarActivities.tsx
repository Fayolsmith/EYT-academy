'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  BookOpen,
  Calculator,
  Smile,
  Globe,
  Palette,
  Star,
  PartyPopper,
  Trophy,
  Sparkles,
  Check,
  Moon,
  Apple,
  Trees,
  Bird,
  Car,
  Dog,
  Cat,
  Ship,
  Plane,
  Home,
  Bath,
  Droplets,
  Sprout,
  Sun,
  Box,
  Layers,
  Square,
  Pencil,
  Backpack,
  Armchair,
  Waves,
  Snowflake,
  Fish,
  Bug,
  Leaf,
  Circle,
  Triangle,
  Diamond,
  Flower2,
  TreePine,
  Banana,
  Rabbit,
  Squirrel,
  Turtle,
  Snail,
} from 'lucide-react';
import { LearningPillar } from '@/lib/adaptive-tutor';
import DailyCompletionEndScreen from '@/components/child-mode/DailyCompletionEndScreen';

export const PILLAR_SEQUENCE: LearningPillar[] = [
  'numeracy',
  'phonics',
  'practical_life',
  'cultural',
  'arts',
];

function playPillarFanfare() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const playNote = (freq: number, startDelay: number, dur: number) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + dur);
        } catch {}
      }, startDelay);
    };

    playNote(523.25, 0, 0.25); // C5
    playNote(659.25, 120, 0.25); // E5
    playNote(783.99, 240, 0.3); // G5
    playNote(1046.5, 380, 0.45); // C6
    playNote(1318.5, 520, 0.65); // E6
  } catch {}
}

export interface PillarConfig {
  id: LearningPillar;
  title: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  ageRange: string;
  headline: string;
  tagline: string;
}

export const MONTESSORI_PILLARS: PillarConfig[] = [
  {
    id: 'numeracy',
    title: 'Numeracy & Mathematics',
    shortLabel: 'Numeracy',
    icon: Calculator,
    ageRange: 'Ages 3–8',
    headline: 'Concrete Quantities Before Abstract Symbols',
    tagline: 'Children count and manipulate physical golden beads before ever touching written numerals.',
  },
  {
    id: 'phonics',
    title: 'Phonics & Early Literacy',
    shortLabel: 'Phonics & Literacy',
    icon: BookOpen,
    ageRange: 'Ages 3–7',
    headline: 'Letter Sounds Through Tactile Exploration',
    tagline: 'Tracing sandpaper letters and matching initial phonemes builds confident, joyful readers.',
  },
  {
    id: 'practical_life',
    title: 'Practical Life Skills',
    shortLabel: 'Practical Life',
    icon: Smile,
    ageRange: 'Ages 3–6',
    headline: 'Order, Coordination & Genuine Independence',
    tagline: 'Sequencing purposeful routines develops deep concentration, fine-motor dexterity, and calm confidence.',
  },
  {
    id: 'cultural',
    title: 'Cultural & General Knowledge',
    shortLabel: 'Cultural & Nature',
    icon: Globe,
    ageRange: 'Ages 4–8',
    headline: 'Wonder & Scientific Classification',
    tagline: 'Discovering living vs non-living elements and natural habitats fosters curiosity and respect for the world.',
  },
  {
    id: 'arts',
    title: 'Creative & Expressive Arts',
    shortLabel: 'Creative Arts',
    icon: Palette,
    ageRange: 'Ages 3–8',
    headline: 'Refining Visual & Sensorial Perception',
    tagline: 'Completing repeating visual patterns and exploring harmonies sharpens visual discrimination and artistic joy.',
  },
];

// =========================================================================
// 1. NUMERACY: Target Variations (1–5)
// =========================================================================
export const NUMERACY_VARIATIONS = [
  { target: 3, word: 'Three' },
  { target: 5, word: 'Five' },
  { target: 2, word: 'Two' },
  { target: 4, word: 'Four' },
  { target: 1, word: 'One' },
];

// =========================================================================
// 2. PHONICS: Letter-to-Picture Starting Sound Matching Variations
// =========================================================================
export interface PhonicsChoice {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  sound: string;
  isCorrect: boolean;
}

export interface PhonicsVariation {
  letter: string;
  sound: string;
  phonetic: string;
  prompt: string;
  choices: PhonicsChoice[];
  successMessage: string;
}

export const PHONICS_VARIATIONS: PhonicsVariation[] = [
  {
    letter: 'S',
    sound: 's',
    phonetic: '/s/ as in Sun',
    prompt: 'Which picture starts with the /s/ sound?',
    choices: [
      { id: 'sun', name: 'Sun', icon: Sun, sound: 's', isCorrect: true },
      { id: 'cat', name: 'Cat', icon: Cat, sound: 'k', isCorrect: false },
      { id: 'fish', name: 'Fish', icon: Fish, sound: 'f', isCorrect: false },
      { id: 'moon', name: 'Moon', icon: Moon, sound: 'm', isCorrect: false },
    ],
    successMessage: "Yes! 'S' is for Sun! /s/ - Sun!",
  },
  {
    letter: 'M',
    sound: 'm',
    phonetic: '/m/ as in Moon',
    prompt: 'Which picture starts with the /m/ sound?',
    choices: [
      { id: 'apple', name: 'Apple', icon: Apple, sound: 'æ', isCorrect: false },
      { id: 'moon', name: 'Moon', icon: Moon, sound: 'm', isCorrect: true },
      { id: 'tree', name: 'Tree', icon: Trees, sound: 't', isCorrect: false },
      { id: 'bird', name: 'Bird', icon: Bird, sound: 'b', isCorrect: false },
    ],
    successMessage: "Splendid! 'M' is for Moon! /m/ - Moon!",
  },
  {
    letter: 'A',
    sound: 'a',
    phonetic: '/æ/ as in Apple',
    prompt: 'Which picture starts with the /æ/ sound?',
    choices: [
      { id: 'car', name: 'Car', icon: Car, sound: 'k', isCorrect: false },
      { id: 'dog', name: 'Dog', icon: Dog, sound: 'd', isCorrect: false },
      { id: 'apple', name: 'Apple', icon: Apple, sound: 'æ', isCorrect: true },
      { id: 'star', name: 'Star', icon: Star, sound: 's', isCorrect: false },
    ],
    successMessage: "Terrific! 'A' is for Apple! /æ/ - Apple!",
  },
  {
    letter: 'T',
    sound: 't',
    phonetic: '/t/ as in Tree',
    prompt: 'Which picture starts with the /t/ sound?',
    choices: [
      { id: 'tree', name: 'Tree', icon: Trees, sound: 't', isCorrect: true },
      { id: 'banana', name: 'Banana', icon: Banana, sound: 'b', isCorrect: false },
      { id: 'bug', name: 'Bug', icon: Bug, sound: 'b', isCorrect: false },
      { id: 'cat', name: 'Cat', icon: Cat, sound: 'k', isCorrect: false },
    ],
    successMessage: "Wonderful! 'T' is for Tree! /t/ - Tree!",
  },
  {
    letter: 'B',
    sound: 'b',
    phonetic: '/b/ as in Boat',
    prompt: 'Which picture starts with the /b/ sound?',
    choices: [
      { id: 'boat', name: 'Boat', icon: Ship, sound: 'b', isCorrect: true },
      { id: 'plane', name: 'Plane', icon: Plane, sound: 'p', isCorrect: false },
      { id: 'house', name: 'House', icon: Home, sound: 'h', isCorrect: false },
      { id: 'sun', name: 'Sun', icon: Sun, sound: 's', isCorrect: false },
    ],
    successMessage: "Brilliant! 'B' is for Boat! /b/ - Boat!",
  },
];

// Backwards-compatible export
export const PHONICS_ITEMS = PHONICS_VARIATIONS.map((v) => ({
  word: v.choices.find((c) => c.isCorrect)?.name.toUpperCase() || 'WORD',
  sound: v.sound,
  icon: v.choices.find((c) => c.isCorrect)?.icon || Sun,
  phonetic: v.phonetic,
  choices: v.choices.map((c) => c.sound),
}));

// =========================================================================
// 3. PRACTICAL LIFE: Sequencing & Routine Ordering Variations
// =========================================================================
export interface PracticalStep {
  id: string;
  order: number; // 1, 2, 3
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PracticalLifeVariation {
  title: string;
  objective: string;
  steps: PracticalStep[];
  successMessage: string;
}

export const PRACTICAL_LIFE_VARIATIONS: PracticalLifeVariation[] = [
  {
    title: 'Snack Preparation Routine',
    objective: 'Arrange the 3 steps in order to prepare a healthy snack:',
    steps: [
      { id: 'snack-1', order: 1, text: '1. Wash hands gently with warm water & soap', icon: Bath },
      { id: 'snack-2', order: 2, text: '2. Carefully peel and slice fresh fruit with safe cutlery', icon: Apple },
      { id: 'snack-3', order: 3, text: '3. Set the place mat and tidy up the learning workspace', icon: Sparkles },
    ],
    successMessage: 'Wonderful! Washing hands first, slicing carefully second, and packing away creates calm independence!',
  },
  {
    title: 'Planting a Sunflower Seed',
    objective: 'Arrange the 3 steps to plant and care for a garden sunflower:',
    steps: [
      { id: 'plant-1', order: 1, text: '1. Scoop rich soil into the small pot and plant the seed', icon: Sprout },
      { id: 'plant-2', order: 2, text: '2. Gently sprinkle water and place the pot in warm sunlight', icon: Droplets },
      { id: 'plant-3', order: 3, text: '3. Watch the green sprout grow into a bright sunflower', icon: Sun },
    ],
    successMessage: 'Great gardening care! Seeds need soil, water, and warm sunlight to bloom!',
  },
  {
    title: 'Montessori Pink Tower Stacking',
    objective: 'Arrange the 3 wooden cubes in order from largest base to smallest peak:',
    steps: [
      { id: 'tower-1', order: 1, text: '1. Place the heaviest, largest base cube firmly on the work mat', icon: Box },
      { id: 'tower-2', order: 2, text: '2. Center the medium pink cube carefully on top', icon: Layers },
      { id: 'tower-3', order: 3, text: '3. Balance the tiny, smallest top cube right on the peak', icon: Square },
    ],
    successMessage: 'Steady hands! Stacking from largest to smallest builds architectural harmony and fine motor control!',
  },
  {
    title: 'Packing Away the Learning Workspace',
    objective: 'Arrange the 3 steps to pack away your table after tutorial work:',
    steps: [
      { id: 'tidy-1', order: 1, text: '1. Close your workbook and place pencils back in their tin', icon: Pencil },
      { id: 'tidy-2', order: 2, text: '2. Slide all materials safely inside your school satchel', icon: Backpack },
      { id: 'tidy-3', order: 3, text: '3. Gently tuck your chair under the table ready for next time', icon: Armchair },
    ],
    successMessage: 'Thoughtful habit! A neat, tidy workspace makes returning to learn joyful and calm!',
  },
];

// Backwards-compatible export
export const PRACTICAL_STEPS = PRACTICAL_LIFE_VARIATIONS[0].steps;

// =========================================================================
// 4. CULTURAL & GENERAL KNOWLEDGE: Animal to Habitat Category Matching
// =========================================================================
export interface HabitatChoice {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  isCorrect: boolean;
}

export interface CulturalVariation {
  habitat: string;
  habitatIcon: React.ComponentType<{ className?: string }>;
  habitatTitle: string;
  prompt: string;
  fact: string;
  choices: HabitatChoice[];
  successMessage: string;
}

export const CULTURAL_VARIATIONS: CulturalVariation[] = [
  {
    habitat: 'ocean',
    habitatIcon: Waves,
    habitatTitle: 'Deep Blue Ocean',
    prompt: 'Which animal lives and swims in the Deep Ocean?',
    fact: 'Oceans cover more than 70% of our Earth and are full of coral reefs and marine life.',
    choices: [
      { id: 'fish', name: 'Ocean Fish', icon: Fish, isCorrect: true },
      { id: 'squirrel', name: 'Forest Squirrel', icon: Squirrel, isCorrect: false },
      { id: 'rabbit', name: 'Meadow Rabbit', icon: Rabbit, isCorrect: false },
      { id: 'snail', name: 'Garden Snail', icon: Snail, isCorrect: false },
    ],
    successMessage: 'Spot on! Ocean fish breathe air through gills and swim gracefully in the ocean waves!',
  },
  {
    habitat: 'arctic',
    habitatIcon: Snowflake,
    habitatTitle: 'Freezing Arctic Ice',
    prompt: 'Which creature thrives in the freezing Arctic snow and ice?',
    fact: 'The Arctic is cold and windy. Animals there have thick fur or feathers to stay warm.',
    choices: [
      { id: 'turtle', name: 'Sea Turtle', icon: Turtle, isCorrect: false },
      { id: 'arctic_rabbit', name: 'Snow Hare', icon: Rabbit, isCorrect: true },
      { id: 'snail', name: 'Garden Snail', icon: Snail, isCorrect: false },
      { id: 'squirrel', name: 'Forest Squirrel', icon: Squirrel, isCorrect: false },
    ],
    successMessage: 'Excellent! Snow hares have dense, warm white fur to camouflage and stay warm on the ice!',
  },
  {
    habitat: 'jungle',
    habitatIcon: Trees,
    habitatTitle: 'Lush Green Forest Canopy',
    prompt: 'Which animal scampers and climbs high in the forest trees?',
    fact: 'Forests are rich with tall green trees, acorns, and climbing woodland creatures.',
    choices: [
      { id: 'squirrel', name: 'Tree Squirrel', icon: Squirrel, isCorrect: true },
      { id: 'fish', name: 'Ocean Fish', icon: Fish, isCorrect: false },
      { id: 'turtle', name: 'Pond Turtle', icon: Turtle, isCorrect: false },
      { id: 'snail', name: 'Garden Snail', icon: Snail, isCorrect: false },
    ],
    successMessage: 'Terrific! Squirrels have agile paws and bushy tails to leap through the leafy tree canopy!',
  },
  {
    habitat: 'garden',
    habitatIcon: Sun,
    habitatTitle: 'Sunny Garden Grass',
    prompt: 'Which gentle creature carries its shell across the sunny garden grass?',
    fact: 'Gardens are filled with fresh leaves, soft soil, and tiny crawling creatures.',
    choices: [
      { id: 'bird', name: 'Garden Bird', icon: Bird, isCorrect: false },
      { id: 'snail', name: 'Garden Snail', icon: Snail, isCorrect: true },
      { id: 'fish', name: 'Goldfish', icon: Fish, isCorrect: false },
      { id: 'squirrel', name: 'Tree Squirrel', icon: Squirrel, isCorrect: false },
    ],
    successMessage: 'Brilliant! Snails carry their spiral homes and glide smoothly across garden leaves!',
  },
];

// Backwards-compatible export
export const CULTURAL_ITEMS = [
  { id: 'item-plant', name: 'Fresh Fern Plant', icon: Leaf, type: 'living' },
  { id: 'item-butterfly', name: 'Garden Butterfly', icon: Bug, type: 'living' },
  { id: 'item-stone', name: 'Smooth River Stone', icon: Circle, type: 'non_living' },
  { id: 'item-wood', name: 'Wooden Building Block', icon: Box, type: 'non_living' },
];

// =========================================================================
// 5. CREATIVE & EXPRESSIVE ARTS: Repeating Visual Pattern Matching
// =========================================================================
export type PatternShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'blossom' | 'leaf' | 'tree';

export interface PatternItem {
  id: string;
  name: string;
  shape: PatternShape;
  colorHex: string;
  isCorrect?: boolean;
}

export function renderPatternGlyph(item: PatternItem, iconClass = 'w-7 h-7 sm:w-8 sm:h-8') {
  switch (item.shape) {
    case 'circle':
      return (
        <div
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-xs border-2 border-white/80"
          style={{ backgroundColor: item.colorHex }}
        />
      );
    case 'square':
      return (
        <div
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-md shadow-xs border-2 border-white/80"
          style={{ backgroundColor: item.colorHex }}
        />
      );
    case 'triangle':
      return <Triangle className={iconClass} style={{ color: item.colorHex, fill: item.colorHex }} />;
    case 'diamond':
      return <Diamond className={iconClass} style={{ color: item.colorHex, fill: item.colorHex }} />;
    case 'star':
      return <Star className={iconClass} style={{ color: item.colorHex, fill: item.colorHex }} />;
    case 'blossom':
      return <Flower2 className={iconClass} style={{ color: item.colorHex, fill: item.colorHex }} />;
    case 'leaf':
      return <Leaf className={iconClass} style={{ color: item.colorHex, fill: item.colorHex }} />;
    case 'tree':
      return <TreePine className={iconClass} style={{ color: item.colorHex, fill: item.colorHex }} />;
    default:
      return <Circle className={iconClass} style={{ color: item.colorHex, fill: item.colorHex }} />;
  }
}

export interface ArtsVariation {
  title: string;
  description: string;
  sequence: PatternItem[]; // Length e.g. 5
  missingItem: PatternItem;
  choices: PatternItem[];
  successMessage: string;
}

export const ARTS_VARIATIONS: ArtsVariation[] = [
  {
    title: 'Gold & Royal Blue Bead Pattern',
    description: 'Notice the repeating two-color rhythm and pick the missing bead:',
    sequence: [
      { id: 'y1', name: 'Golden Bead', shape: 'circle', colorHex: '#D4A017' },
      { id: 'b1', name: 'Royal Blue Bead', shape: 'circle', colorHex: '#1E4E8C' },
      { id: 'y2', name: 'Golden Bead', shape: 'circle', colorHex: '#D4A017' },
      { id: 'b2', name: 'Royal Blue Bead', shape: 'circle', colorHex: '#1E4E8C' },
      { id: 'y3', name: 'Golden Bead', shape: 'circle', colorHex: '#D4A017' },
    ],
    missingItem: { id: 'b3', name: 'Royal Blue Bead', shape: 'circle', colorHex: '#1E4E8C', isCorrect: true },
    choices: [
      { id: 'opt-blue', name: 'Royal Blue Bead', shape: 'circle', colorHex: '#1E4E8C', isCorrect: true },
      { id: 'opt-yellow', name: 'Golden Yellow Bead', shape: 'circle', colorHex: '#D4A017', isCorrect: false },
      { id: 'opt-red', name: 'Crimson Red Bead', shape: 'circle', colorHex: '#E11D48', isCorrect: false },
      { id: 'opt-green', name: 'Emerald Green Bead', shape: 'circle', colorHex: '#059669', isCorrect: false },
    ],
    successMessage: 'Pattern completed! Yellow, Blue, Yellow, Blue, Yellow, Blue!',
  },
  {
    title: 'Blossom & Leaf Garden Pattern',
    description: 'Find the natural symbol that completes this alternating sequence:',
    sequence: [
      { id: 'f1', name: 'Blossom', shape: 'blossom', colorHex: '#EC4899' },
      { id: 'l1', name: 'Leaf', shape: 'leaf', colorHex: '#10B981' },
      { id: 'f2', name: 'Blossom', shape: 'blossom', colorHex: '#EC4899' },
      { id: 'l2', name: 'Leaf', shape: 'leaf', colorHex: '#10B981' },
      { id: 'f3', name: 'Blossom', shape: 'blossom', colorHex: '#EC4899' },
    ],
    missingItem: { id: 'l3', name: 'Green Leaf', shape: 'leaf', colorHex: '#10B981', isCorrect: true },
    choices: [
      { id: 'opt-leaf', name: 'Fresh Green Leaf', shape: 'leaf', colorHex: '#10B981', isCorrect: true },
      { id: 'opt-flower', name: 'Pink Blossom', shape: 'blossom', colorHex: '#EC4899', isCorrect: false },
      { id: 'opt-tree', name: 'Pine Tree', shape: 'tree', colorHex: '#047857', isCorrect: false },
      { id: 'opt-star', name: 'Golden Star', shape: 'star', colorHex: '#D4A017', isCorrect: false },
    ],
    successMessage: 'Nature rhythm solved! Blossom, Leaf, Blossom, Leaf, Blossom, Leaf!',
  },
  {
    title: 'Primary Color Rhythm (AAB AAB)',
    description: 'Look carefully at the grouping of colors and fill in the missing tablet:',
    sequence: [
      { id: 'r1', name: 'Crimson Tablet', shape: 'square', colorHex: '#E11D48' },
      { id: 'r2', name: 'Crimson Tablet', shape: 'square', colorHex: '#E11D48' },
      { id: 'y1', name: 'Golden Tablet', shape: 'square', colorHex: '#D4A017' },
      { id: 'r3', name: 'Crimson Tablet', shape: 'square', colorHex: '#E11D48' },
      { id: 'r4', name: 'Crimson Tablet', shape: 'square', colorHex: '#E11D48' },
    ],
    missingItem: { id: 'y2', name: 'Golden Tablet', shape: 'square', colorHex: '#D4A017', isCorrect: true },
    choices: [
      { id: 'opt-yellow', name: 'Golden Tablet', shape: 'square', colorHex: '#D4A017', isCorrect: true },
      { id: 'opt-red', name: 'Crimson Tablet', shape: 'square', colorHex: '#E11D48', isCorrect: false },
      { id: 'opt-blue', name: 'Navy Tablet', shape: 'square', colorHex: '#1E4E8C', isCorrect: false },
      { id: 'opt-purple', name: 'Violet Tablet', shape: 'square', colorHex: '#7C3AED', isCorrect: false },
    ],
    successMessage: 'Great musical rhythm! Red, Red, Yellow &bull; Red, Red, Yellow!',
  },
  {
    title: 'Sensorial Shapes Sequence',
    description: 'Discriminate between geometric forms to complete the sequence:',
    sequence: [
      { id: 't1', name: 'Red Triangle', shape: 'triangle', colorHex: '#EF4444' },
      { id: 'd1', name: 'Blue Diamond', shape: 'diamond', colorHex: '#3B82F6' },
      { id: 't2', name: 'Red Triangle', shape: 'triangle', colorHex: '#EF4444' },
      { id: 'd2', name: 'Blue Diamond', shape: 'diamond', colorHex: '#3B82F6' },
      { id: 't3', name: 'Red Triangle', shape: 'triangle', colorHex: '#EF4444' },
    ],
    missingItem: { id: 'd3', name: 'Blue Diamond', shape: 'diamond', colorHex: '#3B82F6', isCorrect: true },
    choices: [
      { id: 'opt-diamond', name: 'Blue Diamond', shape: 'diamond', colorHex: '#3B82F6', isCorrect: true },
      { id: 'opt-triangle', name: 'Red Triangle', shape: 'triangle', colorHex: '#EF4444', isCorrect: false },
      { id: 'opt-circle', name: 'Green Circle', shape: 'circle', colorHex: '#10B981', isCorrect: false },
      { id: 'opt-star', name: 'Golden Star', shape: 'star', colorHex: '#D4A017', isCorrect: false },
    ],
    successMessage: 'Sharp geometric perception! Triangle, Diamond, Triangle, Diamond!',
  },
];

// Backwards-compatible export
export const ARTS_SWATCHES = [
  { id: 'powder', name: 'Powder Sky Blue', hex: '#93C5FD', isTarget: false },
  { id: 'cobalt', name: 'Montessori Royal Blue', hex: '#1E4E8C', isTarget: true },
  { id: 'navy', name: 'Deep Midnight Navy', hex: '#0B192C', isTarget: false },
  { id: 'ochre', name: 'Warm Golden Ochre', hex: '#D4A017', isTarget: false },
];

export interface MontessoriPillarActivitiesProps {
  activePillar?: LearningPillar;
  onPillarChange?: (pillar: LearningPillar) => void;
  isChildMode?: boolean;
  childId?: string;
  childName?: string;
  onCompleteActivity?: (pillar: LearningPillar) => void;
  onCompletePillar?: (pillar: LearningPillar, nextPillar: LearningPillar | null) => void;
  onAllCompletedToday?: () => void;
  completedPillars?: LearningPillar[];
  isDailyCompleted?: boolean;
  onViewTrophies?: () => void;
  onViewHomework?: () => void;
  onOpenGate?: () => void;
  onResetToday?: () => void;
  onPlayAlphabetArt?: () => void;
}

interface PillarAwardState {
  pillar: LearningPillar;
  title: string;
  nextPillar: LearningPillar | null;
  nextPillarTitle: string | null;
}

export default function MontessoriPillarActivities({
  activePillar: externalPillar,
  onPillarChange,
  isChildMode = false,
  childName = 'Superstar',
  onCompleteActivity,
  onCompletePillar,
  onAllCompletedToday,
  completedPillars = [],
  isDailyCompleted = false,
  onViewTrophies,
  onViewHomework,
  onOpenGate,
  onResetToday,
  onPlayAlphabetArt,
}: MontessoriPillarActivitiesProps) {
  const shouldReduceMotion = useReducedMotion();
  const [internalPillar, setInternalPillar] = useState<LearningPillar>('numeracy');
  const activePillar = externalPillar !== undefined ? externalPillar : internalPillar;

  // Track variation indices for all 5 pillars
  const [numeracyVarIdx, setNumeracyVarIdx] = useState(0);
  const [phonicsVarIdx, setPhonicsVarIdx] = useState(0);
  const [practicalVarIdx, setPracticalVarIdx] = useState(0);
  const [culturalVarIdx, setCulturalVarIdx] = useState(0);
  const [artsVarIdx, setArtsVarIdx] = useState(0);

  // Active answer / interaction states
  // 1. Numeracy
  const [currentBeads, setCurrentBeads] = useState<number>(0);
  // 2. Phonics
  const [selectedPhonicsChoiceId, setSelectedPhonicsChoiceId] = useState<string | null>(null);
  // 3. Practical Life
  const [tappedPracticalStepIds, setTappedPracticalStepIds] = useState<string[]>([]);
  // 4. Cultural
  const [selectedCulturalChoiceId, setSelectedCulturalChoiceId] = useState<string | null>(null);
  // 5. Arts
  const [selectedArtsChoiceId, setSelectedArtsChoiceId] = useState<string | null>(null);

  // Status flags & Pillar Award state
  const [isAdvancing, setIsAdvancing] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [pillarAward, setPillarAward] = useState<PillarAwardState | null>(null);
  const [countdown, setCountdown] = useState<number>(4);
  const pillarCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup auto-advance & countdown timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      if (pillarCountdownTimerRef.current) {
        clearInterval(pillarCountdownTimerRef.current);
      }
    };
  }, []);

  const handlePillarSelect = useCallback((pillar: LearningPillar) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    if (pillarCountdownTimerRef.current) {
      clearInterval(pillarCountdownTimerRef.current);
    }
    setIsAdvancing(false);
    setPillarAward(null);
    if (onPillarChange) {
      onPillarChange(pillar);
    } else {
      setInternalPillar(pillar);
    }
  }, [onPillarChange]);

  // Pillar Completion Trigger
  const triggerPillarCelebration = useCallback((pillar: LearningPillar) => {
    const currentIndex = PILLAR_SEQUENCE.indexOf(pillar);
    const nextPillar = currentIndex >= 0 && currentIndex < PILLAR_SEQUENCE.length - 1
      ? PILLAR_SEQUENCE[currentIndex + 1]
      : null;

    const currentConfig = MONTESSORI_PILLARS.find((p) => p.id === pillar);
    const nextConfig = nextPillar ? MONTESSORI_PILLARS.find((p) => p.id === nextPillar) : null;

    playPillarFanfare();

    setPillarAward({
      pillar,
      title: currentConfig?.shortLabel || pillar,
      nextPillar,
      nextPillarTitle: nextConfig?.shortLabel || null,
    });

    onCompletePillar?.(pillar, nextPillar);

    setCountdown(4);
    if (pillarCountdownTimerRef.current) {
      clearInterval(pillarCountdownTimerRef.current);
    }

    let remaining = 4;
    pillarCountdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (pillarCountdownTimerRef.current) {
          clearInterval(pillarCountdownTimerRef.current);
        }
        setPillarAward(null);
        if (nextPillar) {
          handlePillarSelect(nextPillar);
        } else {
          onAllCompletedToday?.();
        }
      }
    }, 1000);
  }, [onCompletePillar, onAllCompletedToday, handlePillarSelect]);

  const handleDismissPillarAward = useCallback(() => {
    if (pillarCountdownTimerRef.current) {
      clearInterval(pillarCountdownTimerRef.current);
    }
    if (pillarAward) {
      const { nextPillar } = pillarAward;
      setPillarAward(null);
      if (nextPillar) {
        handlePillarSelect(nextPillar);
      } else {
        onAllCompletedToday?.();
      }
    }
  }, [pillarAward, handlePillarSelect, onAllCompletedToday]);

  // Current Variation Objects
  const currentNumeracyVar = NUMERACY_VARIATIONS[numeracyVarIdx];
  const currentPhonicsVar = PHONICS_VARIATIONS[phonicsVarIdx];
  const currentPracticalVar = PRACTICAL_LIFE_VARIATIONS[practicalVarIdx];
  const currentCulturalVar = CULTURAL_VARIATIONS[culturalVarIdx];
  const currentArtsVar = ARTS_VARIATIONS[artsVarIdx];

  // Solved Condition Checks
  const isNumeracySolved = currentBeads === currentNumeracyVar.target && currentBeads > 0;
  const isPhonicsSolved = selectedPhonicsChoiceId === currentPhonicsVar.choices.find((c) => c.isCorrect)?.id;
  const isPracticalSolved =
    tappedPracticalStepIds.length === 3 &&
    tappedPracticalStepIds[0] === currentPracticalVar.steps[0].id &&
    tappedPracticalStepIds[1] === currentPracticalVar.steps[1].id &&
    tappedPracticalStepIds[2] === currentPracticalVar.steps[2].id;
  const isCulturalSolved = selectedCulturalChoiceId === currentCulturalVar.choices.find((c) => c.isCorrect)?.id;
  const isArtsSolved = selectedArtsChoiceId === currentArtsVar.choices.find((c) => c.isCorrect)?.id;

  // -------------------------------------------------------------------------
  // Automatic Progression Helper
  // -------------------------------------------------------------------------
  const scheduleAutoAdvance = useCallback((advanceFn: () => void) => {
    if (isAdvancing) return;
    setIsAdvancing(true);

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceFn();
      setIsAdvancing(false);
    }, 1500); // 1.5s celebration time before rotating
  }, [isAdvancing]);

  // Watch for Numeracy Solve
  useEffect(() => {
    if (activePillar === 'numeracy' && isNumeracySolved && !isAdvancing && !pillarAward) {
      onCompleteActivity?.('numeracy');
      if (numeracyVarIdx >= NUMERACY_VARIATIONS.length - 1) {
        setCurrentBeads(0);
        setNumeracyVarIdx(0);
        triggerPillarCelebration('numeracy');
      } else {
        scheduleAutoAdvance(() => {
          setNumeracyVarIdx((prev) => prev + 1);
          setCurrentBeads(0);
        });
      }
    }
  }, [activePillar, isNumeracySolved, isAdvancing, pillarAward, numeracyVarIdx, onCompleteActivity, scheduleAutoAdvance, triggerPillarCelebration]);

  // Watch for Phonics Solve
  useEffect(() => {
    if (activePillar === 'phonics' && isPhonicsSolved && !isAdvancing && !pillarAward) {
      onCompleteActivity?.('phonics');
      if (phonicsVarIdx >= PHONICS_VARIATIONS.length - 1) {
        setSelectedPhonicsChoiceId(null);
        setPhonicsVarIdx(0);
        triggerPillarCelebration('phonics');
      } else {
        scheduleAutoAdvance(() => {
          setPhonicsVarIdx((prev) => prev + 1);
          setSelectedPhonicsChoiceId(null);
        });
      }
    }
  }, [activePillar, isPhonicsSolved, isAdvancing, pillarAward, phonicsVarIdx, onCompleteActivity, scheduleAutoAdvance, triggerPillarCelebration]);

  // Watch for Practical Life Solve
  useEffect(() => {
    if (activePillar === 'practical_life' && isPracticalSolved && !isAdvancing && !pillarAward) {
      onCompleteActivity?.('practical_life');
      if (practicalVarIdx >= PRACTICAL_LIFE_VARIATIONS.length - 1) {
        setTappedPracticalStepIds([]);
        setPracticalVarIdx(0);
        triggerPillarCelebration('practical_life');
      } else {
        scheduleAutoAdvance(() => {
          setPracticalVarIdx((prev) => prev + 1);
          setTappedPracticalStepIds([]);
        });
      }
    }
  }, [activePillar, isPracticalSolved, isAdvancing, pillarAward, practicalVarIdx, onCompleteActivity, scheduleAutoAdvance, triggerPillarCelebration]);

  // Watch for Cultural Solve
  useEffect(() => {
    if (activePillar === 'cultural' && isCulturalSolved && !isAdvancing && !pillarAward) {
      onCompleteActivity?.('cultural');
      if (culturalVarIdx >= CULTURAL_VARIATIONS.length - 1) {
        setSelectedCulturalChoiceId(null);
        setCulturalVarIdx(0);
        triggerPillarCelebration('cultural');
      } else {
        scheduleAutoAdvance(() => {
          setCulturalVarIdx((prev) => prev + 1);
          setSelectedCulturalChoiceId(null);
        });
      }
    }
  }, [activePillar, isCulturalSolved, isAdvancing, pillarAward, culturalVarIdx, onCompleteActivity, scheduleAutoAdvance, triggerPillarCelebration]);

  // Watch for Arts Solve
  useEffect(() => {
    if (activePillar === 'arts' && isArtsSolved && !isAdvancing && !pillarAward) {
      onCompleteActivity?.('arts');
      if (artsVarIdx >= ARTS_VARIATIONS.length - 1) {
        setSelectedArtsChoiceId(null);
        setArtsVarIdx(0);
        triggerPillarCelebration('arts');
      } else {
        scheduleAutoAdvance(() => {
          setArtsVarIdx((prev) => prev + 1);
          setSelectedArtsChoiceId(null);
        });
      }
    }
  }, [activePillar, isArtsSolved, isAdvancing, pillarAward, artsVarIdx, onCompleteActivity, scheduleAutoAdvance, triggerPillarCelebration]);

  // -------------------------------------------------------------------------
  // Interaction Handlers
  // -------------------------------------------------------------------------
  const handleAddBead = () => {
    if (currentBeads < 5) setCurrentBeads((prev) => prev + 1);
  };

  const handleRemoveBead = () => {
    if (currentBeads > 0) setCurrentBeads((prev) => prev - 1);
  };

  const handleTogglePracticalStep = (stepId: string) => {
    if (tappedPracticalStepIds.includes(stepId)) {
      setTappedPracticalStepIds(tappedPracticalStepIds.filter((id) => id !== stepId));
    } else if (tappedPracticalStepIds.length < 3) {
      setTappedPracticalStepIds([...tappedPracticalStepIds, stepId]);
    }
  };

  const currentPillarConfig = MONTESSORI_PILLARS.find((p) => p.id === activePillar) || MONTESSORI_PILLARS[0];

  // Helper to render variation indicator pills
  const renderVariationIndicator = (currentIdx: number, total: number, onSelect: (idx: number) => void) => (
    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
      <span className="text-[10px] font-bold text-[#6B7280] px-1.5 hidden sm:inline">
        Challenge:
      </span>
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => {
            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
            setIsAdvancing(false);
            onSelect(idx);
          }}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            currentIdx === idx
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]'
          }`}
          title={`Challenge ${idx + 1} of ${total}`}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );

  if (isDailyCompleted) {
    return (
      <DailyCompletionEndScreen
        childName={childName}
        onViewTrophies={onViewTrophies || (() => {})}
        onViewHomework={onViewHomework || (() => {})}
        onOpenGate={onOpenGate || (() => {})}
        onResetToday={onResetToday}
        onPlayAlphabetArt={onPlayAlphabetArt}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 5-Pillar Tabs Navigation */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MONTESSORI_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          const isActive = activePillar === pillar.id;
          const isDoneToday = completedPillars?.includes(pillar.id);
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => handlePillarSelect(pillar.id)}
              className={`inline-flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isChildMode ? 'px-4 py-3 text-sm' : 'px-4 py-2.5 text-xs'
              } ${
                isActive
                  ? 'bg-[#1E4E8C] text-white shadow-md shadow-blue-900/20 ring-2 ring-[#D4A017]'
                  : 'bg-white text-[#14263F] border border-[#E5E0D8] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A017]' : 'text-[#6B7280]'}`} />
              <span>{pillar.shortLabel}</span>
              {isDoneToday && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 p-0.5 rounded-full font-extrabold border border-emerald-300 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Container */}
      <div className="bg-[#FCFBF7] border-2 border-[#D4A017]/25 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        
        {/* Pillar Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-[#F3E7C4]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#D4A017] uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                {currentPillarConfig.ageRange}
              </span>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#1E4E8C]">
                {currentPillarConfig.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#14263F] font-medium">
              {currentPillarConfig.headline}
            </p>
          </div>
          {!isChildMode && (
            <p className="text-xs text-[#6B7280] max-w-xs text-left sm:text-right hidden sm:block">
              {currentPillarConfig.tagline}
            </p>
          )}
        </div>

        {/* =================================================================== */}
        {/* PILLAR 1: NUMERACY (Golden Beads Tray Counting)                      */}
        {/* =================================================================== */}
        {activePillar === 'numeracy' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs font-bold text-[#14263F]">
                {isChildMode ? 'Place golden beads on the tray to match target:' : 'Count and match the target quantity:'}
              </div>
              {renderVariationIndicator(numeracyVarIdx, NUMERACY_VARIATIONS.length, (idx) => {
                setNumeracyVarIdx(idx);
                setCurrentBeads(0);
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Target Card */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-amber-200/80 shadow-xs text-center space-y-2">
                <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
                  Target Quantity
                </span>
                <div className="font-heading font-extrabold text-6xl text-[#1E4E8C] tracking-tight py-1">
                  {currentNumeracyVar.target}
                </div>
                <div className="text-sm font-bold text-[#14263F] uppercase tracking-wider">
                  {currentNumeracyVar.word}
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Place {currentNumeracyVar.target} golden beads on the wooden tray.
                </p>
              </div>

              {/* Tray & Manipulatives */}
              <div className="md:col-span-8 flex flex-col justify-between p-6 bg-[#FDFBF7] rounded-2xl border-2 border-dashed border-[#D4A017]/40 min-h-[200px] space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1E4E8C]">Wooden Tray ({currentBeads} beads)</span>
                  <button
                    type="button"
                    onClick={() => setCurrentBeads(0)}
                    className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear Tray
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 py-4 min-h-[70px]">
                  <AnimatePresence mode="popLayout">
                    {Array.from({ length: currentBeads }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 via-[#D4A017] to-amber-600 shadow-md flex items-center justify-center border-2 border-white/60 text-white font-extrabold text-sm"
                      >
                        {i + 1}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRemoveBead}
                    disabled={currentBeads === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#14263F] text-xs font-bold hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" /> Remove Bead
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBead}
                    disabled={currentBeads >= 5}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#D4A017]" /> Add Bead
                  </button>
                </div>
              </div>
            </div>

            {isNumeracySolved && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Super Counting, {childName}!</strong> Exactly {currentNumeracyVar.target} beads placed!
                  </div>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                  Next challenge loading...
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* PILLAR 2: PHONICS (Starting Sound Letter-to-Picture Matching)         */}
        {/* =================================================================== */}
        {activePillar === 'phonics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs font-bold text-[#14263F]">
                {currentPhonicsVar.prompt}
              </div>
              {renderVariationIndicator(phonicsVarIdx, PHONICS_VARIATIONS.length, (idx) => {
                setPhonicsVarIdx(idx);
                setSelectedPhonicsChoiceId(null);
              })}
            </div>

            {/* Sandpaper Card and Picture Choices */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Target Sandpaper Letter Card */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-[#FCFBF7] rounded-2xl border-2 border-[#D4A017] shadow-xs text-center space-y-2">
                <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
                  Target Sandpaper Letter
                </span>
                <div className="font-heading font-extrabold text-7xl text-[#1E4E8C] tracking-wide py-1 drop-shadow-xs">
                  {currentPhonicsVar.letter}
                </div>
                <div className="text-xs font-extrabold text-[#D4A017] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {currentPhonicsVar.phonetic}
                </div>
              </div>

              {/* 4 Picture Choice Cards */}
              <div className="md:col-span-8 grid grid-cols-2 gap-3 sm:gap-4">
                {currentPhonicsVar.choices.map((choice) => {
                  const isSelected = selectedPhonicsChoiceId === choice.id;
                  const isCorrect = choice.isCorrect;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setSelectedPhonicsChoiceId(choice.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 select-none ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300 scale-102'
                            : 'bg-rose-50 border-rose-400'
                          : 'bg-white border-gray-200 hover:border-[#D4A017]'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-[#1E4E8C] shadow-2xs">
                        <choice.icon className="w-8 h-8" />
                      </div>
                      <span className="font-heading font-extrabold text-sm sm:text-base text-[#1E4E8C]">
                        {choice.name}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        Starts with &ldquo;/{choice.sound}/&rdquo;
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPhonicsChoiceId && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  isPhonicsSolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPhonicsSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    {isPhonicsSolved ? (
                      <span><strong>Splendid, {childName}!</strong> {currentPhonicsVar.successMessage}</span>
                    ) : (
                      <span>Say the picture names aloud! Listen for the &ldquo;{currentPhonicsVar.phonetic}&rdquo; initial sound.</span>
                    )}
                  </div>
                </div>

                {isPhonicsSolved && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Next letter loading...
                  </span>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* PILLAR 3: PRACTICAL LIFE (Routine & Size Sequencing)                 */}
        {/* =================================================================== */}
        {activePillar === 'practical_life' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs font-bold text-[#14263F]">
                {currentPracticalVar.objective}
              </div>
              <div className="flex items-center gap-2">
                {renderVariationIndicator(practicalVarIdx, PRACTICAL_LIFE_VARIATIONS.length, (idx) => {
                  setPracticalVarIdx(idx);
                  setTappedPracticalStepIds([]);
                })}
                <button
                  type="button"
                  onClick={() => setTappedPracticalStepIds([])}
                  className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentPracticalVar.steps.map((step) => {
                const stepIndex = tappedPracticalStepIds.indexOf(step.id);
                const isSelected = stepIndex !== -1;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleTogglePracticalStep(step.id)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 select-none ${
                      isSelected
                        ? 'bg-[#E8F0FA] border-[#1E4E8C] shadow-xs'
                        : 'bg-white border-gray-200 hover:border-[#D4A017]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#1E4E8C] shadow-2xs">
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#1E4E8C] text-white'
                            : 'bg-gray-100 text-[#6B7280]'
                        }`}
                      >
                        {isSelected ? stepIndex + 1 : '—'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#14263F] leading-snug">
                      {step.text}
                    </p>
                  </button>
                );
              })}
            </div>

            {tappedPracticalStepIds.length === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  isPracticalSolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPracticalSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    {isPracticalSolved ? (
                      <span><strong>Excellent, {childName}!</strong> {currentPracticalVar.successMessage}</span>
                    ) : (
                      <span>Almost there! Think about which step must happen first. Tap Reset to try again.</span>
                    )}
                  </div>
                </div>

                {isPracticalSolved && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Next routine loading...
                  </span>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* PILLAR 4: CULTURAL & GENERAL KNOWLEDGE (Animal to Habitat Matching)   */}
        {/* =================================================================== */}
        {activePillar === 'cultural' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs font-bold text-[#14263F]">
                {currentCulturalVar.prompt}
              </div>
              {renderVariationIndicator(culturalVarIdx, CULTURAL_VARIATIONS.length, (idx) => {
                setCulturalVarIdx(idx);
                setSelectedCulturalChoiceId(null);
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Target Habitat Card */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-blue-200 shadow-xs text-center space-y-2">
                <span className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Target Natural Habitat
                </span>
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1E4E8C] shadow-2xs my-1">
                  <currentCulturalVar.habitatIcon className="w-10 h-10" />
                </div>
                <h4 className="font-heading font-extrabold text-xl text-[#1E4E8C]">
                  {currentCulturalVar.habitatTitle}
                </h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {currentCulturalVar.fact}
                </p>
              </div>

              {/* 4 Animal Choices */}
              <div className="md:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
                {currentCulturalVar.choices.map((choice) => {
                  const isSelected = selectedCulturalChoiceId === choice.id;
                  const isCorrect = choice.isCorrect;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setSelectedCulturalChoiceId(choice.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 select-none ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300 scale-102'
                            : 'bg-rose-50 border-rose-400'
                          : 'bg-white border-gray-200 hover:border-[#1E4E8C]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#1E4E8C] shadow-2xs">
                        <choice.icon className="w-7 h-7" />
                      </div>
                      <span className="font-heading font-extrabold text-xs sm:text-sm text-[#14263F]">
                        {choice.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCulturalChoiceId && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  isCulturalSolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCulturalSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    {isCulturalSolved ? (
                      <span><strong>Great Scientific Knowledge, {childName}!</strong> {currentCulturalVar.successMessage}</span>
                    ) : (
                      <span>Think about where that animal thrives! Would it enjoy that habitat? Try another choice.</span>
                    )}
                  </div>
                </div>

                {isCulturalSolved && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Next habitat loading...
                  </span>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* PILLAR 5: ARTS (Repeating Pattern Completion)                        */}
        {/* =================================================================== */}
        {activePillar === 'arts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs font-bold text-[#14263F]">
                {currentArtsVar.description}
              </div>
              {renderVariationIndicator(artsVarIdx, ARTS_VARIATIONS.length, (idx) => {
                setArtsVarIdx(idx);
                setSelectedArtsChoiceId(null);
              })}
            </div>

            {/* Visual Sequence Strip with Target Slot */}
            <div className="p-6 bg-white rounded-2xl border-2 border-[#D4A017]/40 shadow-xs space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4A017] text-center">
                {currentArtsVar.title}
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap py-2">
                {currentArtsVar.sequence.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-[#FCFBF7] border border-gray-200 flex flex-col items-center justify-center shadow-2xs"
                  >
                    {renderPatternGlyph(item)}
                  </div>
                ))}

                {/* Target Missing Slot */}
                <div
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    isArtsSolved
                      ? 'bg-emerald-50 border-emerald-500 scale-105 shadow-sm'
                      : 'bg-amber-50 border-[#D4A017] animate-pulse'
                  }`}
                >
                  {isArtsSolved ? (
                    renderPatternGlyph(currentArtsVar.missingItem)
                  ) : (
                    <span className="font-heading font-extrabold text-xl text-[#D4A017]">?</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pattern Choices */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#14263F]">
                Pick the item that comes next in the pattern:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentArtsVar.choices.map((choice) => {
                  const isSelected = selectedArtsChoiceId === choice.id;
                  const isCorrect = choice.isCorrect;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setSelectedArtsChoiceId(choice.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 select-none ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300 scale-102'
                            : 'bg-rose-50 border-rose-400'
                          : 'bg-white border-gray-200 hover:border-[#D4A017]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shadow-2xs">
                        {renderPatternGlyph(choice, 'w-6 h-6')}
                      </div>
                      <span className="text-xs font-bold text-[#14263F]">{choice.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedArtsChoiceId && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  isArtsSolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isArtsSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    {isArtsSolved ? (
                      <span><strong>Perfection, {childName}!</strong> {currentArtsVar.successMessage}</span>
                    ) : (
                      <span>Say the sequence aloud! Hear the rhythm and look at the order. Try again!</span>
                    )}
                  </div>
                </div>

                {isArtsSolved && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Next pattern loading...
                  </span>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Celebratory Banner in Child Mode */}
        {isChildMode && (
          <div className="pt-2">
            {(isNumeracySolved && activePillar === 'numeracy') ||
            (isPhonicsSolved && activePillar === 'phonics') ||
            (isPracticalSolved && activePillar === 'practical_life') ||
            (isCulturalSolved && activePillar === 'cultural') ||
            (isArtsSolved && activePillar === 'arts') ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-xs">
                    <Star className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-[#1E4E8C] flex items-center gap-1.5">
                      <span>Activity Star Earned!</span>
                      <PartyPopper className="w-4 h-4 text-[#D4A017]" />
                    </h4>
                    <p className="text-xs text-[#14263F]/80">
                      Mrs Sarah is proud of your effort with {currentPillarConfig.shortLabel}!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextPillars: LearningPillar[] = ['numeracy', 'phonics', 'practical_life', 'cultural', 'arts'];
                    const currentIdx = nextPillars.indexOf(activePillar);
                    const nextPillar = nextPillars[(currentIdx + 1) % nextPillars.length];
                    handlePillarSelect(nextPillar);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <span>Switch Pillar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : null}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* PILLAR COMPLETION CELEBRATION MODAL (Larger Award Moment)          */}
      {/* =================================================================== */}
      <AnimatePresence>
        {pillarAward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-3 border-[#D4A017] space-y-6 text-center relative overflow-hidden"
            >
              {/* Confetti Glow Background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                {/* Big Animated Trophy Badge */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#1E4E8C] to-[#0F2A4D] border-4 border-[#D4A017] text-[#D4A017] flex items-center justify-center mx-auto shadow-xl"
                >
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
                </motion.div>

                <div className="space-y-1.5">
                  <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#D4A017] bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>Pillar Complete</span>
                  </span>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#1E4E8C]">
                    {pillarAward.title} Complete!
                  </h3>
                  <p className="text-sm text-[#4B5563] max-w-md mx-auto leading-relaxed">
                    Splendid effort, <strong className="text-[#1E4E8C]">{childName}</strong>!
                    You finished all challenges in {pillarAward.title}!
                  </p>
                </div>

                {/* Next Pillar Preview or All Done */}
                <div className="bg-[#FCFBF7] p-4 rounded-2xl border-2 border-amber-200/70 space-y-1.5">
                  {pillarAward.nextPillarTitle ? (
                    <>
                      <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                        Moving to Next Pillar in Sequence:
                      </div>
                      <div className="font-heading font-extrabold text-base sm:text-lg text-[#1E4E8C]">
                        {pillarAward.nextPillarTitle}
                      </div>
                      <div className="text-xs text-[#D4A017] font-extrabold">
                        Auto-advancing in {countdown}s...
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                        All 5 Pillars Completed Today!
                      </div>
                      <div className="font-heading font-extrabold text-base sm:text-lg text-[#1E4E8C]">
                        Opening your daily victory celebration...
                      </div>
                      <div className="text-xs text-emerald-600 font-extrabold">
                        Final celebration in {countdown}s...
                      </div>
                    </>
                  )}
                </div>

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleDismissPillarAward}
                  className="w-full py-3.5 rounded-2xl bg-[#D4A017] text-white font-heading font-extrabold text-sm sm:text-base hover:bg-[#B4820A] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    {pillarAward.nextPillarTitle ? (
                      <>
                        <span>Continue to {pillarAward.nextPillarTitle}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Show Daily Star Celebration</span>
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
