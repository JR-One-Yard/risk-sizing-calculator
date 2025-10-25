/**
 * Tooltip Component
 * Accessible tooltip with hover and focus support
 */

'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  maxWidth = '300px',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Position tooltip when it becomes visible
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8; // Gap between trigger and tooltip

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep tooltip on screen
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;

    setCoords({ top, left });
  }, [isVisible, position]);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const positionClasses = {
    top: 'mb-2',
    bottom: 'mt-2',
    left: 'mr-2',
    right: 'ml-2',
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
    bottom:
      'top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent',
    right:
      'left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      {/* Trigger */}
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex items-center cursor-help"
      >
        {children}
      </div>

      {/* Tooltip Portal */}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`fixed z-[100] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg ${positionClasses[position]}`}
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            maxWidth,
            pointerEvents: 'none',
          }}
        >
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            style={{ borderWidth: '4px' }}
          />

          {/* Content */}
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Info Icon with Tooltip
 * Common pattern: Info icon that shows tooltip on hover
 */
export function InfoTooltip({ content, position = 'top' }: Omit<TooltipProps, 'children'>) {
  return (
    <Tooltip content={content} position={position}>
      <svg
        className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    </Tooltip>
  );
}
