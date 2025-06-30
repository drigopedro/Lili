/*
  # Add unique constraint to meal_preferences table

  1. Changes
    - Add unique constraint on user_id column in meal_preferences table
    - This allows upsert operations with onConflict: 'user_id' to work properly

  2. Security
    - No changes to existing RLS policies
    - Maintains existing foreign key relationships
*/

-- Add unique constraint to user_id column in meal_preferences table
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