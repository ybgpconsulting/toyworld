import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, label, error, helperText, multiline = false, rows = 3, ...props }, ref) => {
    const inputClasses = clsx(
      'w-full px-3 py-2 text-base md:text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)] focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500',
      error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
      className
    );

    return (
      <div className="w-full flex flex-col space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={inputClasses}
            rows={rows}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={inputClasses}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        
        {(error || helperText) && (
          <p className={clsx('text-xs mt-1', error ? 'text-red-500' : 'text-gray-500')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
