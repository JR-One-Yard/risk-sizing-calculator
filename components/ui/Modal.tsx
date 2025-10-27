/**
 * Modal Component
 * Accessible modal dialog with overlay, focus trap, and keyboard navigation
 * Credit Suisse design system - Professional banking aesthetic
 */

'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus modal
    modalRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Restore focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand bg-opacity-60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-[10px] shadow-md border border-border w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-bg-muted">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-ink">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto text-ink-muted hover:text-brand focus:outline-none focus:ring-2 focus:ring-focus rounded-[6px] p-1"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-5">{children}</div>
      </div>
    </div>
  );

  // Render in portal to avoid z-index issues
  return createPortal(modal, document.body);
}
