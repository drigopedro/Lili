import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, ShoppingCart } from 'lucide-react';
import { MealCard } from './MealCard';
import { Button } from '../ui/Button';
import type { WeeklyMealPlan, DailyMealPlan } from '../../types/meal-planning';

interface WeeklyMealPlanProps {
  mealPlan: WeeklyMealPlan | null;
  onComplete?: (mealId: string, rating?: number) => void;
  onScale?: (mealId: string, factor: number) => void;
  onSwap?: (fromMealId: string, toMealId: string) => void;
  onGenerateNew?: () => void;
  onGenerateGroceryList?: () => void;
}

export const WeeklyMealPlan: React.FC<WeeklyMealPlanProps> = ({
  mealPlan,
  onComplete,
  onScale,
  onSwap,
  onGenerateNew,
  onGenerateGroceryList,
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [swapMode, setSwapMode] = useState(false);
  const [selectedMealForSwap, setSelectedMealForSwap] = useState<string | null>(null);

  if (!mealPlan) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <RotateCcw className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No meal plan available</h3>
        <p className="text-gray-400 mb-4">
          Generate a weekly meal plan to get started
        </p>
        {onGenerateNew && (
          <Button onClick={onGenerateNew} variant="primary">
            Generate Meal Plan
          </Button>
        )}
      </div>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = mealPlan.daily_plans[selectedDay];

  const handleMealSwap = (mealId: string) => {
    if (!swapMode) {
      setSwapMode(true);
      setSelectedMealForSwap(mealId);
    } else {
      if (selectedMealForSwap && selectedMealForSwap !== mealId && onSwap) {
        onSwap(selectedMealForSwap, mealId);
      }
      setSwapMode(false);
      setSelectedMealForSwap(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalCalories = () => {
    return mealPlan.daily_plans.reduce((total, day) => total + day.total_calories, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Weekly Meal Plan</h2>
          <p className="text-gray-400">
            Week of {formatDate(mealPlan.week_starting)} • {getTotalCalories()} total calories
          </p>
        </div>
        <div className="flex gap-2">
          {onGenerateGroceryList && (
            <Button
              onClick={onGenerateGroceryList}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              Grocery List
            </Button>
          )}
          {onGenerateNew && (
            <Button
              onClick={onGenerateNew}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
          disabled={selectedDay === 0}
          className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2 overflow-x-auto">
          {mealPlan.daily_plans.map((day, index) => {
            const date = new Date(day.date);
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const isSelected = index === selectedDay;

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(index)}
                className={`flex flex-col items-center px-4 py-3 rounded-xl transition-all duration-200 min-w-[80px] ${
                  isSelected
                    ? 'bg-secondary-400 text-white'
                    : isToday
                    ? 'bg-secondary-400/20 text-secondary-400 border border-secondary-400/30'
                    : 'bg-primary-800/50 text-gray-300 hover:bg-primary-800/70'
                }`}
              >
                <span className="text-xs font-medium">
                  {weekDays[date.getDay()]}
                </span>
                <span className="text-lg font-semibold">
                  {date.getDate()}
                </span>
                <span className="text-xs opacity-70">
                  {day.total_calories} cal
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedDay(Math.min(mealPlan.daily_plans.length - 1, selectedDay + 1))}
          disabled={selectedDay === mealPlan.daily_plans.length - 1}
          className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Swap Mode Indicator */}
      {swapMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">
            Swap mode active. Select another meal to swap with.
          </p>
          <Button
            onClick={() => {
              setSwapMode(false);
              setSelectedMealForSwap(null);
            }}
            variant="ghost"
            size="sm"
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Daily Meals */}
      {currentDay && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {new Date(currentDay.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <div className="text-sm text-gray-400">
              {currentDay.total_calories} calories
            </div>
          </div>

          {currentDay.meals.length > 0 ? (
            <div className="grid gap-4">
              {currentDay.meals
                .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
                .map((meal) => (
                  <div
                    key={meal.id}
                    className={`${
                      swapMode && selectedMealForSwap === meal.id
                        ? 'ring-2 ring-yellow-400'
                        : ''
                    }`}
                  >
                    <MealCard
                      meal={meal}
                      onComplete={onComplete}
                      onScale={onScale}
                      onSwap={handleMealSwap}
                      isDraggable={true}
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No meals planned for this day</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};