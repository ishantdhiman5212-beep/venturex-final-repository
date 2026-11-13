import React from 'react';
import { Stethoscope, Landmark, GraduationCap } from 'lucide-react';
import { ServiceCategory } from '../types';

interface CategoryIconProps {
  category: ServiceCategory;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryIcon({ category, className = '', size = 'md' }: CategoryIconProps) {
  const sizeClasses = {
    sm: 'size-7 rounded-lg text-xs',
    md: 'size-10 rounded-xl text-sm',
    lg: 'size-12 rounded-2xl text-base',
  };

  const iconSizes = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  if (category === 'hospital') {
    return (
      <div className={`grid place-items-center bg-rose-50 text-rose-600 border border-rose-100 ${sizeClasses[size]} ${className}`}>
        <Stethoscope className={iconSizes[size]} strokeWidth={2.2} />
      </div>
    );
  }

  if (category === 'education') {
    return (
      <div className={`grid place-items-center bg-amber-50 text-amber-600 border border-amber-100 ${sizeClasses[size]} ${className}`}>
        <GraduationCap className={iconSizes[size]} strokeWidth={2.2} />
      </div>
    );
  }

  return (
    <div className={`grid place-items-center bg-blue-50 text-blue-600 border border-blue-100 ${sizeClasses[size]} ${className}`}>
      <Landmark className={iconSizes[size]} strokeWidth={2.2} />
    </div>
  );
}
