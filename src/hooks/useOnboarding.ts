import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { OnboardingData, OnboardingProgress, UserProfile, MealPreferences } from '../types/onboarding';

export const useOnboarding = () => {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
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

  const updateProgress = async (step: number, stepData: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);

      const progressData = {
        user_id: user?.id,
        current_step: step,
        completed_steps: progress?.completedSteps.includes(step) 
          ? progress.completedSteps 
          : [...(progress?.completedSteps || []), step],
        step_data: {
          ...(progress?.stepData || {}),
          [step]: stepData,
        },
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('onboarding_progress')
        .upsert(progressData)
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
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (finalData: OnboardingData) => {
    try {
      setLoading(true);
      setError(null);

      // Update user profile
      const profileData = {
        id: user?.id,
        age_range: finalData.ageRange,
        gender: finalData.gender,
        activity_level: finalData.activityLevel,
        health_goals: finalData.healthGoals,
        dietary_restrictions: finalData.allergies,
        medical_conditions: finalData.healthConditions,
        allergies: finalData.allergies,
        medications: finalData.medications,
        lifestyle_factors: finalData.lifestyleFactors,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData);

      if (profileError) throw profileError;

      // Create meal preferences
      const preferencesData = {
        user_id: user?.id,
        cuisine_types: finalData.cuisineTypes || [],
        cooking_time_preference: finalData.cookingTimePreference || 'any',
        meal_complexity: finalData.mealComplexity || 'any',
        budget_range: finalData.budgetRange || 'any',
        favorite_ingredients: [],
        disliked_ingredients: [],
        meal_timing_preferences: {},
      };

      const { error: preferencesError } = await supabase
        .from('meal_preferences')
        .upsert(preferencesData);

      if (preferencesError) throw preferencesError;

      // Mark onboarding as completed
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (progressError) throw progressError;

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
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