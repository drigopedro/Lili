import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from './ProgressBar';
import type { OnboardingData } from '../../types/onboarding';

interface AgeGenderStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const AgeGenderStep: React.FC<AgeGenderStepProps> = ({ data, onNext, onBack }) => {
  const [ageRange, setAgeRange] = useState<string>(data.ageRange || '');
  const [gender, setGender] = useState<string>(data.gender || '');

  const ageRanges = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
  const genders = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const handleNext = () => {
    if (ageRange && gender) {
      onNext({ 
        ageRange: ageRange as OnboardingData['ageRange'], 
        gender: gender as OnboardingData['gender'] 
      });
    }
  };

  const isValid = ageRange && gender;

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
          <ProgressBar currentStep={1} totalSteps={6} />
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-secondary-400 mb-2">
          Tell us about yourself
        </h1>
        <p className="text-gray-300 mb-8">
          Join Lili and start your personalised nutrition journey
        </p>

        <div className="space-y-8">
          {/* Age Range */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Age Range</h2>
            <div className="grid grid-cols-3 gap-3">
              {ageRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setAgeRange(range)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    ageRange === range
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Gender</h2>
            <div className="space-y-3">
              {genders.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGender(option.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    gender === option.value
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {option.label}
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