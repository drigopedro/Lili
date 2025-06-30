import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from './ProgressBar';
import type { OnboardingData } from '../../types/onboarding';

interface LifestyleStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const LifestyleStep: React.FC<LifestyleStepProps> = ({ data, onNext, onBack }) => {
  const [lifestyleFactors, setLifestyleFactors] = useState<string[]>(data.lifestyleFactors || []);
  const [cookingExperience, setCookingExperience] = useState<string>(data.cookingExperience || '');
  const [timeAvailable, setTimeAvailable] = useState<string>(data.timeAvailable || '');

  const factors = [
    'Busy Schedule', 'Work from Home', 'Frequent Travel', 'Family Meals',
    'Limited Kitchen Space', 'Budget Conscious', 'Meal Prep Enthusiast', 'Social Eater'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Basic cooking skills' },
    { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with most recipes' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced home cook' },
  ];

  const timeOptions = [
    { value: 'minimal', label: 'Minimal (15-30 min)', description: 'Quick and easy meals' },
    { value: 'moderate', label: 'Moderate (30-60 min)', description: 'Some cooking time' },
    { value: 'plenty', label: 'Plenty (60+ min)', description: 'Love spending time cooking' },
  ];

  const toggleFactor = (factor: string) => {
    if (lifestyleFactors.includes(factor)) {
      setLifestyleFactors(lifestyleFactors.filter(f => f !== factor));
    } else {
      setLifestyleFactors([...lifestyleFactors, factor]);
    }
  };

  const handleNext = () => {
    onNext({ 
      lifestyleFactors,
      cookingExperience: cookingExperience as OnboardingData['cookingExperience'],
      timeAvailable: timeAvailable as OnboardingData['timeAvailable']
    });
  };

  const isValid = cookingExperience && timeAvailable;

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
          <ProgressBar currentStep={4} totalSteps={6} />
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-secondary-400 mb-2">
          Lifestyle & Cooking
        </h1>
        <p className="text-gray-300 mb-8">
          Help us understand your cooking style and available time
        </p>

        <div className="space-y-8">
          {/* Lifestyle Factors */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">What describes your lifestyle?</h2>
            <div className="grid grid-cols-2 gap-3">
              {factors.map((factor) => (
                <button
                  key={factor}
                  onClick={() => toggleFactor(factor)}
                  className={`px-3 py-3 rounded-xl border-2 text-sm transition-all duration-200 ${
                    lifestyleFactors.includes(factor)
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Experience */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Cooking Experience</h2>
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setCookingExperience(level.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    cookingExperience === level.value
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm opacity-70">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Available */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Time Available for Cooking</h2>
            <div className="space-y-3">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeAvailable(option.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    timeAvailable === option.value
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