import React from 'react';
import { Button } from '../ui/Button';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative food illustrations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-8 w-16 h-16 bg-green-400 rounded-full opacity-20"></div>
        <div className="absolute top-40 left-12 w-12 h-12 bg-orange-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-32 right-16 w-20 h-20 bg-purple-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-48 left-8 w-14 h-14 bg-yellow-400 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-secondary-400 mb-4">
          Welcome to Lili
        </h1>
        
        <p className="text-lg text-gray-300 mb-8">
          Join Lili and start your personalised nutrition journey
        </p>

        <div className="space-y-6 mb-12">
          <div className="text-left">
            <h2 className="text-xl font-semibold text-white mb-4">
              Let's create a personalised nutrition plan that fits your unique lifestyle, health goals, and preferences.
            </h2>
            
            <p className="text-gray-300 mb-6">
              This quick setup will help us understand your needs so we can provide the best meal recommendations for you.
            </p>
          </div>
        </div>

        <Button
          onClick={onNext}
          className="w-full mb-4"
          size="lg"
        >
          Get Started
        </Button>

        <p className="text-sm text-gray-400">
          Takes about 3-5 minutes to complete
        </p>
      </div>
    </div>
  );
};