import React from 'react';
import { Activity, Target, TrendingUp } from 'lucide-react';
import type { NutritionSummary as NutritionSummaryType } from '../../types/meal-planning';

interface NutritionSummaryProps {
  nutrition: NutritionSummaryType;
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  title?: string;
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  nutrition,
  targets,
  title = "Nutrition Summary"
}) => {
  const macros = [
    {
      name: 'Protein',
      value: nutrition.protein,
      target: targets?.protein,
      unit: 'g',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400',
    },
    {
      name: 'Carbs',
      value: nutrition.carbs,
      target: targets?.carbs,
      unit: 'g',
      color: 'text-green-400',
      bgColor: 'bg-green-400',
    },
    {
      name: 'Fat',
      value: nutrition.fat,
      target: targets?.fat,
      unit: 'g',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400',
    },
  ];

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-secondary-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Calories */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Calories</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-secondary-400">
              {Math.round(nutrition.calories)}
            </span>
            {targets?.calories && (
              <span className="text-gray-400">/ {targets.calories}</span>
            )}
          </div>
        </div>
        {targets?.calories && (
          <div className="w-full bg-primary-700 rounded-full h-2">
            <div
              className="bg-secondary-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(nutrition.calories, targets.calories)}%` }}
            />
          </div>
        )}
      </div>

      {/* Macronutrients */}
      <div className="space-y-4 mb-6">
        {macros.map((macro) => {
          const percentage = getProgressPercentage(macro.value, macro.target);
          return (
            <div key={macro.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">{macro.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${macro.color}`}>
                    {Math.round(macro.value)}{macro.unit}
                  </span>
                  {macro.target && (
                    <>
                      <span className="text-gray-400">/ {macro.target}{macro.unit}</span>
                      <span className={`text-sm ${getProgressColor(percentage)}`}>
                        {Math.round(percentage)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              {macro.target && (
                <div className="w-full bg-primary-700 rounded-full h-1.5">
                  <div
                    className={`${macro.bgColor} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Nutrients */}
      <div className="pt-4 border-t border-primary-700/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Fiber</span>
            <span className="text-gray-300">{Math.round(nutrition.fiber)}g</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Sugar</span>
            <span className="text-gray-300">{Math.round(nutrition.sugar)}g</span>
          </div>
          <div className="flex items-center justify-between col-span-2">
            <span className="text-gray-400">Sodium</span>
            <span className="text-gray-300">{Math.round(nutrition.sodium)}mg</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {targets && (
        <div className="mt-4 pt-4 border-t border-primary-700/50">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-secondary-400" />
            <span className="text-sm text-gray-400">
              Daily targets progress
            </span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
        </div>
      )}
    </div>
  );
};