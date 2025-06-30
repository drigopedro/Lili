/*
  # User Settings and Preferences System

  1. New Tables
    - `user_settings` - Core user settings and preferences
    - `notification_preferences` - Notification settings
    - `meal_planning_settings` - Meal planning specific settings
    - `data_export_requests` - Track data export requests

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - `update_user_preferences` - Function to update user preferences
    - `export_user_data` - Function to export user data
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_picture_url text,
  display_name text,
  timezone text DEFAULT 'Europe/London',
  language text DEFAULT 'en-GB',
  theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  units text DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  privacy_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  meal_prep_reminders boolean DEFAULT true,
  shopping_list_notifications boolean DEFAULT true,
  weekly_meal_plan_alerts boolean DEFAULT true,
  custom_reminders jsonb DEFAULT '[]',
  notification_methods jsonb DEFAULT '{"email": true, "push": false, "sms": false}',
  reminder_times jsonb DEFAULT '{"meal_prep": "09:00", "shopping": "18:00", "weekly_plan": "Sunday 10:00"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal_planning_settings table
CREATE TABLE IF NOT EXISTS meal_planning_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  weekly_meal_frequency integer DEFAULT 21 CHECK (weekly_meal_frequency BETWEEN 7 AND 35),
  preferred_meal_times jsonb DEFAULT '{"breakfast": "08:00", "lunch": "13:00", "dinner": "19:00"}',
  cooking_time_preference text DEFAULT 'moderate' CHECK (cooking_time_preference IN ('quick', 'moderate', 'long', 'any')),
  household_size integer DEFAULT 2 CHECK (household_size BETWEEN 1 AND 12),
  weekly_budget_pounds decimal(8,2) DEFAULT 50.00,
  meal_budget_pounds decimal(6,2) DEFAULT 8.00,
  batch_cooking_enabled boolean DEFAULT false,
  batch_cooking_days text[] DEFAULT '{}',
  auto_generate_shopping_list boolean DEFAULT true,
  include_snacks boolean DEFAULT true,
  portion_size_preference text DEFAULT 'standard' CHECK (portion_size_preference IN ('small', 'standard', 'large')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('full', 'recipes', 'meal_plans', 'preferences')),
  format text NOT NULL CHECK (format IN ('json', 'csv', 'pdf')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_planning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for notification_preferences
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for meal_planning_settings
CREATE POLICY "Users can manage own meal planning settings"
  ON meal_planning_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for data_export_requests
CREATE POLICY "Users can manage own export requests"
  ON data_export_requests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_planning_settings_updated_at
  BEFORE UPDATE ON meal_planning_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
  p_user_id uuid,
  p_settings jsonb DEFAULT NULL,
  p_notifications jsonb DEFAULT NULL,
  p_meal_planning jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
BEGIN
  -- Check if user exists and is the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Update user_settings if provided
  IF p_settings IS NOT NULL THEN
    INSERT INTO user_settings (user_id, profile_picture_url, display_name, timezone, language, theme, units, privacy_settings)
    VALUES (
      p_user_id,
      COALESCE(p_settings->>'profile_picture_url', NULL),
      COALESCE(p_settings->>'display_name', NULL),
      COALESCE(p_settings->>'timezone', 'Europe/London'),
      COALESCE(p_settings->>'language', 'en-GB'),
      COALESCE(p_settings->>'theme', 'dark'),
      COALESCE(p_settings->>'units', 'metric'),
      COALESCE(p_settings->'privacy_settings', '{}')
    )
    ON CONFLICT (user_id) DO UPDATE SET
      profile_picture_url = COALESCE(EXCLUDED.profile_picture_url, user_settings.profile_picture_url),
      display_name = COALESCE(EXCLUDED.display_name, user_settings.display_name),
      timezone = COALESCE(EXCLUDED.timezone, user_settings.timezone),
      language = COALESCE(EXCLUDED.language, user_settings.language),
      theme = COALESCE(EXCLUDED.theme, user_settings.theme),
      units = COALESCE(EXCLUDED.units, user_settings.units),
      privacy_settings = COALESCE(EXCLUDED.privacy_settings, user_settings.privacy_settings),
      updated_at = now();
    
    result := result || '{"settings": "updated"}';
  END IF;

  -- Update notification_preferences if provided
  IF p_notifications IS NOT NULL THEN
    INSERT INTO notification_preferences (
      user_id, meal_prep_reminders, shopping_list_notifications, 
      weekly_meal_plan_alerts, custom_reminders, notification_methods, reminder_times
    )
    VALUES (
      p_user_id,
      COALESCE((p_notifications->>'meal_prep_reminders')::boolean, true),
      COALESCE((p_notifications->>'shopping_list_notifications')::boolean, true),
      COALESCE((p_notifications->>'weekly_meal_plan_alerts')::boolean, true),
      COALESCE(p_notifications->'custom_reminders', '[]'),
      COALESCE(p_notifications->'notification_methods', '{"email": true, "push": false, "sms": false}'),
      COALESCE(p_notifications->'reminder_times', '{"meal_prep": "09:00", "shopping": "18:00", "weekly_plan": "Sunday 10:00"}')
    )
    ON CONFLICT (user_id) DO UPDATE SET
      meal_prep_reminders = COALESCE(EXCLUDED.meal_prep_reminders, notification_preferences.meal_prep_reminders),
      shopping_list_notifications = COALESCE(EXCLUDED.shopping_list_notifications, notification_preferences.shopping_list_notifications),
      weekly_meal_plan_alerts = COALESCE(EXCLUDED.weekly_meal_plan_alerts, notification_preferences.weekly_meal_plan_alerts),
      custom_reminders = COALESCE(EXCLUDED.custom_reminders, notification_preferences.custom_reminders),
      notification_methods = COALESCE(EXCLUDED.notification_methods, notification_preferences.notification_methods),
      reminder_times = COALESCE(EXCLUDED.reminder_times, notification_preferences.reminder_times),
      updated_at = now();
    
    result := result || '{"notifications": "updated"}';
  END IF;

  -- Update meal_planning_settings if provided
  IF p_meal_planning IS NOT NULL THEN
    INSERT INTO meal_planning_settings (
      user_id, weekly_meal_frequency, preferred_meal_times, cooking_time_preference,
      household_size, weekly_budget_pounds, meal_budget_pounds, batch_cooking_enabled,
      batch_cooking_days, auto_generate_shopping_list, include_snacks, portion_size_preference
    )
    VALUES (
      p_user_id,
      COALESCE((p_meal_planning->>'weekly_meal_frequency')::integer, 21),
      COALESCE(p_meal_planning->'preferred_meal_times', '{"breakfast": "08:00", "lunch": "13:00", "dinner": "19:00"}'),
      COALESCE(p_meal_planning->>'cooking_time_preference', 'moderate'),
      COALESCE((p_meal_planning->>'household_size')::integer, 2),
      COALESCE((p_meal_planning->>'weekly_budget_pounds')::decimal, 50.00),
      COALESCE((p_meal_planning->>'meal_budget_pounds')::decimal, 8.00),
      COALESCE((p_meal_planning->>'batch_cooking_enabled')::boolean, false),
      COALESCE(array(SELECT jsonb_array_elements_text(p_meal_planning->'batch_cooking_days')), '{}'),
      COALESCE((p_meal_planning->>'auto_generate_shopping_list')::boolean, true),
      COALESCE((p_meal_planning->>'include_snacks')::boolean, true),
      COALESCE(p_meal_planning->>'portion_size_preference', 'standard')
    )
    ON CONFLICT (user_id) DO UPDATE SET
      weekly_meal_frequency = COALESCE(EXCLUDED.weekly_meal_frequency, meal_planning_settings.weekly_meal_frequency),
      preferred_meal_times = COALESCE(EXCLUDED.preferred_meal_times, meal_planning_settings.preferred_meal_times),
      cooking_time_preference = COALESCE(EXCLUDED.cooking_time_preference, meal_planning_settings.cooking_time_preference),
      household_size = COALESCE(EXCLUDED.household_size, meal_planning_settings.household_size),
      weekly_budget_pounds = COALESCE(EXCLUDED.weekly_budget_pounds, meal_planning_settings.weekly_budget_pounds),
      meal_budget_pounds = COALESCE(EXCLUDED.meal_budget_pounds, meal_planning_settings.meal_budget_pounds),
      batch_cooking_enabled = COALESCE(EXCLUDED.batch_cooking_enabled, meal_planning_settings.batch_cooking_enabled),
      batch_cooking_days = COALESCE(EXCLUDED.batch_cooking_days, meal_planning_settings.batch_cooking_days),
      auto_generate_shopping_list = COALESCE(EXCLUDED.auto_generate_shopping_list, meal_planning_settings.auto_generate_shopping_list),
      include_snacks = COALESCE(EXCLUDED.include_snacks, meal_planning_settings.include_snacks),
      portion_size_preference = COALESCE(EXCLUDED.portion_size_preference, meal_planning_settings.portion_size_preference),
      updated_at = now();
    
    result := result || '{"meal_planning": "updated"}';
  END IF;

  RETURN result;
END;
$$;

-- Function to export user data
CREATE OR REPLACE FUNCTION export_user_data(
  p_user_id uuid,
  p_export_type text DEFAULT 'full',
  p_format text DEFAULT 'json'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  export_id uuid;
BEGIN
  -- Check if user exists and is the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Create export request
  INSERT INTO data_export_requests (user_id, export_type, format, status)
  VALUES (p_user_id, p_export_type, p_format, 'pending')
  RETURNING id INTO export_id;

  -- In a real implementation, this would trigger a background job
  -- For now, we'll just return the export ID
  RETURN export_id;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS meal_planning_settings_user_id_idx ON meal_planning_settings(user_id);
CREATE INDEX IF NOT EXISTS data_export_requests_user_id_idx ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS data_export_requests_status_idx ON data_export_requests(status);