'use client';

import React, { useState, useEffect } from 'react';
import { Lock, X, Check, Delete, ShieldAlert } from 'lucide-react';

interface ParentalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MathProblem {
  num1: number;
  num2: number;
  operator: '+' | '-';
  expectedAnswer: number;
}

function generateMathProblem(): MathProblem {
  // Generate a simple addition or subtraction suitable for an adult to solve in 2 seconds
  const isAddition = Math.random() > 0.4;
  if (isAddition) {
    const num1 = Math.floor(Math.random() * 8) + 6; // 6 to 13
    const num2 = Math.floor(Math.random() * 8) + 5; // 5 to 12
    return {
      num1,
      num2,
      operator: '+',
      expectedAnswer: num1 + num2,
    };
  } else {
    const num1 = Math.floor(Math.random() * 10) + 12; // 12 to 21
    const num2 = Math.floor(Math.random() * 6) + 4;   // 4 to 9
    return {
      num1,
      num2,
      operator: '-',
      expectedAnswer: num1 - num2,
    };
  }
}

export default function ParentalGateModal({
  isOpen,
  onClose,
  onSuccess,
}: ParentalGateModalProps) {
  const [problem, setProblem] = useState<MathProblem>(generateMathProblem);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  // Generate a fresh question when opened
  useEffect(() => {
    if (isOpen) {
      setProblem(generateMathProblem());
      setUserAnswer('');
      setHasError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setHasError(false);
    if (userAnswer.length < 4) {
      setUserAnswer((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setHasError(false);
    setUserAnswer((prev) => prev.slice(0, -1));
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(userAnswer, 10);
    if (parsed === problem.expectedAnswer) {
      onSuccess();
    } else {
      setHasError(true);
      setUserAnswer('');
      // Refresh question on failure
      setProblem(generateMathProblem());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D4A017]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#1E4E8C]">
                Parental Gate
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Parents only &bull; Confirm to exit Child Mode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Math Challenge Question */}
        <div className="p-4 bg-[#FCFBF7] rounded-2xl border-2 border-dashed border-[#D4A017]/40 text-center space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A017]">
            Please solve to return to Parent Dashboard:
          </span>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1E4E8C] tracking-wide">
            {problem.num1} {problem.operator} {problem.num2} = ?
          </div>
        </div>

        {/* User Answer Display */}
        <div className="flex items-center justify-center">
          <div
            className={`w-36 h-12 rounded-2xl border-2 flex items-center justify-center font-heading font-extrabold text-2xl tracking-widest ${
              hasError
                ? 'border-rose-400 bg-rose-50 text-rose-700'
                : 'border-[#1E4E8C] bg-white text-[#1E4E8C]'
            }`}
          >
            {userAnswer || <span className="text-gray-300 font-normal text-base">Answer</span>}
          </div>
        </div>

        {hasError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center gap-1.5 font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Incorrect answer. Please try the new question above.</span>
          </div>
        )}

        {/* Large touch-friendly Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#14263F] font-heading font-bold text-lg hover:bg-[#E8F0FA] hover:text-[#1E4E8C] active:scale-95 transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#6B7280] font-bold text-sm hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#14263F] font-heading font-bold text-lg hover:bg-[#E8F0FA] hover:text-[#1E4E8C] active:scale-95 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={!userAnswer}
            className="py-3 rounded-xl bg-[#1E4E8C] text-white font-bold text-sm hover:bg-[#153763] disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Confirm"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#6B7280] hover:bg-gray-50 transition-all cursor-pointer"
        >
          Keep Playing in Child Mode
        </button>

      </div>
    </div>
  );
}
