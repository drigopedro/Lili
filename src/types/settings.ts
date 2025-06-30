export interface UserSettings {
  id: string;
  user_id: string;
  profile_picture_url?: string;
  display_name?: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  units: 'metric' | 'imperial';
  privacy_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  meal_prep_reminders: boolean;
  shopping_list_notifications: boolean;
  weekly_meal_plan_alerts: boolean;
  custom_reminders: CustomReminder[];
  notification_methods: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  reminder_times: {
    meal_prep: string;
    shopping: string;
    weekly_plan: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CustomReminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
}

export interface MealPlanningSettings {
  id: string;
  user_id: string;
  weekly_meal_frequency: number;
  preferred_meal_times: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  cooking_time_preference: 'quick' | 'moderate' | 'long' | 'any';
  household_size: number;
  weekly_budget_pounds: number;
  meal_budget_pounds: number;
  batch_cooking_enabled: boolean;
  batch_cooking_days: string[];
  auto_generate_shopping_list: boolean;
  include_snacks: boolean;
  portion_size_preference: 'small' | 'standard' | 'large';
  created_at: string;
  updated_at: string;
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  export_type: 'full' | 'recipes' | 'meal_plans' | 'preferences';
  format: 'json' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  expires_at?: string;
  created_at: string;
  completed_at?: string;
}

export interface UserPreferencesUpdate {
  settings?: Partial<UserSettings>;
  notifications?: Partial<NotificationPreferences>;
  meal_planning?: Partial<MealPlanningSettings>;
}

export interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  category: 'restriction' | 'allergy' | 'preference';
  enabled: boolean;
}

export interface CuisinePreference {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
}