import React, { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from './ProgressBar';
import type { OnboardingData } from '../../types/onboarding';

interface HealthProfileStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const HealthProfileStep: React.FC<HealthProfileStepProps> = ({ data, onNext, onBack }) => {
  const [healthConditions, setHealthConditions] = useState<string[]>(data.healthConditions || []);
  const [allergies, setAllergies] = useState<string[]>(data.allergies || []);
  const [medications, setMedications] = useState<string[]>(data.medications || []);
  const [customCondition, setCustomCondition] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customMedication, setCustomMedication] = useState('');

  const commonConditions = [
    'Diabetes', 'High Blood Pressure', 'High Cholesterol', 'Heart Disease',
    'Thyroid Issues', 'PCOS', 'Celiac Disease', 'IBS'
  ];

  const commonAllergies = [
    'Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'Sesame'
  ];

  const toggleItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomItem = (custom: string, list: string[], setList: (list: string[]) => void, setCustom: (value: string) => void) => {
    if (custom.trim() && !list.includes(custom.trim())) {
      setList([...list, custom.trim()]);
      setCustom('');
    }
  };

  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  const handleNext = () => {
    onNext({ 
      healthConditions,
      allergies,
      medications
    });
  };

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
          <ProgressBar currentStep={2} totalSteps={6} />
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-secondary-400 mb-2">
          Health Profile
        </h1>
        <p className="text-gray-300 mb-8">
          Helps us understand your health conditions and dietary restrictions for safer, more effective recommendations.
        </p>

        <div className="space-y-8">
          {/* Health Conditions */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Health Conditions</h2>
            <p className="text-sm text-gray-400 mb-4">Select any that apply to you</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {commonConditions.map((condition) => (
                <button
                  key={condition}
                  onClick={() => toggleItem(condition, healthConditions, setHealthConditions)}
                  className={`px-3 py-2 rounded-xl border-2 text-sm transition-all duration-200 ${
                    healthConditions.includes(condition)
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="Add other conditions"
                className="flex-1 px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem(customCondition, healthConditions, setHealthConditions, setCustomCondition)}
              />
              <button
                onClick={() => addCustomItem(customCondition, healthConditions, setHealthConditions, setCustomCondition)}
                className="p-2 border-2 border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Selected conditions */}
            {healthConditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {healthConditions.map((condition) => (
                  <span
                    key={condition}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-400/20 text-secondary-400 rounded-full text-sm"
                  >
                    {condition}
                    <button
                      onClick={() => removeItem(condition, healthConditions, setHealthConditions)}
                      className="hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Allergies & Intolerances */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Allergies & Intolerances</h2>
            <p className="text-sm text-gray-400 mb-4">Select foods you must avoid</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {commonAllergies.map((allergy) => (
                <button
                  key={allergy}
                  onClick={() => toggleItem(allergy, allergies, setAllergies)}
                  className={`px-3 py-2 rounded-xl border-2 text-sm transition-all duration-200 ${
                    allergies.includes(allergy)
                      ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {allergy}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                placeholder="Add other allergy"
                className="flex-1 px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem(customAllergy, allergies, setAllergies, setCustomAllergy)}
              />
              <button
                onClick={() => addCustomItem(customAllergy, allergies, setAllergies, setCustomAllergy)}
                className="p-2 border-2 border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Selected allergies */}
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-400/20 text-secondary-400 rounded-full text-sm"
                  >
                    {allergy}
                    <button
                      onClick={() => removeItem(allergy, allergies, setAllergies)}
                      className="hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Medications */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Medications</h2>
            <p className="text-sm text-gray-400 mb-4">Some medications can interact with certain foods</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={customMedication}
                onChange={(e) => setCustomMedication(e.target.value)}
                placeholder="Add medication"
                className="flex-1 px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem(customMedication, medications, setMedications, setCustomMedication)}
              />
              <button
                onClick={() => addCustomItem(customMedication, medications, setMedications, setCustomMedication)}
                className="p-2 border-2 border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Selected medications */}
            {medications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {medications.map((medication) => (
                  <span
                    key={medication}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-400/20 text-secondary-400 rounded-full text-sm"
                  >
                    {medication}
                    <button
                      onClick={() => removeItem(medication, medications, setMedications)}
                      className="hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleNext}
          className="w-full"
          size="lg"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};