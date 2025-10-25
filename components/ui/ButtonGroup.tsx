/**
 * ButtonGroup Component
 * Radio button group styled as buttons (for VolatilitySelector)
 */

'use client';

import { ReactNode } from 'react';
import { InfoTooltip } from './Tooltip';

export interface ButtonGroupOption {
  value: string;
  label: string;
  shortLabel?: string;
  color?: 'blue' | 'cyan' | 'gray' | 'orange' | 'red' | 'green' | 'yellow';
  description?: string;
}

export interface ButtonGroupProps {
  label?: string;
  tooltip?: string;
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: {
    inactive: 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50',
    active: 'bg-blue-500 border-blue-600 text-white shadow-md',
  },
  cyan: {
    inactive: 'bg-white border-cyan-200 text-cyan-700 hover:bg-cyan-50',
    active: 'bg-cyan-500 border-cyan-600 text-white shadow-md',
  },
  gray: {
    inactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
    active: 'bg-gray-500 border-gray-600 text-white shadow-md',
  },
  green: {
    inactive: 'bg-white border-green-200 text-green-700 hover:bg-green-50',
    active: 'bg-green-500 border-green-600 text-white shadow-md',
  },
  yellow: {
    inactive: 'bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-50',
    active: 'bg-yellow-500 border-yellow-600 text-white shadow-md',
  },
  orange: {
    inactive: 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50',
    active: 'bg-orange-500 border-orange-600 text-white shadow-md',
  },
  red: {
    inactive: 'bg-white border-red-200 text-red-700 hover:bg-red-50',
    active: 'bg-red-500 border-red-600 text-white shadow-md',
  },
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

export function ButtonGroup({
  label,
  tooltip,
  options,
  value,
  onChange,
  helperText,
  fullWidth = false,
  size = 'md',
}: ButtonGroupProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
          <span>{label}</span>
          {tooltip && <InfoTooltip content={tooltip} />}
        </label>
      )}

      {/* Button Group */}
      <div
        className="inline-flex flex-col sm:flex-row gap-2 w-full"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isActive = value === option.value;
          const color = option.color || 'gray';
          const classes = isActive ? colorClasses[color].active : colorClasses[color].inactive;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={`
                flex-1 border-2 rounded-lg font-medium transition-all
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${classes}
                ${sizeClasses[size]}
              `}
              title={option.description}
            >
              <div className="text-center">
                {/* Main Label */}
                <div className="font-semibold">
                  {option.shortLabel || option.label}
                </div>
                {/* Description (if provided) - show on desktop */}
                {option.description && (
                  <div className="hidden sm:block text-xs opacity-90 mt-0.5">
                    {option.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
