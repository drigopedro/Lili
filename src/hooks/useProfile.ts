import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  ageRange?: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  healthGoals?: string[];
  dietaryRestrictions?: string[];
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  lifestyleFactors?: string[];
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        // Profile doesn't exist, create a basic one
        await createBasicProfile();
        return;
      }

      setProfile({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        ageRange: data.age_range,
        heightCm: data.height_cm,
        weightKg: data.weight_kg,
        activityLevel: data.activity_level,
        healthGoals: data.health_goals,
        dietaryRestrictions: data.dietary_restrictions,
        medicalConditions: data.medical_conditions,
        allergies: data.allergies,
        medications: data.medications,
        lifestyleFactors: data.lifestyle_factors,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBasicProfile = async () => {
    try {
      const basicProfileData = {
        id: user?.id,
        onboarding_completed: false,
        health_goals: [],
        dietary_restrictions: [],
        medical_conditions: [],
        lifestyle_factors: [],
        allergies: [],
        medications: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(basicProfileData)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          dateOfBirth: data.date_of_birth,
          gender: data.gender,
          ageRange: data.age_range,
          heightCm: data.height_cm,
          weightKg: data.weight_kg,
          activityLevel: data.activity_level,
          healthGoals: data.health_goals,
          dietaryRestrictions: data.dietary_restrictions,
          medicalConditions: data.medical_conditions,
          allergies: data.allergies,
          medications: data.medications,
          lifestyleFactors: data.lifestyle_factors,
          onboardingCompleted: data.onboarding_completed,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      const profileData = {
        id: user?.id,
        first_name: updates.firstName,
        last_name: updates.lastName,
        date_of_birth: updates.dateOfBirth,
        gender: updates.gender,
        age_range: updates.ageRange,
        height_cm: updates.heightCm,
        weight_kg: updates.weightKg,
        activity_level: updates.activityLevel,
        health_goals: updates.healthGoals,
        dietary_restrictions: updates.dietaryRestrictions,
        medical_conditions: updates.medicalConditions,
        allergies: updates.allergies,
        medications: updates.medications,
        lifestyle_factors: updates.lifestyleFactors,
        onboarding_completed: updates.onboardingCompleted,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          dateOfBirth: data.date_of_birth,
          gender: data.gender,
          ageRange: data.age_range,
          heightCm: data.height_cm,
          weightKg: data.weight_kg,
          activityLevel: data.activity_level,
          healthGoals: data.health_goals,
          dietaryRestrictions: data.dietary_restrictions,
          medicalConditions: data.medical_conditions,
          allergies: data.allergies,
          medications: data.medications,
          lifestyleFactors: data.lifestyle_factors,
          onboardingCompleted: data.onboarding_completed,
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

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
};