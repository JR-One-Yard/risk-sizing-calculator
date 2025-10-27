/**
 * Badge Component
 * Small status indicator or label
 * Credit Suisse design system - Professional, muted colors
 */

import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-[6px]';

  const variantStyles = {
    neutral: 'bg-brand-tint text-ink-muted',
    info: 'bg-info-bg text-info',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    error: 'bg-error-bg text-error',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
