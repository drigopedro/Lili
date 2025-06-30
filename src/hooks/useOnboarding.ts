import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import type { OnboardingData } from '../types/onboarding';

export interface OnboardingProgress {
  id: string;
  userId: string;
  currentStep: number;
  completedSteps: number[];
  stepData: OnboardingData;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const useOnboarding = () => {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (user && profile) {
      fetchProgress();
    } else {
      setProgress(null);
      setLoading(false);
    }
  }, [user, profile]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProgress({
          id: data.id,
          userId: data.user_id,
          currentStep: data.current_step,
          completedSteps: data.completed_steps,
          stepData: data.step_data,
          startedAt: data.started_at,
          completedAt: data.completed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (currentStep: number, stepData: Partial<OnboardingData>) => {
    try {
      setError(null);

      // Ensure user profile exists before creating/updating onboarding progress
      if (!profile) {
        throw new Error('User profile must exist before updating onboarding progress');
      }

      const progressData = {
        user_id: user?.id,
        current_step: currentStep + 1, // Move to next step
        completed_steps: [...(progress?.completedSteps || []), currentStep],
        step_data: { ...(progress?.stepData || {}), ...stepData },
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('onboarding_progress')
        .upsert(progressData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProgress({
          id: data.id,
          userId: data.user_id,
          currentStep: data.current_step,
          completedSteps: data.completed_steps,
          stepData: data.step_data,
          startedAt: data.started_at,
          completedAt: data.completed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const completeOnboarding = async (finalData: OnboardingData) => {
    try {
      setError(null);

      // Ensure user profile exists
      if (!profile) {
        throw new Error('User profile must exist before completing onboarding');
      }

      // Update onboarding progress
      const progressData = {
        user_id: user?.id,
        current_step: 7, // Final step
        completed_steps: [0, 1, 2, 3, 4, 5, 6],
        step_data: finalData,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert(progressData, { onConflict: 'user_id' });

      if (progressError) throw progressError;

      // Update user profile with onboarding data
      const profileData = {
        id: user?.id,
        first_name: finalData.firstName,
        last_name: finalData.lastName,
        age_range: finalData.ageRange,
        gender: finalData.gender,
        height_cm: finalData.heightCm,
        weight_kg: finalData.weightKg,
        activity_level: finalData.activityLevel,
        health_goals: finalData.healthGoals,
        dietary_restrictions: finalData.dietaryRestrictions,
        medical_conditions: finalData.medicalConditions,
        lifestyle_factors: finalData.lifestyleFactors,
        allergies: finalData.allergies,
        medications: finalData.medications,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData);

      if (profileError) throw profileError;

      // Create meal preferences if provided
      if (finalData.cuisineTypes || finalData.cookingTimePreference || finalData.mealComplexity) {
        const preferencesData = {
          user_id: user?.id,
          cuisine_types: finalData.cuisineTypes || [],
          cooking_time_preference: finalData.cookingTimePreference || 'any',
          meal_complexity: finalData.mealComplexity || 'any',
          budget_range: finalData.budgetRange || 'any',
          favorite_ingredients: finalData.favoriteIngredients || [],
          disliked_ingredients: finalData.dislikedIngredients || [],
          updated_at: new Date().toISOString(),
        };

        const { error: preferencesError } = await supabase
          .from('meal_preferences')
          .upsert(preferencesData, { onConflict: 'user_id' });

        if (preferencesError) throw preferencesError;
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    progress,
    loading,
    error,
    updateProgress,
    completeOnboarding,
    refetch: fetchProgress,
  };
};