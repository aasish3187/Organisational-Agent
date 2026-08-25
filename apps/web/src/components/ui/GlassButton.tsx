import React from 'react';
import { cn } from '@/lib/cn';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function GlassButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary:
      'bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border-purple-500/40 shadow-lg shadow-purple-900/20',
    secondary:
      'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-white/20',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 border-transparent hover:border-white/10',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30 shadow-lg shadow-rose-950/20',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md border backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
