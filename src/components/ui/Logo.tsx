import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src="/Lili-logo.png" 
        alt="Lili Logo" 
        className={`${sizeClasses[size]} object-contain mb-2`}
      />
      {showText && (
        <p className={`text-gray-300 ${textSizeClasses[size]} text-center`}>
          Your personal guide to eating well
        </p>
      )}
    </div>
  );
};