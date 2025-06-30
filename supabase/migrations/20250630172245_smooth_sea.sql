/*
  # Recipe and Grocery List Management System

  1. New Tables
    - `saved_recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `recipe_id` (text)
      - `recipe_name` (text)
      - `recipe_data` (jsonb)
      - `saved_at` (timestamp)

    - `grocery_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `meal_plan_id` (uuid, references meal_plans)
      - `items` (jsonb)
      - `estimated_cost` (decimal)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id text NOT NULL,
  recipe_name text NOT NULL,
  recipe_data jsonb NOT NULL,
  saved_at timestamptz DEFAULT now()
);

-- Create grocery_lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  estimated_cost decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_recipes
CREATE POLICY "Users can manage own saved recipes"
  ON saved_recipes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for grocery_lists
CREATE POLICY "Users can manage own grocery lists"
  ON grocery_lists
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS saved_recipes_user_id_idx ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS saved_recipes_recipe_id_idx ON saved_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS grocery_lists_user_id_idx ON grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS grocery_lists_meal_plan_id_idx ON grocery_lists(meal_plan_id);