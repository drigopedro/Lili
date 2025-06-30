/*
  # Seed sample data for Lili nutrition app

  1. Sample Ingredients
    - Common UK ingredients with nutritional data
  
  2. Sample Recipes
    - Healthy UK-focused recipes
    - Proper nutritional calculations
  
  3. Recipe Ingredients
    - Link recipes to ingredients with amounts
*/

-- Insert sample ingredients (UK-focused)
INSERT INTO ingredients (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g) VALUES
  ('Porridge Oats', 'grains', 389, 16.9, 66.3, 6.9, 10.6),
  ('Blueberries', 'fruits', 57, 0.7, 14.5, 0.3, 2.4),
  ('Greek Yogurt', 'dairy', 59, 10.0, 3.6, 0.4, 0.0),
  ('Almonds', 'nuts', 579, 21.2, 21.6, 49.9, 12.5),
  ('Salmon Fillet', 'fish', 208, 25.4, 0.0, 12.4, 0.0),
  ('Quinoa', 'grains', 368, 14.1, 64.2, 6.1, 7.0),
  ('Broccoli', 'vegetables', 34, 2.8, 7.0, 0.4, 2.6),
  ('Sweet Potato', 'vegetables', 86, 1.6, 20.1, 0.1, 3.0),
  ('Avocado', 'fruits', 160, 2.0, 8.5, 14.7, 6.7),
  ('Spinach', 'vegetables', 23, 2.9, 3.6, 0.4, 2.2),
  ('Chicken Breast', 'meat', 165, 31.0, 0.0, 3.6, 0.0),
  ('Brown Rice', 'grains', 111, 2.6, 23.0, 0.9, 1.8),
  ('Eggs', 'dairy', 155, 13.0, 1.1, 11.0, 0.0),
  ('Banana', 'fruits', 89, 1.1, 22.8, 0.3, 2.6),
  ('Olive Oil', 'oils', 884, 0.0, 0.0, 100.0, 0.0);

-- Insert sample recipes
INSERT INTO recipes (name, description, prep_time_minutes, cook_time_minutes, servings, difficulty, instructions, tags, calories_per_serving, protein_g, carbs_g, fat_g, fibre_g) VALUES
  (
    'Overnight Oats with Berries',
    'A nutritious and convenient breakfast that''s perfect for busy mornings. Packed with fibre and antioxidants.',
    10, 0, 1, 'easy',
    ARRAY[
      'In a jar or bowl, combine 50g porridge oats with 150ml milk of choice',
      'Add 1 tablespoon Greek yogurt and mix well',
      'Top with 80g mixed berries and 15g chopped almonds',
      'Cover and refrigerate overnight',
      'Enjoy cold in the morning or warm slightly if preferred'
    ],
    ARRAY['breakfast', 'healthy', 'make-ahead', 'high-fibre'],
    320, 12.5, 45.2, 8.9, 8.2
  ),
  (
    'Quinoa Buddha Bowl',
    'A colourful and nutritious bowl packed with plant-based protein and fresh vegetables.',
    15, 20, 2, 'medium',
    ARRAY[
      'Cook 100g quinoa according to package instructions',
      'Steam 200g broccoli florets until tender-crisp',
      'Roast 200g cubed sweet potato at 200°C for 20 minutes',
      'Massage 100g spinach with a pinch of salt',
      'Slice 1 avocado',
      'Divide quinoa between bowls and top with vegetables',
      'Drizzle with olive oil and lemon juice'
    ],
    ARRAY['lunch', 'vegan', 'gluten-free', 'high-protein'],
    485, 16.8, 68.4, 18.2, 12.5
  ),
  (
    'Grilled Salmon with Sweet Potato',
    'A perfectly balanced dinner rich in omega-3 fatty acids and complex carbohydrates.',
    10, 25, 1, 'medium',
    ARRAY[
      'Preheat oven to 200°C',
      'Cut 200g sweet potato into wedges and toss with 1 tsp olive oil',
      'Roast sweet potato for 20 minutes',
      'Season 150g salmon fillet with herbs and lemon',
      'Grill salmon for 4-5 minutes each side',
      'Steam 150g broccoli until tender',
      'Serve salmon with roasted sweet potato and steamed broccoli'
    ],
    ARRAY['dinner', 'high-protein', 'omega-3', 'gluten-free'],
    520, 38.1, 32.4, 18.6, 6.8
  ),
  (
    'Greek Yogurt with Almonds',
    'A simple and protein-rich snack that''s perfect between meals.',
    2, 0, 1, 'easy',
    ARRAY[
      'Place 150g Greek yogurt in a bowl',
      'Top with 20g chopped almonds',
      'Drizzle with honey if desired',
      'Enjoy immediately'
    ],
    ARRAY['snack', 'high-protein', 'quick'],
    180, 16.2, 8.9, 10.4, 2.5
  );

-- Get recipe IDs for linking ingredients
DO $$
DECLARE
  overnight_oats_id uuid;
  buddha_bowl_id uuid;
  salmon_dinner_id uuid;
  yogurt_snack_id uuid;
  
  oats_id uuid;
  blueberries_id uuid;
  yogurt_id uuid;
  almonds_id uuid;
  salmon_id uuid;
  quinoa_id uuid;
  broccoli_id uuid;
  sweet_potato_id uuid;
  avocado_id uuid;
  spinach_id uuid;
  olive_oil_id uuid;
BEGIN
  -- Get recipe IDs
  SELECT id INTO overnight_oats_id FROM recipes WHERE name = 'Overnight Oats with Berries';
  SELECT id INTO buddha_bowl_id FROM recipes WHERE name = 'Quinoa Buddha Bowl';
  SELECT id INTO salmon_dinner_id FROM recipes WHERE name = 'Grilled Salmon with Sweet Potato';
  SELECT id INTO yogurt_snack_id FROM recipes WHERE name = 'Greek Yogurt with Almonds';
  
  -- Get ingredient IDs
  SELECT id INTO oats_id FROM ingredients WHERE name = 'Porridge Oats';
  SELECT id INTO blueberries_id FROM ingredients WHERE name = 'Blueberries';
  SELECT id INTO yogurt_id FROM ingredients WHERE name = 'Greek Yogurt';
  SELECT id INTO almonds_id FROM ingredients WHERE name = 'Almonds';
  SELECT id INTO salmon_id FROM ingredients WHERE name = 'Salmon Fillet';
  SELECT id INTO quinoa_id FROM ingredients WHERE name = 'Quinoa';
  SELECT id INTO broccoli_id FROM ingredients WHERE name = 'Broccoli';
  SELECT id INTO sweet_potato_id FROM ingredients WHERE name = 'Sweet Potato';
  SELECT id INTO avocado_id FROM ingredients WHERE name = 'Avocado';
  SELECT id INTO spinach_id FROM ingredients WHERE name = 'Spinach';
  SELECT id INTO olive_oil_id FROM ingredients WHERE name = 'Olive Oil';
  
  -- Insert recipe ingredients for Overnight Oats
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES
    (overnight_oats_id, oats_id, 50, 'g'),
    (overnight_oats_id, blueberries_id, 80, 'g'),
    (overnight_oats_id, yogurt_id, 15, 'g'),
    (overnight_oats_id, almonds_id, 15, 'g');
  
  -- Insert recipe ingredients for Buddha Bowl
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES
    (buddha_bowl_id, quinoa_id, 50, 'g'),
    (buddha_bowl_id, broccoli_id, 100, 'g'),
    (buddha_bowl_id, sweet_potato_id, 100, 'g'),
    (buddha_bowl_id, spinach_id, 50, 'g'),
    (buddha_bowl_id, avocado_id, 50, 'g'),
    (buddha_bowl_id, olive_oil_id, 10, 'ml');
  
  -- Insert recipe ingredients for Salmon Dinner
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES
    (salmon_dinner_id, salmon_id, 150, 'g'),
    (salmon_dinner_id, sweet_potato_id, 200, 'g'),
    (salmon_dinner_id, broccoli_id, 150, 'g'),
    (salmon_dinner_id, olive_oil_id, 5, 'ml');
  
  -- Insert recipe ingredients for Yogurt Snack
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES
    (yogurt_snack_id, yogurt_id, 150, 'g'),
    (yogurt_snack_id, almonds_id, 20, 'g');
END $$;