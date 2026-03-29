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

  return (
    <img
      src="/kingsrunner-logo.png"
      alt="Kingsrunner Logo"
      className={`${sizeClasses[size]} ${className || ''}`}
    />
  );
}
