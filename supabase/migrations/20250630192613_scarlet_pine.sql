/*
  # Add deleted_at column to user_profiles table

  1. Changes
    - Add `deleted_at` column to `user_profiles` table
    - Column type: timestamp with time zone
    - Allow null values (default null)
    - Used for soft deletion of user accounts

  2. Security
    - No changes to existing RLS policies needed
    - Column will be managed through existing user policies
*/

-- Add deleted_at column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;
END $$;