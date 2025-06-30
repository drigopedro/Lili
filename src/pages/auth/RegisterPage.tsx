import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signUp(formData.email, formData.password);
      // After successful registration, the App component's routing logic will handle
      // redirecting to the onboarding flow
      navigate('/onboarding');
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to create account' });
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: '#331442' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" showText={false} />
          <h1 className="mt-6 text-3xl font-light text-secondary-400">
            Create your account
          </h1>
          <p className="mt-2 text-gray-300">
            Join thousands improving their nutrition
          </p>
        </div>

        <div className="animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={errors.firstName}
                icon={<User size={20} />}
                autoComplete="given-name"
              />

              <Input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={errors.lastName}
                icon={<User size={20} />}
                autoComplete="family-name"
              />
            </div>

            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              icon={<Mail size={20} />}
              autoComplete="email"
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              icon={<Lock size={20} />}
              autoComplete="new-password"
            />

            <Input
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              icon={<Lock size={20} />}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-secondary-400 hover:text-secondary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};