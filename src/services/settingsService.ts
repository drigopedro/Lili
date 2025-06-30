import { supabase } from '../lib/supabase';
import type { 
  UserSettings, 
  NotificationPreferences, 
  MealPlanningSettings, 
  DataExportRequest,
  UserPreferencesUpdate 
} from '../types/settings';

class SettingsService {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Get meal planning settings
  async getMealPlanningSettings(userId: string): Promise<MealPlanningSettings | null> {
    try {
      const { data, error } = await supabase
        .from('meal_planning_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching meal planning settings:', error);
      return null;
    }
  }

  // Update user preferences using the database function
  async updateUserPreferences(userId: string, updates: UserPreferencesUpdate): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_user_preferences', {
        p_user_id: userId,
        p_settings: updates.settings ? JSON.stringify(updates.settings) : null,
        p_notifications: updates.notifications ? JSON.stringify(updates.notifications) : null,
        p_meal_planning: updates.meal_planning ? JSON.stringify(updates.meal_planning) : null,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(userId: string, file: File): Promise<string | null> {
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
  }

  // Change password
  async changePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  // Delete account
  async deleteAccount(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would be handled by a secure server-side function
      // For now, we'll just mark the account for deletion
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          deleted_at: new Date().toISOString(),
          email: `deleted_${Date.now()}@example.com` 
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }

  // Request data export
  async requestDataExport(
    userId: string, 
    exportType: 'full' | 'recipes' | 'meal_plans' | 'preferences' = 'full',
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('export_user_data', {
        p_user_id: userId,
        p_export_type: exportType,
        p_format: format,
      });

      if (error) throw error;
      return data; // Returns export request ID
    } catch (error) {
      console.error('Error requesting data export:', error);
      return null;
    }
  }

  // Get data export requests
  async getDataExportRequests(userId: string): Promise<DataExportRequest[]> {
    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching export requests:', error);
      return [];
    }
  }

  // Reset preferences to default
  async resetPreferences(userId: string, type: 'all' | 'notifications' | 'meal_planning' = 'all'): Promise<boolean> {
    try {
      const updates: UserPreferencesUpdate = {};

      if (type === 'all' || type === 'notifications') {
        updates.notifications = {
          meal_prep_reminders: true,
          shopping_list_notifications: true,
          weekly_meal_plan_alerts: true,
          custom_reminders: [],
          notification_methods: { email: true, push: false, sms: false },
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
          portion_size_preference: 'standard'
        };
      }

      return await this.updateUserPreferences(userId, updates);
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }

  // Get all user data for preview
  async getUserDataPreview(userId: string): Promise<any> {
    try {
      const [profile, settings, notifications, mealPlanning, savedRecipes, mealPlans] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        this.getUserSettings(userId),
        this.getNotificationPreferences(userId),
        this.getMealPlanningSettings(userId),
        supabase.from('saved_recipes').select('*').eq('user_id', userId),
        supabase.from('meal_plans').select('*').eq('user_id', userId),
      ]);

      return {
        profile: profile.data,
        settings,
        notifications,
        meal_planning: mealPlanning,
        saved_recipes: savedRecipes.data || [],
        meal_plans: mealPlans.data || [],
      };
    } catch (error) {
      console.error('Error fetching user data preview:', error);
      return null;
    }
  }
}

export const settingsService = new SettingsService();