/**
 * Card Component
 * Foundation component for grouping content
 * Credit Suisse design system - Professional banking aesthetic
 */

import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const baseStyles = 'rounded-[10px] bg-white border';

  const variantStyles = {
    default: 'border-border shadow-sm',
    elevated: 'border-border shadow-md',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-8 py-5 border-b border-border bg-bg-muted ${className}`}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-ink ${className}`}>
      {children}
    </h3>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`px-8 py-5 ${className}`}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-8 py-5 border-t border-border bg-bg-muted rounded-b-[10px] ${className}`}>
      {children}
    </div>
  );
}
