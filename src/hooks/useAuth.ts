import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthState } from '../types';

export const useAuth = (): AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata?.firstName,
          lastName: session.user.user_metadata?.lastName,
          avatar: session.user.user_metadata?.avatar,
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at || session.user.created_at,
        } : null,
        loading: false,
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email!,
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
            avatar: session.user.user_metadata?.avatar,
            createdAt: session.user.created_at,
            updatedAt: session.user.updated_at || session.user.created_at,
          } : null,
          loading: false,
          error: null,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }

    // Create user profile immediately after successful signup
    if (data.user) {
      try {
        const basicProfileData = {
          id: data.user.id,
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

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(basicProfileData);

        if (profileError) {
          console.error('Failed to create user profile:', profileError);
          // Don't throw here as the user account was created successfully
          // The profile will be created later in useProfile hook if needed
        }
      } catch (profileErr) {
        console.error('Error creating user profile:', profileErr);
        // Don't throw here as the user account was created successfully
      }
    }

    setState(prev => ({ ...prev, loading: false }));
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }

    setState(prev => ({ ...prev, loading: false }));
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};