import React from 'react';
import Image from 'next/image';

interface TIRLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TIRLogo({ size = 'md', className }: TIRLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const imageSize = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src="/icon.svg"
        alt="The Institution Runner Logo"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-contain"
      />
    </div>
  );
}
