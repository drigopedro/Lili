import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

export const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await resetPassword(email);
      setSent(true);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: '#331442' }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Logo size="md" showText={false} />
          <div className="mt-8 bg-secondary-400/10 border border-secondary-400/20 rounded-xl p-6">
            <h2 className="text-2xl font-light text-secondary-400 mb-4">
              Check your email
            </h2>
            <p className="text-gray-300 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center text-secondary-400 hover:text-secondary-300 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: '#331442' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" showText={false} />
          <h1 className="mt-6 text-3xl font-light text-secondary-400">
            Reset your password
          </h1>
          <p className="mt-2 text-gray-300">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              autoComplete="email"
              autoFocus
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};