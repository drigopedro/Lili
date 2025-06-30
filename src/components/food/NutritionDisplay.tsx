import React from 'react';
import { Activity, Zap } from 'lucide-react';

interface NutritionDisplayProps {
  nutrition: {
    calories: string;
    protein: string;
    carbohydrate: string;
    fat: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
  };
  servingDescription?: string;
}

export const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ 
  nutrition, 
  servingDescription 
}) => {
  const macros = [
    { label: 'Protein', value: nutrition.protein, unit: 'g', color: 'text-blue-400' },
    { label: 'Carbs', value: nutrition.carbohydrate, unit: 'g', color: 'text-green-400' },
    { label: 'Fat', value: nutrition.fat, unit: 'g', color: 'text-yellow-400' },
  ];

  const micronutrients = [
    { label: 'Fiber', value: nutrition.fiber, unit: 'g' },
    { label: 'Sugar', value: nutrition.sugar, unit: 'g' },
    { label: 'Sodium', value: nutrition.sodium, unit: 'mg' },
  ].filter(item => item.value && parseFloat(item.value) > 0);

  return (
    <div className="bg-primary-800/50 border border-primary-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-secondary-400" />
        <h3 className="text-lg font-semibold text-white">Nutrition Facts</h3>
      </div>

      {servingDescription && (
        <p className="text-sm text-gray-400 mb-4">Per {servingDescription}</p>
      )}

      {/* Calories */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary-700/50">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          <span className="font-medium text-white">Calories</span>
        </div>
        <span className="text-xl font-bold text-orange-400">
          {parseFloat(nutrition.calories).toFixed(0)}
        </span>
      </div>

      {/* Macronutrients */}
      <div className="space-y-3 mb-4">
        {macros.map((macro) => (
          <div key={macro.label} className="flex items-center justify-between">
            <span className="text-gray-300">{macro.label}</span>
            <span className={`font-medium ${macro.color}`}>
              {parseFloat(macro.value).toFixed(1)}{macro.unit}
            </span>
          </div>
        ))}
      </div>

      {/* Micronutrients */}
      {micronutrients.length > 0 && (
        <div className="pt-4 border-t border-primary-700/50">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Other Nutrients</h4>
          <div className="space-y-2">
            {micronutrients.map((nutrient) => (
              <div key={nutrient.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{nutrient.label}</span>
                <span className="text-gray-300">
                  {parseFloat(nutrient.value!).toFixed(1)}{nutrient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};