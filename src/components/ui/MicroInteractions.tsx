import React, { useState } from 'react';
import { Heart, Star, Plus, Check } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'heart' | 'star' | 'add' | 'check';
  isActive?: boolean;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'heart',
  isActive = false,
  className = '',
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick?.();
  };

  const getIcon = () => {
    switch (variant) {
      case 'heart':
        return <Heart className={`w-5 h-5 ${isActive ? 'fill-current text-red-500' : ''}`} />;
      case 'star':
        return <Star className={`w-5 h-5 ${isActive ? 'fill-current text-yellow-400' : ''}`} />;
      case 'add':
        return <Plus className="w-5 h-5" />;
      case 'check':
        return <Check className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden transition-all duration-200 ease-out
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${isActive ? 'text-current' : 'text-gray-400 hover:text-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-pressed={isActive}
    >
      <div className={`transition-transform duration-200 ${isPressed ? 'scale-110' : 'scale-100'}`}>
        {getIcon()}
      </div>
      {children}
      
      {/* Ripple effect */}
      {isPressed && (
        <div className="absolute inset-0 bg-current opacity-20 rounded-full animate-ping" />
      )}
    </button>
  );
};

interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = 'md',
  color = 'bg-secondary-400',
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${color} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-6 right-6 w-14 h-14 bg-secondary-400 text-white rounded-full
        shadow-lg hover:shadow-xl transition-all duration-300 ease-out
        flex items-center justify-center z-50
        ${isHovered ? 'scale-110' : 'scale-100'}
        ${className}
      `}
      aria-label={label}
    >
      <div className={`transition-transform duration-200 ${isHovered ? 'rotate-90' : 'rotate-0'}`}>
        {icon}
      </div>
    </button>
  );
};