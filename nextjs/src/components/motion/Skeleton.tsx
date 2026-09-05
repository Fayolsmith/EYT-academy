'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export function Skeleton({ className = '', variant = 'rounded' }: SkeletonProps) {
  const shouldReduceMotion = useReducedMotion();

  const radiusClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'rounded'
      ? 'rounded-xl'
      : 'rounded-none';

  if (shouldReduceMotion) {
    return <div className={`bg-slate-200/80 ${radiusClass} ${className}`} />;
  }

  return <div className={`shimmer ${radiusClass} ${className}`} />;
}
