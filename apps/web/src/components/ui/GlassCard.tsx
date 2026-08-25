import React from 'react';
import { cn } from '@/lib/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: 'thin' | 'regular' | 'thick';
  children: React.ReactNode;
}

export function GlassCard({
  tier = 'regular',
  className,
  children,
  ...props
}: GlassCardProps) {
  const tierClass =
    tier === 'thin'
      ? 'glass-thin'
      : tier === 'thick'
      ? 'glass-thick'
      : 'glass-regular';

  return (
    <div className={cn(tierClass, 'p-6 transition-all duration-200', className)} {...props}>
      {children}
    </div>
  );
}
