import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'orange' | 'red' | 'green' | 'blue' | 'gray' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

const badgeColors = {
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export const Badge = ({ variant = 'gray', className, children, ...props }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        badgeColors[variant] || badgeColors.gray,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
