/**
 * Input Component
 * Accessible form input with label, error, and helper text
 * Credit Suisse design system
 */

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { InfoTooltip } from './Tooltip';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  tooltip?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      tooltip,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = !!error;

    const baseStyles =
      'block px-3 py-2 border rounded-[10px] shadow-sm text-ink placeholder-border-strong focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:bg-bg-muted disabled:cursor-not-allowed transition-colors';

    const stateStyles = hasError
      ? 'border-error-border focus:border-error focus:ring-error'
      : 'border-border focus:border-focus focus:ring-focus';

    const iconStyles = {
      left: leftIcon ? 'pl-10' : '',
      right: rightIcon ? 'pr-10' : '',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-sm font-semibold text-ink mb-1"
          >
            <span>{label}</span>
            {tooltip && <InfoTooltip content={tooltip} />}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`${baseStyles} ${stateStyles} ${iconStyles.left} ${iconStyles.right} ${widthStyle} ${className}`}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-ink-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-error">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-ink-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';