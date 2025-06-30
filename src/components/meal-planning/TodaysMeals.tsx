import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { MealCard } from './MealCard';
import { Button } from '../ui/Button';
import type { Meal } from '../../types/meal-planning';

interface TodaysMealsProps {
  meals: Meal[];
  onComplete?: (mealId: string, rating?: number) => void;
  onScale?: (mealId: string, factor: number) => void;
  onAddMeal?: () => void;
}

export const TodaysMeals: React.FC<TodaysMealsProps> = ({
  meals,
  onComplete,
  onScale,
  onAddMeal,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const completedMeals = meals.filter(meal => meal.completed).length;
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-secondary-400" />
            <h2 className="text-xl font-semibold text-white">Today's Meals</h2>
          </div>
          <p className="text-gray-400">{today}</p>
        </div>
        {onAddMeal && (
          <Button
            onClick={onAddMeal}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Meal
          </Button>
        )}
      </div>

      {/* Progress Summary */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300">Progress</span>
          <span className="text-white font-medium">
            {completedMeals}/{meals.length} meals
          </span>
        </div>
        <div className="w-full bg-primary-700 rounded-full h-2 mb-3">
          <div
            className="bg-secondary-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${meals.length > 0 ? (completedMeals / meals.length) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Calories</span>
          <span className="text-secondary-400 font-medium">{totalCalories} cal</span>
        </div>
      </div>

      {/* Meal Cards */}
      {meals.length > 0 ? (
        <div className="space-y-4">
          {meals
            .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
            .map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onComplete={onComplete}
                onScale={onScale}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No meals planned</h3>
          <p className="text-gray-400 mb-4">
            Generate a meal plan to see your daily meals
          </p>
          {onAddMeal && (
            <Button onClick={onAddMeal} variant="primary">
              Generate Meal Plan
            </Button>
          )}
        </div>
      )}
    </div>
  );
};