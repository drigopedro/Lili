/*
  # Create user profiles and nutrition data schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `date_of_birth` (date)
      - `gender` (text)
      - `height_cm` (integer)
      - `weight_kg` (decimal)
      - `activity_level` (text)
      - `health_goals` (text array)
      - `dietary_restrictions` (text array)
      - `medical_conditions` (text array)
      - `onboarding_completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `meal_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `recipes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `prep_time_minutes` (integer)
      - `cook_time_minutes` (integer)
      - `servings` (integer)
      - `difficulty` (text)
      - `instructions` (text array)
      - `tags` (text array)
      - `calories_per_serving` (integer)
      - `protein_g` (decimal)
      - `carbs_g` (decimal)
      - `fat_g` (decimal)
      - `fibre_g` (decimal)
      - `sugar_g` (decimal)
      - `sodium_mg` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `ingredients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `calories_per_100g` (integer)
      - `protein_per_100g` (decimal)
      - `carbs_per_100g` (decimal)
      - `fat_per_100g` (decimal)
      - `fibre_per_100g` (decimal)
      - `created_at` (timestamp)

    - `recipe_ingredients`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, references recipes)
      - `ingredient_id` (uuid, references ingredients)
      - `amount` (decimal)
      - `unit` (text)

    - `meals`
      - `id` (uuid, primary key)
      - `meal_plan_id` (uuid, references meal_plans)
      - `recipe_id` (uuid, references recipes)
      - `meal_type` (text) -- breakfast, lunch, dinner, snack
      - `scheduled_date` (date)
      - `scheduled_time` (time)
      - `servings` (decimal)
      - `completed` (boolean)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

    - `food_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `meal_id` (uuid, references meals, nullable)
      - `food_name` (text)
      - `calories` (integer)
      - `protein_g` (decimal)
      - `carbs_g` (decimal)
      - `fat_g` (decimal)
      - `logged_at` (timestamp)
      - `meal_type` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  height_cm integer,
  weight_kg decimal(5,2),
  activity_level text CHECK (activity_level IN ('sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active')),
  health_goals text[] DEFAULT '{}',
  dietary_restrictions text[] DEFAULT '{}',
  medical_conditions text[] DEFAULT '{}',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  prep_time_minutes integer DEFAULT 0,
  cook_time_minutes integer DEFAULT 0,
  servings integer DEFAULT 1,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  instructions text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  calories_per_serving integer DEFAULT 0,
  protein_g decimal(6,2) DEFAULT 0,
  carbs_g decimal(6,2) DEFAULT 0,
  fat_g decimal(6,2) DEFAULT 0,
  fibre_g decimal(6,2) DEFAULT 0,
  sugar_g decimal(6,2) DEFAULT 0,
  sodium_mg decimal(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text DEFAULT 'other',
  calories_per_100g integer DEFAULT 0,
  protein_per_100g decimal(6,2) DEFAULT 0,
  carbs_per_100g decimal(6,2) DEFAULT 0,
  fat_per_100g decimal(6,2) DEFAULT 0,
  fibre_per_100g decimal(6,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  amount decimal(8,2) NOT NULL,
  unit text NOT NULL,
  UNIQUE(recipe_id, ingredient_id)
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  servings decimal(4,2) DEFAULT 1,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  meal_id uuid REFERENCES meals(id) ON DELETE SET NULL,
  food_name text NOT NULL,
  calories integer DEFAULT 0,
  protein_g decimal(6,2) DEFAULT 0,
  carbs_g decimal(6,2) DEFAULT 0,
  fat_g decimal(6,2) DEFAULT 0,
  logged_at timestamptz DEFAULT now(),
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for meal_plans
CREATE POLICY "Users can manage own meal plans"
  ON meal_plans
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for recipes (public read, authenticated users can create)
CREATE POLICY "Anyone can read recipes"
  ON recipes
  FOR SELECT
  TO authenticated;

CREATE POLICY "Authenticated users can create recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for ingredients (public read)
CREATE POLICY "Anyone can read ingredients"
  ON ingredients
  FOR SELECT
  TO authenticated;

CREATE POLICY "Authenticated users can create ingredients"
  ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for recipe_ingredients
CREATE POLICY "Anyone can read recipe ingredients"
  ON recipe_ingredients
  FOR SELECT
  TO authenticated;

CREATE POLICY "Authenticated users can manage recipe ingredients"
  ON recipe_ingredients
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for meals
CREATE POLICY "Users can manage meals in their meal plans"
  ON meals
  FOR ALL
  TO authenticated
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Create policies for food_logs
CREATE POLICY "Users can manage own food logs"
  ON food_logs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();