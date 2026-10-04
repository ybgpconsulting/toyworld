import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-[var(--brand-orange)] hover:bg-[#e65a20] text-white border-transparent',
  secondary: 'bg-[var(--deep-navy)] hover:bg-[#2a2a4a] text-white border-transparent',
  outline: 'bg-transparent border-gray-300 text-[var(--deep-navy)] hover:border-gray-400 hover:bg-gray-50',
  ghost: 'bg-transparent border-transparent text-gray-700 hover:bg-gray-100',
  danger: 'bg-[var(--color-error)] hover:bg-red-600 text-white border-transparent',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg font-semibold',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, loading = false, fullWidth = false, children, disabled, ...props }, ref) => {
    const isBusy = isLoading || loading;
    return (
      <button
        ref={ref}
        disabled={disabled || isBusy}
        className={clsx(
          'inline-flex items-center justify-center border rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-orange)] disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
