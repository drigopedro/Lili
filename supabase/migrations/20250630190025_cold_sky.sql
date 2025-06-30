/*
  # Fix meal_preferences table constraint

  1. Changes
    - Add unique constraint on user_id column in meal_preferences table
    - This enables the ON CONFLICT(user_id) functionality for upsert operations

  2. Security
    - No changes to RLS policies
*/

-- Add unique constraint to user_id column in meal_preferences table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'meal_preferences_user_id_key' 
    AND conrelid = 'meal_preferences'::regclass
  ) THEN
    ALTER TABLE meal_preferences ADD CONSTRAINT meal_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;