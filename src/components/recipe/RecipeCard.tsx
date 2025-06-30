import React, { useState } from 'react';
import { Clock, ChefHat, Users, Heart, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Recipe } from '../../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onView?: (recipe: Recipe) => void;
  onSave?: (recipe: Recipe) => void;
  onUnsave?: (recipe: Recipe) => void;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onView,
  onSave,
  onUnsave,
  isSaved = false,
  showSaveButton = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved && onUnsave) {
      onUnsave(recipe);
    } else if (!isSaved && onSave) {
      onSave(recipe);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-400',
      medium: 'text-yellow-400',
      hard: 'text-red-400',
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-400';
  };

  const getDefaultImage = () => {
    return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
      onClick={() => onView?.(recipe)}
    >
      {/* Recipe Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={imageError ? getDefaultImage() : (recipe.image_url || getDefaultImage())}
          alt={recipe.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        
        {/* Save Button */}
        {showSaveButton && (
          <button
            onClick={handleSaveToggle}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isSaved 
                ? 'bg-red-500 text-white' 
                : 'bg-black/30 text-white hover:bg-black/50'
            }`}
          >
            <Heart 
              size={20} 
              className={isSaved ? 'fill-current' : ''} 
            />
          </button>
        )}

        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-white`}>
            {recipe.difficulty}
          </span>
        </div>

        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Recipe Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {recipe.name}
          </h3>
          {recipe.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Recipe Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{recipe.prep_time + recipe.cook_time}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-orange-500">
              {recipe.nutrition.calories}
            </span>
            <span>cal</span>
          </div>
        </div>

        {/* Cuisine & Tags */}
        {(recipe.cuisine_type || recipe.tags?.length) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.cuisine_type && (
              <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs">
                {recipe.cuisine_type}
              </span>
            )}
            {recipe.tags?.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onView?.(recipe);
          }}
          variant="primary"
          size="sm"
          className="w-full"
        >
          View Recipe
        </Button>
      </div>
    </div>
  );
};