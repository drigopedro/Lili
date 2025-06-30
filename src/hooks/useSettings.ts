import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
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
        settingsService.getUserSettings(user.id),
        settingsService.getNotificationPreferences(user.id),
        settingsService.getMealPlanningSettings(user.id),
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

  const updatePreferences = async (updates: UserPreferencesUpdate): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const success = await settingsService.updateUserPreferences(user.id, updates);
      
      if (success) {
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
      }

      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
      return false;
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      setError(null);
      const url = await settingsService.uploadProfilePicture(user.id, file);
      
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

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setError(null);
      return await settingsService.changePassword(newPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      return await settingsService.deleteAccount(user.id);
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
      return await settingsService.requestDataExport(user.id, exportType, format);
    } catch (err: any) {
      setError(err.message || 'Failed to request data export');
      return null;
    }
  };

  const resetPreferences = async (type: 'all' | 'notifications' | 'meal_planning' = 'all'): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const success = await settingsService.resetPreferences(user.id, type);
      
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