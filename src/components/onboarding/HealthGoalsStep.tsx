import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from './ProgressBar';
import type { OnboardingData } from '../../types/onboarding';

interface HealthGoalsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const HealthGoalsStep: React.FC<HealthGoalsStepProps> = ({ data, onNext, onBack }) => {
  const [healthGoals, setHealthGoals] = useState<string[]>(data.healthGoals || []);
  const [activityLevel, setActivityLevel] = useState<string>(data.activityLevel || '');

  const goals = [
    'Weight Loss', 'Weight Gain', 'Muscle Building', 'Improved Energy',
    'Better Digestion', 'Heart Health', 'Blood Sugar Control', 'General Wellness'
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'lightly-active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: 'moderately-active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { value: 'very-active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { value: 'extremely-active', label: 'Extremely Active', description: 'Very hard exercise, physical job' },
  ];

  const toggleGoal = (goal: string) => {
    if (healthGoals.includes(goal)) {
      setHealthGoals(healthGoals.filter(g => g !== goal));
    } else {
      setHealthGoals([...healthGoals, goal]);
    }
  };

  const handleNext = () => {
    if (healthGoals.length > 0 && activityLevel) {
      onNext({ 
        healthGoals,
        activityLevel: activityLevel as OnboardingData['activityLevel']
      });
    }
  };

  const isValid = healthGoals.length > 0 && activityLevel;

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
          <ProgressBar currentStep={3} totalSteps={6} />
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-secondary-400 mb-2">
          Health Goals
        </h1>
        <p className="text-gray-300 mb-8">
          Tell us what you'd like to achieve with your nutrition
        </p>

        <div className="space-y-8">
          {/* Health Goals */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">What are your main health goals?</h2>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`px-3 py-3 rounded-xl border-2 text-sm transition-all duration-200 ${
                    healthGoals.includes(goal)
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Activity Level</h2>
            <div className="space-y-3">
              {activityLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setActivityLevel(level.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    activityLevel === level.value
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