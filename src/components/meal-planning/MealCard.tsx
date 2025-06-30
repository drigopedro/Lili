import React, { useState } from 'react';
import { Clock, ChefHat, Star, Check, MoreVertical, Scale } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Meal } from '../../types/meal-planning';

interface MealCardProps {
  meal: Meal;
  onComplete?: (mealId: string, rating?: number) => void;
  onScale?: (mealId: string, factor: number) => void;
  onSwap?: (mealId: string) => void;
  isDraggable?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onComplete,
  onScale,
  onSwap,
  isDraggable = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [showScaling, setShowScaling] = useState(false);

  const handleComplete = () => {
    if (meal.completed) return;
    setShowRating(true);
  };

  const submitRating = () => {
    if (onComplete) {
      onComplete(meal.id, rating);
    }
    setShowRating(false);
    setRating(0);
  };

  const handleScale = () => {
    if (onScale) {
      onScale(meal.id, scaleFactor);
    }
    setShowScaling(false);
    setScaleFactor(1);
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMealTypeColor = (type: string) => {
    const colors = {
      breakfast: 'text-yellow-400',
      lunch: 'text-green-400',
      dinner: 'text-blue-400',
      snack: 'text-purple-400',
    };
    return colors[type as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div 
      className={`bg-white rounded-2xl p-4 shadow-lg transition-all duration-200 hover:shadow-xl ${
        meal.completed ? 'opacity-75' : 'hover:scale-[1.02]'
      } ${isDraggable ? 'cursor-move' : ''}`}
      draggable={isDraggable}
    >
      {/* Meal Image */}
      <div className="relative mb-4">
        <img
          src={meal.image_url}
          alt={meal.name}
          className="w-full h-32 object-cover rounded-xl"
        />
        {meal.completed && (
          <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center">
            <div className="bg-green-500 rounded-full p-2">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {showActions && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[120px] z-10">
              <button
                onClick={() => setShowScaling(true)}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Scale size={16} />
                Scale
              </button>
              {onSwap && (
                <button
                  onClick={() => onSwap(meal.id)}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Swap Meal
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meal Info */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium capitalize ${getMealTypeColor(meal.type)}`}>
              {meal.type}
            </span>
            <span className="text-sm text-gray-500">
              {formatTime(meal.scheduled_time)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {meal.name}
          </h3>
        </div>

        {/* Meal Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium text-orange-500">{meal.calories}</span>
            <span>cal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ChefHat size={14} />
              <span>{meal.prep_time}m prep</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{meal.cook_time}m cook</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!meal.completed && (
          <Button
            onClick={handleComplete}
            variant="primary"
            size="sm"
            className="w-full"
          >
            Mark as Complete
          </Button>
        )}

        {meal.completed && meal.rating && (
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={`${
                  star <= meal.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How was your meal?
            </h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowRating(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitRating}
                disabled={rating === 0}
                className="flex-1"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scaling Modal */}
      {showScaling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Scale Recipe
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Servings:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setScaleFactor(Math.max(0.5, scaleFactor - 0.5))}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-medium w-8 text-center">{scaleFactor}x</span>
                  <button
                    onClick={() => setScaleFactor(Math.min(4, scaleFactor + 0.5))}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Adjusted calories: {Math.round(meal.calories * scaleFactor)}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowScaling(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScale}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};