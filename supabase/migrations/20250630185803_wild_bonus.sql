/*
  # Add unique constraint to meal_preferences table

  1. Changes
    - Add unique constraint to user_id column in meal_preferences table
    - This enables upsert operations with onConflict: 'user_id'

  2. Purpose
    - Fix error in onboarding flow when saving meal preferences
    - Ensure each user can only have one set of meal preferences
*/

-- Add unique constraint to user_id column in meal_preferences table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'meal_preferences_user_id_key' 
    AND table_name = 'meal_preferences'
  ) THEN
    ALTER TABLE meal_preferences ADD CONSTRAINT meal_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;