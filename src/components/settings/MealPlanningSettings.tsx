import React, { useState } from 'react';
import { Clock, Users, PoundSterling, Save, ChefHat } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { MealPlanningSettings } from '../../types/settings';

interface MealPlanningSettingsProps {
  settings: MealPlanningSettings | null;
  onUpdate: (updates: Partial<MealPlanningSettings>) => Promise<boolean>;
}

export const MealPlanningSettings: React.FC<MealPlanningSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    weekly_meal_frequency: settings?.weekly_meal_frequency ?? 21,
    preferred_meal_times: settings?.preferred_meal_times ?? {
      breakfast: "08:00",
      lunch: "13:00",
      dinner: "19:00",
    },
    cooking_time_preference: settings?.cooking_time_preference ?? 'moderate',
    household_size: settings?.household_size ?? 2,
    weekly_budget_pounds: settings?.weekly_budget_pounds ?? 50.00,
    meal_budget_pounds: settings?.meal_budget_pounds ?? 8.00,
    batch_cooking_enabled: settings?.batch_cooking_enabled ?? false,
    batch_cooking_days: settings?.batch_cooking_days ?? [],
    auto_generate_shopping_list: settings?.auto_generate_shopping_list ?? true,
    include_snacks: settings?.include_snacks ?? true,
    portion_size_preference: settings?.portion_size_preference ?? 'standard',
  });
  const [loading, setLoading] = useState(false);

  const cookingTimeOptions = [
    { value: 'quick', label: 'Quick (15-30 min)', description: 'Fast and simple meals' },
    { value: 'moderate', label: 'Moderate (30-60 min)', description: 'Balanced cooking time' },
    { value: 'long', label: 'Long (60+ min)', description: 'Elaborate cooking sessions' },
    { value: 'any', label: 'Any', description: 'No preference' },
  ];

  const portionSizeOptions = [
    { value: 'small', label: 'Small portions', description: 'Smaller than average servings' },
    { value: 'standard', label: 'Standard portions', description: 'Regular serving sizes' },
    { value: 'large', label: 'Large portions', description: 'Bigger than average servings' },
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMealTimeChange = (meal: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_meal_times: {
        ...prev.preferred_meal_times,
        [meal]: time,
      },
    }));
  };

  const toggleBatchCookingDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      batch_cooking_days: prev.batch_cooking_days.includes(day)
        ? prev.batch_cooking_days.filter(d => d !== day)
        : [...prev.batch_cooking_days, day],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Meal Frequency & Timing */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Meal Frequency & Timing</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Weekly Meal Frequency
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="7"
                max="35"
                value={formData.weekly_meal_frequency}
                onChange={(e) => handleInputChange('weekly_meal_frequency', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-medium w-16 text-center">
                {formData.weekly_meal_frequency} meals
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Total meals per week (including snacks)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Preferred Meal Times
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Breakfast</label>
                <input
                  type="time"
                  value={formData.preferred_meal_times.breakfast}
                  onChange={(e) => handleMealTimeChange('breakfast', e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Lunch</label>
                <input
                  type="time"
                  value={formData.preferred_meal_times.lunch}
                  onChange={(e) => handleMealTimeChange('lunch', e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dinner</label>
                <input
                  type="time"
                  value={formData.preferred_meal_times.dinner}
                  onChange={(e) => handleMealTimeChange('dinner', e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cooking Preferences */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cooking Preferences</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Cooking Time Preference
            </label>
            <div className="space-y-3">
              {cookingTimeOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.cooking_time_preference === option.value
                      ? 'border-secondary-400 bg-secondary-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="cooking_time"
                    value={option.value}
                    checked={formData.cooking_time_preference === option.value}
                    onChange={(e) => handleInputChange('cooking_time_preference', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-gray-400 text-sm">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Portion Size Preference
            </label>
            <div className="space-y-3">
              {portionSizeOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.portion_size_preference === option.value
                      ? 'border-secondary-400 bg-secondary-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="portion_size"
                    value={option.value}
                    checked={formData.portion_size_preference === option.value}
                    onChange={(e) => handleInputChange('portion_size_preference', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-gray-400 text-sm">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Household & Budget */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Household & Budget</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Household Size"
              type="number"
              min="1"
              max="12"
              value={formData.household_size}
              onChange={(e) => handleInputChange('household_size', parseInt(e.target.value) || 1)}
              icon={<Users size={20} />}
            />
            <Input
              label="Weekly Budget (£)"
              type="number"
              min="10"
              max="500"
              step="5"
              value={formData.weekly_budget_pounds}
              onChange={(e) => handleInputChange('weekly_budget_pounds', parseFloat(e.target.value) || 0)}
              icon={<PoundSterling size={20} />}
            />
          </div>

          <Input
            label="Average Meal Budget (£)"
            type="number"
            min="2"
            max="50"
            step="0.50"
            value={formData.meal_budget_pounds}
            onChange={(e) => handleInputChange('meal_budget_pounds', parseFloat(e.target.value) || 0)}
            icon={<PoundSterling size={20} />}
          />
        </div>
      </div>

      {/* Batch Cooking */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Batch Cooking</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Enable Batch Cooking</h4>
              <p className="text-gray-400 text-sm">Cook larger quantities for multiple meals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.batch_cooking_enabled}
                onChange={(e) => handleInputChange('batch_cooking_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>

          {formData.batch_cooking_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Batch Cooking Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleBatchCookingDay(day)}
                    className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                      formData.batch_cooking_days.includes(day)
                        ? 'bg-secondary-400 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Additional Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Auto-generate Shopping Lists</h4>
              <p className="text-gray-400 text-sm">Automatically create shopping lists from meal plans</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_generate_shopping_list}
                onChange={(e) => handleInputChange('auto_generate_shopping_list', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Include Snacks</h4>
              <p className="text-gray-400 text-sm">Include healthy snacks in meal planning</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.include_snacks}
                onChange={(e) => handleInputChange('include_snacks', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        loading={loading}
        className="w-full flex items-center gap-2"
      >
        <Save size={16} />
        Save Meal Planning Settings
      </Button>
    </div>
  );
};