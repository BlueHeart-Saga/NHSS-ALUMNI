import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 sm:px-3 py-1.5 text-xs rounded-xl',
    md: 'px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl',
    lg: 'px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-2xl'
  };

  const variantStyles = {
    primary: 'bg-[#F4C542] hover:bg-[#E0B030] active:bg-[#D4A528] text-[#111111] font-semibold border border-[#F4C542]',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-[#111111] font-medium border border-[#E5E7EB]',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-[#111111] font-medium'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        'inline-flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        fullWidth ? 'w-full' : '',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : children}
    </button>
  );
};
