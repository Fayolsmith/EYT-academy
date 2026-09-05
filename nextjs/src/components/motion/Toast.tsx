'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastOptions {
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (messageOrOptions: string | ToastOptions, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((messageOrOptions: string | ToastOptions, typeParam: ToastType = 'success') => {
    let message: string;
    let type: ToastType = typeParam;
    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      message = messageOrOptions.message;
      if (messageOrOptions.type) {
        type = messageOrOptions.type;
      }
    } else {
      message = messageOrOptions;
    }
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="assertive"
        className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';

            return (
              <motion.div
                key={toast.id}
                layout={!shouldReduceMotion}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.95 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20, scale: 0.95 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
                  isSuccess
                    ? 'bg-white/95 border-emerald-200 text-emerald-950 shadow-emerald-900/5'
                    : isError
                    ? 'bg-white/95 border-rose-200 text-rose-950 shadow-rose-900/5'
                    : 'bg-white/95 border-blue-200 text-slate-900 shadow-blue-900/5'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                  {!isSuccess && !isError && <Info className="w-5 h-5 text-[#1E4E8C]" />}
                </div>

                <div className="flex-1 text-xs font-semibold leading-relaxed">
                  {toast.message}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-700 transition-colors rounded-lg"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
