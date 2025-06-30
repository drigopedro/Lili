import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useProfile } from '../../hooks/useProfile';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { WelcomeStep } from './WelcomeStep';
import { AgeGenderStep } from './AgeGenderStep';
import { HealthProfileStep } from './HealthProfileStep';
import { HealthGoalsStep } from './HealthGoalsStep';
import { LifestyleStep } from './LifestyleStep';
import { PreferencesStep } from './PreferencesStep';
import { ReviewStep } from './ReviewStep';
import type { OnboardingData } from '../../types/onboarding';

const TOTAL_STEPS = 7;

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const { progress, updateProgress, completeOnboarding, loading } = useOnboarding();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already completed onboarding
    if (profile?.onboardingCompleted) {
      navigate('/dashboard');
      return;
    }

    // Load existing progress
    if (progress) {
      setCurrentStep(progress.currentStep);
      setOnboardingData(progress.stepData);
    }
  }, [progress, profile, navigate]);

  const handleStepComplete = async (stepData: Partial<OnboardingData>) => {
    const updatedData = { ...onboardingData, ...stepData };
    setOnboardingData(updatedData);

    try {
      await updateProgress(currentStep, stepData);
      
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(onboardingData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#331442' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={() => setCurrentStep(1)} />;
      case 1:
        return (
          <AgeGenderStep
            data={onboardingData}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <HealthProfileStep
            data={onboardingData}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <HealthGoalsStep
            data={onboardingData}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <LifestyleStep
            data={onboardingData}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <PreferencesStep
            data={onboardingData}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <ReviewStep
            data={onboardingData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return <WelcomeStep onNext={() => setCurrentStep(1)} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#331442' }}>
      {renderStep()}
    </div>
  );
};