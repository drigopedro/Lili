import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#331442' }}>
      <div className="text-center animate-fade-in">
        <Logo size="xl" showText={true} />
        <div className="mt-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};