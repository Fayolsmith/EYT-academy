'use client';

import React from 'react';
import { motion, useReducedMotion, HTMLMotionProps, TargetAndTransition } from 'framer-motion';

export interface MotionButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'subtle' | 'none';
}

export function MotionButton({
  children,
  className = '',
  variant = 'primary',
  ...props
}: MotionButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <button className={className} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }

  const hoverEffect = variant === 'primary'
    ? { scale: 1.015, y: -1 }
    : variant === 'secondary'
    ? { scale: 1.01, y: -0.5 }
    : { scale: 1.01 };

  return (
    <motion.button
      whileHover={hoverEffect}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  enableHoverLift?: boolean;
  hoverEffect?: 'lift' | 'scale' | 'none';
}

export function MotionCard({
  children,
  className = '',
  enableHoverLift = true,
  hoverEffect = 'lift',
  ...props
}: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !enableHoverLift || hoverEffect === 'none') {
    return <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  const hoverAnim: TargetAndTransition = hoverEffect === 'scale'
    ? { scale: 1.015, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }
    : { y: -3, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } };

  return (
    <motion.div
      whileHover={hoverAnim}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
