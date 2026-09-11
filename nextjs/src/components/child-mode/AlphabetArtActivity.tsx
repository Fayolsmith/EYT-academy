'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Edit3,
  Puzzle,
  Sun,
  Ship,
  Trees,
  Home,
  Moon,
  CircleDot,
  Palette,
  Check,
  Cloud,
  Flower2,
} from 'lucide-react';

// =========================================================================
// Native Web Audio API Sound Synthesis
// =========================================================================
function playTone(freq: number, duration: number, type: OscillatorType = 'sine') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playPieceChime() {
  playTone(523.25, 0.18, 'triangle'); // C5
  setTimeout(() => playTone(659.25, 0.22, 'triangle'), 80); // E5
}

function playArtCelebration() {
  playTone(523.25, 0.2, 'triangle'); // C5
  setTimeout(() => playTone(659.25, 0.2, 'triangle'), 100); // E5
  setTimeout(() => playTone(783.99, 0.25, 'triangle'), 200); // G5
  setTimeout(() => playTone(1046.5, 0.45, 'triangle'), 300); // C6
}

// =========================================================================
// PHASE A: Letter-Placement Puzzle Variations (3–5 Pictures)
// =========================================================================
export interface LetterArtPiece {
  id: string;
  letter: string;
  role: string;
  color: string;
  bgFill: string;
}

export interface LetterArtVariation {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  canvasDescription: string;
  solvedTitle: string;
  solvedMessage: string;
  pieces: LetterArtPiece[];
}

export const LETTER_ART_VARIATIONS: LetterArtVariation[] = [
  {
    id: 'sun',
    title: 'Sunny Sun',
    icon: Sun,
    prompt: 'Build a cheerful shining Sun using letters O, V, and I!',
    canvasDescription: 'A round sunny face with bright beams and a happy smile.',
    solvedTitle: 'Warm & Glowing Sun!',
    solvedMessage: 'Splendid work! The letters O, V, and I built a cheerful shining Sun!',
    pieces: [
      { id: 'sun-o', letter: 'O', role: 'Round Sun Face', color: '#F59E0B', bgFill: 'bg-amber-100 border-amber-400 text-amber-600' },
      { id: 'sun-v', letter: 'V', role: 'Sunny Smile', color: '#EA580C', bgFill: 'bg-orange-100 border-orange-400 text-orange-600' },
      { id: 'sun-i', letter: 'I', role: 'Golden Sunbeam', color: '#EAB308', bgFill: 'bg-yellow-100 border-yellow-400 text-yellow-600' },
    ],
  },
  {
    id: 'boat',
    title: 'Sailing Boat',
    icon: Ship,
    prompt: 'Assemble a sailboat using letters D, T, and V!',
    canvasDescription: 'A boat gliding across gentle ocean waves under the breeze.',
    solvedTitle: 'Ocean Sailboat Ready!',
    solvedMessage: 'Anchors aweigh! Letters D, T, and V crafted a brave sailing boat!',
    pieces: [
      { id: 'boat-d', letter: 'D', role: 'Curved Main Sail', color: '#2563EB', bgFill: 'bg-blue-100 border-blue-400 text-blue-600' },
      { id: 'boat-t', letter: 'T', role: 'Tall Ship Mast', color: '#78350F', bgFill: 'bg-amber-100 border-amber-600 text-amber-800' },
      { id: 'boat-v', letter: 'V', role: 'Floating Boat Hull', color: '#1E4E8C', bgFill: 'bg-indigo-100 border-indigo-400 text-indigo-700' },
    ],
  },
  {
    id: 'tree',
    title: 'Forest Tree',
    icon: Trees,
    prompt: 'Create a leafy forest tree using letters B, I, and Y!',
    canvasDescription: 'A strong green tree offering shade and fresh forest air.',
    solvedTitle: 'Lush Forest Tree!',
    solvedMessage: 'Nature artist! Letters B, I, and Y formed a healthy green tree!',
    pieces: [
      { id: 'tree-b', letter: 'B', role: 'Leafy Green Canopy', color: '#16A34A', bgFill: 'bg-emerald-100 border-emerald-400 text-emerald-600' },
      { id: 'tree-i', letter: 'I', role: 'Strong Tree Trunk', color: '#78350F', bgFill: 'bg-amber-100 border-amber-700 text-amber-900' },
      { id: 'tree-y', letter: 'Y', role: 'Sprouting Branches', color: '#15803D', bgFill: 'bg-green-100 border-green-500 text-green-700' },
    ],
  },
  {
    id: 'butterfly',
    title: 'Fluttering Butterfly',
    icon: Sparkles,
    prompt: 'Craft a gentle garden butterfly using letters B, I, and C!',
    canvasDescription: 'A colorful butterfly with fluttering wings and antennae.',
    solvedTitle: 'Graceful Butterfly!',
    solvedMessage: 'Magnificent! Letters B, I, and C created a graceful garden butterfly!',
    pieces: [
      { id: 'butterfly-b', letter: 'B', role: 'Fluttering Wings', color: '#9333EA', bgFill: 'bg-purple-100 border-purple-400 text-purple-600' },
      { id: 'butterfly-i', letter: 'I', role: 'Slender Body', color: '#0F172A', bgFill: 'bg-slate-100 border-slate-500 text-slate-800' },
      { id: 'butterfly-c', letter: 'C', role: 'Curved Antennae', color: '#DB2777', bgFill: 'bg-pink-100 border-pink-400 text-pink-600' },
    ],
  },
  {
    id: 'house',
    title: 'Cozy Cottage',
    icon: Home,
    prompt: 'Build a sweet cottage using letters A, H, and O!',
    canvasDescription: 'A peaceful little home with a pitched roof and attic window.',
    solvedTitle: 'Cozy Montessori Cottage!',
    solvedMessage: 'Splendid craftsmanship! Letters A, H, and O built a cozy little home!',
    pieces: [
      { id: 'house-a', letter: 'A', role: 'Triangular Roof Peak', color: '#DC2626', bgFill: 'bg-rose-100 border-rose-400 text-rose-600' },
      { id: 'house-h', letter: 'H', role: 'Sturdy Wall & Door', color: '#1E4E8C', bgFill: 'bg-blue-100 border-blue-400 text-blue-700' },
      { id: 'house-o', letter: 'O', role: 'Round Attic Window', color: '#D97706', bgFill: 'bg-amber-100 border-amber-400 text-amber-700' },
    ],
  },
];

// =========================================================================
// PHASE B: Dotted Path Tracing Variations (Separate optional mode)
// =========================================================================
export interface TracingPoint {
  id: number;
  x: number;
  y: number;
  label: string;
}

export interface TracingVariation {
  id: string;
  letter: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  revealedArt: string;
  points: TracingPoint[];
}

export const TRACING_VARIATIONS: TracingVariation[] = [
  {
    id: 'trace-s',
    letter: 'S',
    title: 'Letter S & Sunbeam',
    icon: Sun,
    prompt: 'Tap the glowing numbers 1 to 5 along letter S to reveal the sunbeam!',
    revealedArt: 'Shining Sunbeam Revealed!',
    points: [
      { id: 1, x: 75, y: 25, label: '1' },
      { id: 2, x: 45, y: 35, label: '2' },
      { id: 3, x: 50, y: 55, label: '3' },
      { id: 4, x: 75, y: 75, label: '4' },
      { id: 5, x: 35, y: 85, label: '5' },
    ],
  },
  {
    id: 'trace-c',
    letter: 'C',
    title: 'Letter C & Crescent Moon',
    icon: Moon,
    prompt: 'Follow the curved arc from 1 to 4 to reveal the silver Crescent Moon!',
    revealedArt: 'Silver Crescent Moon Revealed!',
    points: [
      { id: 1, x: 70, y: 25, label: '1' },
      { id: 2, x: 35, y: 40, label: '2' },
      { id: 3, x: 35, y: 70, label: '3' },
      { id: 4, x: 70, y: 85, label: '4' },
    ],
  },
  {
    id: 'trace-o',
    letter: 'O',
    title: 'Letter O & Golden Orange',
    icon: CircleDot,
    prompt: 'Trace the circle from 1 all the way around to 5 to reveal the ripe Orange!',
    revealedArt: 'Sweet Ripe Orange Revealed!',
    points: [
      { id: 1, x: 50, y: 20, label: '1' },
      { id: 2, x: 75, y: 45, label: '2' },
      { id: 3, x: 50, y: 80, label: '3' },
      { id: 4, x: 25, y: 45, label: '4' },
      { id: 5, x: 50, y: 20, label: '5' },
    ],
  },
];

export interface AlphabetArtActivityProps {
  childName?: string;
  soundEnabled?: boolean;
  onBackToActivities?: () => void;
}

export default function AlphabetArtActivity({
  childName = 'Superstar',
  soundEnabled = true,
  onBackToActivities,
}: AlphabetArtActivityProps) {
  // Mode Selection: Phase A (Placement, default) vs Phase B (Tracing, optional extra)
  const [activeMode, setActiveMode] = useState<'placement' | 'tracing'>('placement');

  // -------------------------------------------------------------------------
  // PHASE A STATE: Letter Placement Puzzle
  // -------------------------------------------------------------------------
  const [variationIndex, setVariationIndex] = useState(0);
  const [placedPieceIds, setPlacedPieceIds] = useState<string[]>([]);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentVariation = LETTER_ART_VARIATIONS[variationIndex];
  const isVariationSolved = currentVariation.pieces.every((p) => placedPieceIds.includes(p.id));

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Handle Piece Placement
  const handlePlacePiece = (piece: LetterArtPiece) => {
    if (placedPieceIds.includes(piece.id) || isAdvancing) return;

    if (soundEnabled) playPieceChime();
    const updated = [...placedPieceIds, piece.id];
    setPlacedPieceIds(updated);

    // Check if this completes the picture
    if (currentVariation.pieces.every((p) => updated.includes(p.id))) {
      if (soundEnabled) playArtCelebration();

      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setVariationIndex((prev) => (prev + 1) % LETTER_ART_VARIATIONS.length);
        setPlacedPieceIds([]);
        setIsAdvancing(false);
      }, 2500);
    }
  };

  const handleResetPlacement = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setIsAdvancing(false);
    setPlacedPieceIds([]);
  };

  const handleNextVariation = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setIsAdvancing(false);
    setVariationIndex((prev) => (prev + 1) % LETTER_ART_VARIATIONS.length);
    setPlacedPieceIds([]);
  };

  const handleSelectVariation = (idx: number) => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setIsAdvancing(false);
    setVariationIndex(idx);
    setPlacedPieceIds([]);
  };

  // -------------------------------------------------------------------------
  // PHASE B STATE: Dotted Path Tracing
  // -------------------------------------------------------------------------
  const [tracingIndex, setTracingIndex] = useState(0);
  const [connectedPointIds, setConnectedPointIds] = useState<number[]>([1]);

  const currentTracing = TRACING_VARIATIONS[tracingIndex];
  const isTracingSolved = connectedPointIds.length === currentTracing.points.length;

  const handleTapPoint = (pointId: number) => {
    const nextExpected = connectedPointIds.length + 1;
    if (pointId === nextExpected) {
      if (soundEnabled) playPieceChime();
      const updated = [...connectedPointIds, pointId];
      setConnectedPointIds(updated);

      if (updated.length === currentTracing.points.length) {
        if (soundEnabled) playArtCelebration();
      }
    }
  };

  const handleResetTracing = () => {
    setConnectedPointIds([1]);
  };

  const handleNextTracing = () => {
    setTracingIndex((prev) => (prev + 1) % TRACING_VARIATIONS.length);
    setConnectedPointIds([1]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. Header Banner & Mode Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-purple-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#1E4E8C]">
                Bonus Activity: Alphabet Art
              </h2>
              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 uppercase tracking-wider">
                Fun Extra
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Discover how letters form beautiful pictures! Purely for fun &bull; Does not affect daily milestones.
            </p>
          </div>
        </div>

        {/* Phase A / Phase B Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setActiveMode('placement')}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'placement'
                ? 'bg-white text-[#1E4E8C] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1E4E8C]'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5 text-purple-600" />
            <span>Phase A: Letter Puzzle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('tracing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'tracing'
                ? 'bg-white text-[#1E4E8C] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1E4E8C]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Phase B: Magic Tracing</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODE 1: PHASE A — LETTER-PLACEMENT PUZZLE (Primary Mechanic)       */}
      {/* =================================================================== */}
      {activeMode === 'placement' && (
        <motion.div
          key="placement-mode"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Variation Selector Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-[#6B7280] px-2 hidden sm:inline">
                Picture Challenge:
              </span>
              {LETTER_ART_VARIATIONS.map((varItem, idx) => (
                <button
                  key={varItem.id}
                  type="button"
                  onClick={() => handleSelectVariation(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    variationIndex === idx
                      ? 'bg-[#1E4E8C] text-white shadow-xs'
                      : 'text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]'
                  }`}
                  title={varItem.title}
                >
                  <varItem.icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{varItem.title}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetPlacement}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-[#6B7280] hover:text-[#1E4E8C] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Reset current picture pieces"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Pieces</span>
            </button>
          </div>

          {/* Main Art Canvas Stage */}
          <div className="bg-[#FCFBF7] rounded-3xl border-3 border-purple-200 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
            
            {/* Prompt & Theme Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                    <currentVariation.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#1E4E8C]">
                    {currentVariation.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#4B5563]">
                  {currentVariation.prompt}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                <span>Placed: {placedPieceIds.length} / {currentVariation.pieces.length} Pieces</span>
              </div>
            </div>

            {/* Visual Art Board with Slots */}
            <div className="min-h-[220px] sm:min-h-[260px] rounded-2xl bg-white border-2 border-dashed border-purple-300 p-6 flex flex-col items-center justify-center relative shadow-inner">
              
              {/* Floating Background Decorations */}
              <div className="absolute top-4 left-6 opacity-30 select-none pointer-events-none">
                <Cloud className="w-8 h-8 text-purple-400" />
              </div>
              <div className="absolute top-4 right-6 opacity-30 select-none pointer-events-none">
                <Sparkles className="w-7 h-7 text-amber-400" />
              </div>
              <div className="absolute bottom-4 left-8 opacity-30 select-none pointer-events-none">
                <Flower2 className="w-8 h-8 text-rose-400" />
              </div>

              {/* Slots Layout */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap z-10">
                {currentVariation.pieces.map((piece) => {
                  const isPlaced = placedPieceIds.includes(piece.id);
                  return (
                    <motion.div
                      key={piece.id}
                      animate={isPlaced ? { scale: [0.9, 1.08, 1] } : {}}
                      className={`w-28 sm:w-36 h-32 sm:h-40 rounded-3xl border-3 flex flex-col items-center justify-between p-3.5 transition-all text-center ${
                        isPlaced
                          ? `${piece.bgFill} shadow-md`
                          : 'border-dashed border-gray-300 bg-gray-50/60 text-gray-400'
                      }`}
                    >
                      {/* Slot Header Label */}
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider line-clamp-1">
                        {piece.role}
                      </span>

                      {/* Letter Glyph Display */}
                      <div className="flex-1 flex items-center justify-center">
                        {isPlaced ? (
                          <span
                            className="font-heading font-black text-5xl sm:text-6xl drop-shadow-sm select-none"
                            style={{ color: piece.color }}
                          >
                            {piece.letter}
                          </span>
                        ) : (
                          <span className="font-heading font-bold text-4xl sm:text-5xl text-gray-300 select-none border-b-2 border-dashed border-gray-300 px-3">
                            {piece.letter}
                          </span>
                        )}
                      </div>

                      {/* Status Indicator */}
                      <div className="text-[11px] font-bold">
                        {isPlaced ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Placed
                          </span>
                        ) : (
                          <span className="text-gray-400">Waiting for {piece.letter}</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Solved Celebration Toast */}
              <AnimatePresence>
                {isVariationSolved && (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-20"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-heading font-black text-xl text-[#1E4E8C] flex items-center justify-center gap-1.5">
                        <span>{currentVariation.solvedTitle}</span>
                        <PartyPopper className="w-5 h-5 text-[#D4A017]" />
                      </h4>
                      <p className="text-xs sm:text-sm text-[#4B5563] max-w-md">
                        {currentVariation.solvedMessage}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextVariation}
                      className="px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-heading font-bold text-xs hover:bg-[#153763] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Next Letter Picture</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Available Letter Tiles Tray */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#6B7280]">
                  Tap a Letter Piece to Place on the Canvas:
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  Designed for little hands (Ages 3–8)
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {currentVariation.pieces.map((piece) => {
                  const isPlaced = placedPieceIds.includes(piece.id);
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      disabled={isPlaced}
                      onClick={() => handlePlacePiece(piece)}
                      className={`p-4 rounded-2xl border-2 font-heading transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs ${
                        isPlaced
                          ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                          : 'bg-white border-purple-200 hover:border-purple-500 hover:bg-purple-50 text-[#14263F]'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl font-black" style={{ color: piece.color }}>
                        {piece.letter}
                      </span>
                      <span className="text-[11px] font-bold text-[#6B7280] line-clamp-1">
                        {piece.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* MODE 2: PHASE B — DOTTED PATH TRACING (Optional Extra Mechanic)    */}
      {/* =================================================================== */}
      {activeMode === 'tracing' && (
        <motion.div
          key="tracing-mode"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Tracing Variations Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-[#6B7280] px-2 hidden sm:inline">
                Tracing Card:
              </span>
              {TRACING_VARIATIONS.map((tItem, idx) => (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => {
                    setTracingIndex(idx);
                    setConnectedPointIds([1]);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    tracingIndex === idx
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[#14263F] hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <span><tItem.icon className="w-3.5 h-3.5" /></span>
                  <span>{tItem.title}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetTracing}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-[#6B7280] hover:text-[#1E4E8C] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart Path</span>
            </button>
          </div>

          {/* Tracing Canvas Stage */}
          <div className="bg-[#FCFBF7] rounded-3xl border-3 border-indigo-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1 pb-4 border-b border-indigo-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <currentTracing.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#1E4E8C]">
                  {currentTracing.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#4B5563]">
                {currentTracing.prompt}
              </p>
            </div>

            {/* Dotted Waypoint Board */}
            <div className="min-h-[260px] rounded-2xl bg-white border-2 border-indigo-200 p-6 flex flex-col items-center justify-center relative shadow-inner">
              
              {/* Waypoint Connection Line Visualization */}
              <div className="relative w-72 h-64 border border-dashed border-gray-200 rounded-2xl bg-indigo-50/30">
                {currentTracing.points.map((pt) => {
                  const isConnected = connectedPointIds.includes(pt.id);
                  const isNext = connectedPointIds.length + 1 === pt.id;

                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => handleTapPoint(pt.id)}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full font-heading font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        isConnected
                          ? 'bg-emerald-500 text-white scale-110 ring-4 ring-emerald-200'
                          : isNext
                          ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-200 hover:scale-115'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                      title={`Step ${pt.label}`}
                    >
                      {isConnected ? <Check className="w-4 h-4" /> : pt.label}
                    </button>
                  );
                })}
              </div>

              {/* Reveal Overlay */}
              <AnimatePresence>
                {isTracingSolved && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-20"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs animate-bounce">
                      <currentTracing.icon className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-heading font-black text-xl text-[#1E4E8C]">
                        {currentTracing.revealedArt}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#4B5563]">
                        Splendid finger coordination, {childName}! You traced letter {currentTracing.letter} to perfection!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextTracing}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Next Magic Tracing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center text-xs text-[#6B7280]">
              <span>Follow the dotted numbers in sequential order to reveal each hidden artwork.</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer Return Action */}
      {onBackToActivities && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onBackToActivities}
            className="text-xs text-[#1E4E8C] font-heading font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Montessori Core Activities</span>
          </button>
        </div>
      )}
    </div>
  );
}
