import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F6F50] disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer touch-target';

  const variantClasses = {
    primary:
      'bg-[#1F6F50] text-[#FFFDF8] hover:bg-[#17573E] shadow-sm focus-visible:outline-[#1F6F50]',
    secondary:
      'bg-[#E6F2EC] text-[#1F6F50] hover:bg-[#D4E8DE] border border-[#1F6F50]/20 focus-visible:outline-[#1F6F50]',
    ghost:
      'bg-transparent text-[#1E2420] hover:bg-[#F4EFE4] hover:text-[#1F6F50] focus-visible:outline-[#1F6F50]',
    danger:
      'bg-[#E53935] text-[#FFFDF8] hover:bg-[#C62828] shadow-sm focus-visible:outline-[#E53935]',
  };

  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3 rounded-lg gap-1.5 min-h-[40px]',
    md: 'text-base py-2.5 px-5 rounded-xl gap-2 min-h-[44px]',
    lg: 'text-lg py-3 px-6 rounded-xl gap-2.5 min-h-[48px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
