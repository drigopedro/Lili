/*
  # Complete Onboarding Database Schema

  1. New Tables
    - `user_profiles` - Enhanced with onboarding fields
    - `meal_preferences` - User cuisine and dietary preferences
    - `onboarding_progress` - Track completion status

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Features
    - Complete user profile management
    - Meal preference tracking
    - Progress tracking for onboarding steps
*/

-- Enhanced user_profiles table (already exists, adding missing fields)
DO $$
BEGIN
  -- Add any missing columns to existing user_profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'age_range'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN age_range text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'lifestyle_factors'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN lifestyle_factors text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'allergies'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN allergies text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'medications'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN medications text[] DEFAULT '{}';
  END IF;
END $$;

-- Create meal_preferences table
CREATE TABLE IF NOT EXISTS meal_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  cuisine_types text[] DEFAULT '{}',
  cooking_time_preference text CHECK (cooking_time_preference IN ('quick', 'moderate', 'long', 'any')) DEFAULT 'any',
  meal_complexity text CHECK (meal_complexity IN ('simple', 'moderate', 'complex', 'any')) DEFAULT 'any',
  budget_range text CHECK (budget_range IN ('low', 'medium', 'high', 'any')) DEFAULT 'any',
  favorite_ingredients text[] DEFAULT '{}',
  disliked_ingredients text[] DEFAULT '{}',
  meal_timing_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_step integer DEFAULT 1,
  completed_steps integer[] DEFAULT '{}',
  step_data jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for meal_preferences
CREATE POLICY "Users can manage own meal preferences"
  ON meal_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for onboarding_progress
CREATE POLICY "Users can manage own onboarding progress"
  ON onboarding_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_meal_preferences_updated_at
  BEFORE UPDATE ON meal_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for age_range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_age_range_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_age_range_check 
    CHECK (age_range IN ('18-25', '26-35', '36-45', '46-55', '56-65', '65+'));
  END IF;
END $$;