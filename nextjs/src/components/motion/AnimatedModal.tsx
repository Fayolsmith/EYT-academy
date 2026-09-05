'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, Transition } from 'framer-motion';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  closeOnBackdropClick?: boolean;
}

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  className = '',
  closeOnBackdropClick = true,
}: AnimatedModalProps) {
  const shouldReduceMotion = useReducedMotion();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const overlayTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: 'easeOut' };

  const contentTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.16, 1, 0.3, 1] };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Content Dialog */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={contentTransition}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full ${maxWidth} ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
