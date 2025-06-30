import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from './ProgressBar';
import type { OnboardingData } from '../../types/onboarding';

interface PreferencesStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, onNext, onBack }) => {
  const [cuisineTypes, setCuisineTypes] = useState<string[]>(data.cuisineTypes || []);
  const [cookingTimePreference, setCookingTimePreference] = useState<string>(data.cookingTimePreference || '');
  const [mealComplexity, setMealComplexity] = useState<string>(data.mealComplexity || '');
  const [budgetRange, setBudgetRange] = useState<string>(data.budgetRange || '');

  const cuisines = [
    'Mediterranean', 'Asian', 'Mexican', 'Italian', 'American', 'Indian',
    'Middle Eastern', 'French', 'Thai', 'Japanese', 'Greek', 'Spanish'
  ];

  const timePreferences = [
    { value: 'quick', label: 'Quick (15-30 min)', description: 'Fast and simple meals' },
    { value: 'moderate', label: 'Moderate (30-60 min)', description: 'Balanced cooking time' },
    { value: 'long', label: 'Long (60+ min)', description: 'Elaborate cooking sessions' },
    { value: 'any', label: 'Any', description: 'No preference' },
  ];

  const complexityOptions = [
    { value: 'simple', label: 'Simple', description: 'Basic recipes with few ingredients' },
    { value: 'moderate', label: 'Moderate', description: 'Standard recipes with some techniques' },
    { value: 'complex', label: 'Complex', description: 'Advanced recipes with multiple steps' },
    { value: 'any', label: 'Any', description: 'No preference' },
  ];

  const budgetOptions = [
    { value: 'low', label: 'Budget-Friendly', description: 'Cost-effective ingredients' },
    { value: 'medium', label: 'Moderate', description: 'Balanced cost and quality' },
    { value: 'high', label: 'Premium', description: 'High-quality ingredients' },
    { value: 'any', label: 'Any', description: 'No budget constraints' },
  ];

  const toggleCuisine = (cuisine: string) => {
    if (cuisineTypes.includes(cuisine)) {
      setCuisineTypes(cuisineTypes.filter(c => c !== cuisine));
    } else {
      setCuisineTypes([...cuisineTypes, cuisine]);
    }
  };

  const handleNext = () => {
    onNext({ 
      cuisineTypes,
      cookingTimePreference: cookingTimePreference as OnboardingData['cookingTimePreference'],
      mealComplexity: mealComplexity as OnboardingData['mealComplexity'],
      budgetRange: budgetRange as OnboardingData['budgetRange']
    });
  };

  const isValid = cookingTimePreference && mealComplexity && budgetRange;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 mx-4">
          <ProgressBar currentStep={5} totalSteps={6} />
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-secondary-400 mb-2">
          Food Preferences
        </h1>
        <p className="text-gray-300 mb-8">
          Tell us about your favorite cuisines and cooking preferences
        </p>

        <div className="space-y-8">
          {/* Cuisine Types */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Favorite Cuisines</h2>
            <div className="grid grid-cols-2 gap-3">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`px-3 py-3 rounded-xl border-2 text-sm transition-all duration-200 ${
                    cuisineTypes.includes(cuisine)
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Time Preference */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Cooking Time Preference</h2>
            <div className="space-y-3">
              {timePreferences.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCookingTimePreference(option.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    cookingTimePreference === option.value
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-70">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Complexity */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Meal Complexity</h2>
            <div className="space-y-3">
              {complexityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMealComplexity(option.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    mealComplexity === option.value
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-70">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Budget Range</h2>
            <div className="space-y-3">
              {budgetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBudgetRange(option.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    budgetRange === option.value
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-70">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};