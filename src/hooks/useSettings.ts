import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { 
  UserSettings, 
  NotificationPreferences, 
  MealPlanningSettings,
  UserPreferencesUpdate 
} from '../types/settings';

export const useSettings = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [mealPlanningSettings, setMealPlanningSettings] = useState<MealPlanningSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAllSettings();
    }
  }, [user]);

  const loadAllSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [settings, notifications, mealPlanning] = await Promise.all([
        getUserSettings(user.id),
        getNotificationPreferences(user.id),
        getMealPlanningSettings(user.id),
      ]);

      setUserSettings(settings);
      setNotificationPreferences(notifications);
      setMealPlanningSettings(mealPlanning);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) throw error;
      
      if (!data) {
        // Create default settings if none exist
        return await createDefaultUserSettings(userId);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  };

  const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) throw error;
      
      if (!data) {
        // Create default notification preferences if none exist
        return await createDefaultNotificationPreferences(userId);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  };

  const getMealPlanningSettings = async (userId: string): Promise<MealPlanningSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('meal_planning_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) throw error;
      
      if (!data) {
        // Create default meal planning settings if none exist
        return await createDefaultMealPlanningSettings(userId);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching meal planning settings:', error);
      throw error;
    }
  };

  const createDefaultUserSettings = async (userId: string): Promise<UserSettings> => {
    const defaultSettings = {
      user_id: userId,
      profile_picture_url: null,
      display_name: '',
      timezone: 'Europe/London',
      language: 'en-GB',
      theme: 'dark' as const,
      units: 'metric' as const,
      privacy_settings: {},
    };

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single(); // This is OK because we're creating exactly one record

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default user settings:', error);
      throw error;
    }
  };

  const createDefaultNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
    const defaultPreferences = {
      user_id: userId,
      meal_prep_reminders: true,
      shopping_list_notifications: true,
      weekly_meal_plan_alerts: true,
      custom_reminders: [],
      notification_methods: {
        email: true,
        push: false,
        sms: false,
      },
      reminder_times: {
        meal_prep: "09:00",
        shopping: "18:00",
        weekly_plan: "Sunday 10:00",
      },
    };

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single(); // This is OK because we're creating exactly one record

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
      throw error;
    }
  };

  const createDefaultMealPlanningSettings = async (userId: string): Promise<MealPlanningSettings> => {
    const defaultSettings = {
      user_id: userId,
      weekly_meal_frequency: 21,
      preferred_meal_times: {
        breakfast: "08:00",
        lunch: "13:00",
        dinner: "19:00",
      },
      cooking_time_preference: 'moderate',
      household_size: 2,
      weekly_budget_pounds: 50.00,
      meal_budget_pounds: 8.00,
      batch_cooking_enabled: false,
      batch_cooking_days: [],
      auto_generate_shopping_list: true,
      include_snacks: true,
      portion_size_preference: 'standard',
      preferred_cuisines: [],
      budget_range: 'medium',
    };

    try {
      const { data, error } = await supabase
        .from('meal_planning_settings')
        .insert(defaultSettings)
        .select()
        .single(); // This is OK because we're creating exactly one record

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default meal planning settings:', error);
      throw error;
    }
  };

  const updatePreferences = async (updates: UserPreferencesUpdate): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const success = await supabase.rpc('update_user_preferences', {
        p_user_id: user.id,
        p_settings: updates.settings ? JSON.stringify(updates.settings) : null,
        p_notifications: updates.notifications ? JSON.stringify(updates.notifications) : null,
        p_meal_planning: updates.meal_planning ? JSON.stringify(updates.meal_planning) : null,
      });
      
      if (success.error) throw success.error;
      
      // Update local state
      if (updates.settings) {
        setUserSettings(prev => prev ? { ...prev, ...updates.settings } : null);
      }
      if (updates.notifications) {
        setNotificationPreferences(prev => prev ? { ...prev, ...updates.notifications } : null);
      }
      if (updates.meal_planning) {
        setMealPlanningSettings(prev => prev ? { ...prev, ...updates.meal_planning } : null);
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
      return false;
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      setError(null);
      const url = await uploadProfilePictureToStorage(user.id, file);
      
      if (url) {
        await updatePreferences({
          settings: { profile_picture_url: url }
        });
      }

      return url;
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
      return null;
    }
  };

  const uploadProfilePictureToStorage = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      // In a real implementation, this would be handled by a secure server-side function
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          deleted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      return false;
    }
  };

  const requestDataExport = async (
    exportType: 'full' | 'recipes' | 'meal_plans' | 'preferences' = 'full',
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user.id,
          export_type: exportType,
          format: format,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (err: any) {
      setError(err.message || 'Failed to request data export');
      return null;
    }
  };

  const resetPreferences = async (type: 'all' | 'notifications' | 'meal_planning' = 'all'): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const updates: UserPreferencesUpdate = {};
      
      if (type === 'all' || type === 'notifications') {
        updates.notifications = {
          meal_prep_reminders: true,
          shopping_list_notifications: true,
          weekly_meal_plan_alerts: true,
          custom_reminders: [],
          notification_methods: {
            email: true,
            push: false,
            sms: false
          },
          reminder_times: {
            meal_prep: "09:00",
            shopping: "18:00",
            weekly_plan: "Sunday 10:00"
          }
        };
      }
      
      if (type === 'all' || type === 'meal_planning') {
        updates.meal_planning = {
          weekly_meal_frequency: 21,
          preferred_meal_times: {
            breakfast: "08:00",
            lunch: "13:00",
            dinner: "19:00"
          },
          cooking_time_preference: 'moderate',
          household_size: 2,
          weekly_budget_pounds: 50.00,
          meal_budget_pounds: 8.00,
          batch_cooking_enabled: false,
          batch_cooking_days: [],
          auto_generate_shopping_list: true,
          include_snacks: true,
          portion_size_preference: 'standard',
          preferred_cuisines: [],
          budget_range: 'medium'
        };
      }
      
      const success = await updatePreferences(updates);
      
      if (success) {
        await loadAllSettings(); // Reload all settings
      }
      
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to reset preferences');
      return false;
    }
  };

  return {
    userSettings,
    notificationPreferences,
    mealPlanningSettings,
    loading,
    error,
    updatePreferences,
    uploadProfilePicture,
    changePassword,
    deleteAccount,
    requestDataExport,
    resetPreferences,
    refetch: loadAllSettings,
  };
};