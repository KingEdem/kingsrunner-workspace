'use client';

import { cn } from '@/lib/utils';

interface TIRLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TIRLogo({ className, size = 'md' }: TIRLogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/5',
      sizes[size],
      className
    )}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-2/3 h-2/3"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Geometric squares pattern */}
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500" />
        {/* Center connector */}
        <circle cx="12" cy="12" r="2" fill="currentColor" className="text-emerald-500" />
      </svg>
    </div>
  );
}

export function TIRLogoWithText({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <TIRLogo size="md" />
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TIRLogo size="sm" />
          The Institution Runner
        </span>
        <span className="text-sm text-emerald-500/80">Enterprise Resource Planning</span>
      </div>
    </div>
  );
}
