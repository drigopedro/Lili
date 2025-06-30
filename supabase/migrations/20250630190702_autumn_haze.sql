/*
  # Fix meal_preferences table constraints

  1. Changes
    - Add unique constraint on user_id column in meal_preferences table
    - Ensure the constraint is properly created

  2. Security
    - No changes to RLS policies
*/

-- Add unique constraint to user_id column in meal_preferences table
DO $$
BEGIN
  -- First check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'meal_preferences_user_id_key' 
    AND conrelid = 'meal_preferences'::regclass
  ) THEN
    -- If the constraint doesn't exist, add it
    ALTER TABLE meal_preferences ADD CONSTRAINT meal_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add preferred_cuisines column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_planning_settings' AND column_name = 'preferred_cuisines'
  ) THEN
    ALTER TABLE meal_planning_settings ADD COLUMN preferred_cuisines text[] DEFAULT '{}';
  END IF;
END $$;

-- Add budget_range column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_planning_settings' AND column_name = 'budget_range'
  ) THEN
    ALTER TABLE meal_planning_settings ADD COLUMN budget_range text DEFAULT 'medium' CHECK (budget_range IN ('low', 'medium', 'high', 'any'));
  END IF;
END $$;