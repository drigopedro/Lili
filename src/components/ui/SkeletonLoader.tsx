import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  lines = 1,
}) => {
  const baseClasses = 'bg-gray-300 animate-pulse';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              width: index === lines - 1 ? '75%' : width,
              height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

// Pre-built skeleton components for common use cases
export const RecipeCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
    <SkeletonLoader height="12rem" className="w-full" />
    <div className="p-4 space-y-3">
      <SkeletonLoader height="1.5rem" width="80%" />
      <SkeletonLoader variant="text" lines={2} height="1rem" />
      <div className="flex justify-between items-center">
        <SkeletonLoader height="1rem" width="60px" />
        <SkeletonLoader height="1rem" width="80px" />
      </div>
    </div>
  </div>
);

export const RecipeDetailSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <SkeletonLoader height="16rem" className="w-full rounded-2xl" />
    <div className="space-y-4">
      <SkeletonLoader height="2rem" width="70%" />
      <SkeletonLoader variant="text" lines={3} height="1rem" />
      <div className="grid grid-cols-3 gap-4">
        <SkeletonLoader height="3rem" />
        <SkeletonLoader height="3rem" />
        <SkeletonLoader height="3rem" />
      </div>
    </div>
  </div>
);

export const SearchResultsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <RecipeCardSkeleton key={index} />
      ))}
    </div>
  </div>
);