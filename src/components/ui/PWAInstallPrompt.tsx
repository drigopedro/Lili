import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { Button } from './Button';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-secondary-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            Install Lili App
          </h3>
          <p className="text-gray-600 text-xs mb-3 leading-relaxed">
            Add Lili to your home screen for quick access to your meal plans and recipes.
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex items-center gap-1 text-xs px-3 py-2"
            >
              <Download size={14} />
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};