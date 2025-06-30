import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from './ProgressBar';
import type { OnboardingData } from '../../types/onboarding';

interface ReviewStepProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onComplete, onBack }) => {
  const sections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Age Range', value: data.ageRange },
        { label: 'Gender', value: data.gender },
      ]
    },
    {
      title: 'Health Profile',
      items: [
        { label: 'Health Conditions', value: data.healthConditions?.join(', ') || 'None' },
        { label: 'Allergies', value: data.allergies?.join(', ') || 'None' },
        { label: 'Medications', value: data.medications?.join(', ') || 'None' },
      ]
    },
    {
      title: 'Goals & Activity',
      items: [
        { label: 'Health Goals', value: data.healthGoals?.join(', ') || 'None' },
        { label: 'Activity Level', value: data.activityLevel },
      ]
    },
    {
      title: 'Lifestyle',
      items: [
        { label: 'Lifestyle Factors', value: data.lifestyleFactors?.join(', ') || 'None' },
        { label: 'Cooking Experience', value: data.cookingExperience },
        { label: 'Time Available', value: data.timeAvailable },
      ]
    },
    {
      title: 'Food Preferences',
      items: [
        { label: 'Favorite Cuisines', value: data.cuisineTypes?.join(', ') || 'None' },
        { label: 'Cooking Time', value: data.cookingTimePreference },
        { label: 'Meal Complexity', value: data.mealComplexity },
        { label: 'Budget Range', value: data.budgetRange },
      ]
    }
  ];

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
          <ProgressBar currentStep={6} totalSteps={6} />
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-secondary-400 mb-2">
          Review & Complete
        </h1>
        <p className="text-gray-300 mb-8">
          Review your information and complete your profile setup
        </p>

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-primary-800/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-start">
                    <span className="text-gray-400 text-sm">{item.label}:</span>
                    <span className="text-white text-sm text-right flex-1 ml-2 capitalize">
                      {item.value || 'Not specified'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-secondary-400/10 border border-secondary-400/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-secondary-400" />
            <span className="text-secondary-400 font-medium">Ready to start!</span>
          </div>
          <p className="text-gray-300 text-sm">
            We'll use this information to create personalized meal recommendations just for you.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={onComplete}
          className="w-full"
          size="lg"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
};