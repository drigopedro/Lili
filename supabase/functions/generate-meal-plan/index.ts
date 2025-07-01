import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface MealPlanRequest {
  user_id: string;
  start_date: string;
  preferences?: {
    dietary_restrictions?: string[];
    allergies?: string[];
    cuisine_preferences?: string[];
    cooking_time_limit?: number;
    budget_range?: string;
    calorie_target?: number;
  };
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: string;
  instructions: string[];
  tags: string[];
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  sugar_g: number;
  sodium_mg: number;
}

interface UserProfile {
  dietary_restrictions: string[];
  allergies: string[];
  health_goals: string[];
  activity_level: string;
  lifestyle_factors: string[];
}

interface MealPreferences {
  cuisine_types: string[];
  cooking_time_preference: string;
  meal_complexity: string;
  budget_range: string;
}

interface MealPlanningSettings {
  cooking_time_preference: string;
  budget_range: string;
  preferred_cuisines: string[];
  household_size: number;
  include_snacks: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { user_id, start_date, preferences }: MealPlanRequest = await req.json();

    if (!user_id || !start_date) {
      throw new Error('User ID and start date are required');
    }

    // Get user profile and preferences
    const [profileResult, mealPrefsResult, settingsResult] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user_id).maybeSingle(),
      supabase.from('meal_preferences').select('*').eq('user_id', user_id).maybeSingle(),
      supabase.from('meal_planning_settings').select('*').eq('user_id', user_id).maybeSingle()
    ]);

    const userProfile: UserProfile = profileResult.data || {
      dietary_restrictions: [],
      allergies: [],
      health_goals: [],
      activity_level: 'moderately-active',
      lifestyle_factors: []
    };

    const mealPreferences: MealPreferences = mealPrefsResult.data || {
      cuisine_types: [],
      cooking_time_preference: 'moderate',
      meal_complexity: 'moderate',
      budget_range: 'medium'
    };

    const mealPlanningSettings: MealPlanningSettings = settingsResult.data || {
      cooking_time_preference: 'moderate',
      budget_range: 'medium',
      preferred_cuisines: [],
      household_size: 2,
      include_snacks: true
    };

    // Combine preferences from all sources
    const combinedPreferences = {
      dietary_restrictions: [
        ...(userProfile.dietary_restrictions || []),
        ...(preferences?.dietary_restrictions || [])
      ],
      allergies: [
        ...(userProfile.allergies || []),
        ...(preferences?.allergies || [])
      ],
      cuisine_preferences: [
        ...(mealPreferences.cuisine_types || []),
        ...(mealPlanningSettings.preferred_cuisines || []),
        ...(preferences?.cuisine_preferences || [])
      ],
      cooking_time_limit: preferences?.cooking_time_limit || getCookingTimeLimit(
        mealPreferences.cooking_time_preference || mealPlanningSettings.cooking_time_preference
      ),
      budget_range: preferences?.budget_range || mealPreferences.budget_range || mealPlanningSettings.budget_range,
      calorie_target: preferences?.calorie_target || calculateCalorieTarget(userProfile),
      health_goals: userProfile.health_goals || [],
      activity_level: userProfile.activity_level,
      include_snacks: mealPlanningSettings.include_snacks
    };

    console.log('Combined preferences:', combinedPreferences);

    // Get matching recipes based on preferences
    const recipes = await getMatchingRecipes(supabase, combinedPreferences);
    console.log(`Found ${recipes.length} matching recipes`);

    if (recipes.length === 0) {
      throw new Error('No recipes found matching your preferences. Please adjust your dietary restrictions or preferences.');
    }

    // Generate 7-day meal plan
    const mealPlan = await generateWeeklyMealPlan(supabase, user_id, start_date, recipes, combinedPreferences);

    return new Response(JSON.stringify(mealPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Meal plan generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate meal plan' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getCookingTimeLimit(preference: string): number {
  switch (preference) {
    case 'quick': return 30;
    case 'moderate': return 60;
    case 'long': return 120;
    default: return 60;
  }
}

function calculateCalorieTarget(profile: UserProfile): number {
  // Basic calculation based on activity level
  const baseCalories = {
    'sedentary': 1800,
    'lightly-active': 2000,
    'moderately-active': 2200,
    'very-active': 2400,
    'extremely-active': 2600
  };

  let target = baseCalories[profile.activity_level as keyof typeof baseCalories] || 2000;

  // Adjust based on health goals
  if (profile.health_goals?.includes('Weight Loss')) {
    target -= 300;
  } else if (profile.health_goals?.includes('Weight Gain') || profile.health_goals?.includes('Muscle Building')) {
    target += 300;
  }

  return Math.max(1500, Math.min(3000, target));
}

async function getMatchingRecipes(supabase: any, preferences: any): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .lte('prep_time_minutes', Math.floor(preferences.cooking_time_limit * 0.6))
    .lte('cook_time_minutes', Math.floor(preferences.cooking_time_limit * 0.8));

  // Build exclusion filters for dietary restrictions and allergies
  const exclusions = [
    ...preferences.dietary_restrictions.map((restriction: string) => restriction.toLowerCase()),
    ...preferences.allergies.map((allergy: string) => allergy.toLowerCase())
  ];

  console.log('Exclusions:', exclusions);

  // Apply dietary restriction filters
  if (preferences.dietary_restrictions.length > 0) {
    const dietaryTags = preferences.dietary_restrictions.map((restriction: string) => {
      const normalized = restriction.toLowerCase().replace(/\s+/g, '-');
      return normalized;
    });
    
    // Include recipes that have matching dietary tags
    query = query.overlaps('tags', dietaryTags);
  }

  // Apply cuisine preferences if specified
  if (preferences.cuisine_preferences.length > 0) {
    const cuisineTags = preferences.cuisine_preferences.map((cuisine: string) => 
      cuisine.toLowerCase().replace(/\s+/g, '-')
    );
    query = query.overlaps('tags', cuisineTags);
  }

  const { data: recipes, error } = await query.limit(50);
  
  if (error) {
    console.error('Recipe query error:', error);
    throw error;
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found with filters, trying broader search...');
    
    // Fallback: get all recipes and filter manually
    const { data: allRecipes, error: fallbackError } = await supabase
      .from('recipes')
      .select('*')
      .lte('prep_time_minutes', preferences.cooking_time_limit)
      .limit(50);

    if (fallbackError) throw fallbackError;
    
    return (allRecipes || []).filter((recipe: Recipe) => {
      // Manual filtering for allergies
      const recipeTags = (recipe.tags || []).map(tag => tag.toLowerCase());
      const hasAllergen = preferences.allergies.some((allergy: string) => 
        recipeTags.some(tag => tag.includes(allergy.toLowerCase()))
      );
      
      return !hasAllergen;
    });
  }

  // Additional manual filtering for allergies
  return recipes.filter((recipe: Recipe) => {
    const recipeTags = (recipe.tags || []).map(tag => tag.toLowerCase());
    const hasAllergen = preferences.allergies.some((allergy: string) => 
      recipeTags.some(tag => tag.includes(allergy.toLowerCase()))
    );
    
    return !hasAllergen;
  });
}

async function generateWeeklyMealPlan(
  supabase: any, 
  userId: string, 
  startDate: string, 
  recipes: Recipe[], 
  preferences: any
) {
  const mealPlanId = crypto.randomUUID();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  // Create meal plan record
  const { error: planError } = await supabase
    .from('meal_plans')
    .insert({
      id: mealPlanId,
      user_id: userId,
      name: `Week of ${startDate}`,
      start_date: startDate,
      end_date: endDate.toISOString().split('T')[0],
      is_active: true
    });

  if (planError) throw planError;

  const dailyPlans = [];
  const usedRecipeIds = new Set<string>();

  // Generate meals for 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayMeals = [];
    const mealTypes = [
      { type: 'breakfast', time: '08:00', calorieRatio: 0.25 },
      { type: 'lunch', time: '13:00', calorieRatio: 0.35 },
      { type: 'dinner', time: '19:00', calorieRatio: 0.4 }
    ];

    if (preferences.include_snacks) {
      mealTypes.push({ type: 'snack', time: '15:30', calorieRatio: 0.1 });
    }

    for (const mealType of mealTypes) {
      const targetCalories = preferences.calorie_target * mealType.calorieRatio;
      const selectedRecipe = selectOptimalRecipe(
        recipes, 
        mealType.type, 
        targetCalories, 
        usedRecipeIds,
        preferences
      );

      if (selectedRecipe) {
        usedRecipeIds.add(selectedRecipe.id);
        
        const mealId = crypto.randomUUID();
        const meal = {
          id: mealId,
          meal_plan_id: mealPlanId,
          recipe_id: selectedRecipe.id,
          meal_type: mealType.type,
          scheduled_date: dateStr,
          scheduled_time: mealType.time,
          servings: 1,
          completed: false
        };

        dayMeals.push({
          ...meal,
          name: selectedRecipe.name,
          calories: selectedRecipe.calories_per_serving,
          prep_time: selectedRecipe.prep_time_minutes,
          cook_time: selectedRecipe.cook_time_minutes,
          image_url: selectedRecipe.image_url,
          scheduled_time: `${dateStr}T${mealType.time}:00`
        });
      }
    }

    // Insert meals into database
    if (dayMeals.length > 0) {
      const { error: mealsError } = await supabase
        .from('meals')
        .insert(dayMeals.map(meal => ({
          id: meal.id,
          meal_plan_id: meal.meal_plan_id,
          recipe_id: meal.recipe_id,
          meal_type: meal.meal_type,
          scheduled_date: meal.scheduled_date,
          scheduled_time: meal.scheduled_time,
          servings: meal.servings,
          completed: meal.completed
        })));

      if (mealsError) {
        console.error('Error inserting meals:', mealsError);
      }
    }

    const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    
    dailyPlans.push({
      date: dateStr,
      meals: dayMeals,
      total_calories: totalCalories,
      nutrition_summary: calculateNutritionSummary(dayMeals, recipes)
    });
  }

  return {
    id: mealPlanId,
    user_id: userId,
    week_starting: startDate,
    daily_plans: dailyPlans,
    grocery_list: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function selectOptimalRecipe(
  recipes: Recipe[], 
  mealType: string, 
  targetCalories: number, 
  usedRecipeIds: Set<string>,
  preferences: any
): Recipe | null {
  // Filter recipes suitable for meal type and not recently used
  const availableRecipes = recipes.filter(recipe => {
    if (usedRecipeIds.has(recipe.id)) return false;
    
    const tags = (recipe.tags || []).map(tag => tag.toLowerCase());
    
    // Check meal type suitability
    const isSuitableForMealType = 
      tags.includes(mealType) ||
      tags.includes('any-meal') ||
      (mealType === 'breakfast' && (tags.includes('breakfast') || recipe.name.toLowerCase().includes('breakfast'))) ||
      (mealType === 'lunch' && (tags.includes('lunch') || tags.includes('main-course'))) ||
      (mealType === 'dinner' && (tags.includes('dinner') || tags.includes('main-course'))) ||
      (mealType === 'snack' && (tags.includes('snack') || tags.includes('light')));

    return isSuitableForMealType;
  });

  if (availableRecipes.length === 0) {
    // Fallback: use any unused recipe
    const fallbackRecipes = recipes.filter(recipe => !usedRecipeIds.has(recipe.id));
    if (fallbackRecipes.length === 0) return null;
    return fallbackRecipes[Math.floor(Math.random() * fallbackRecipes.length)];
  }

  // Score recipes based on multiple factors
  const scoredRecipes = availableRecipes.map(recipe => {
    const calorieScore = 1 - Math.abs(recipe.calories_per_serving - targetCalories) / targetCalories;
    const difficultyScore = recipe.difficulty === 'easy' ? 1 : recipe.difficulty === 'medium' ? 0.7 : 0.4;
    const timeScore = 1 - (recipe.prep_time_minutes + recipe.cook_time_minutes) / 120;
    
    // Cuisine preference bonus
    const cuisineScore = preferences.cuisine_preferences.length > 0 ? 
      (recipe.tags || []).some((tag: string) => 
        preferences.cuisine_preferences.some((pref: string) => 
          tag.toLowerCase().includes(pref.toLowerCase())
        )
      ) ? 1.2 : 1.0 : 1.0;

    const totalScore = (calorieScore * 0.4 + difficultyScore * 0.3 + timeScore * 0.3) * cuisineScore;
    
    return { recipe, score: totalScore };
  });

  // Sort by score and add some randomness to avoid repetition
  scoredRecipes.sort((a, b) => b.score - a.score);
  
  // Select from top 3 recipes to add variety
  const topRecipes = scoredRecipes.slice(0, Math.min(3, scoredRecipes.length));
  const selectedIndex = Math.floor(Math.random() * topRecipes.length);
  
  return topRecipes[selectedIndex]?.recipe || null;
}

function calculateNutritionSummary(meals: any[], recipes: Recipe[]) {
  const summary = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  meals.forEach(meal => {
    const recipe = recipes.find(r => r.id === meal.recipe_id);
    if (recipe) {
      summary.calories += recipe.calories_per_serving;
      summary.protein += recipe.protein_g;
      summary.carbs += recipe.carbs_g;
      summary.fat += recipe.fat_g;
      summary.fiber += recipe.fibre_g;
      summary.sugar += recipe.sugar_g;
      summary.sodium += recipe.sodium_mg;
    }
  });

  return summary;
}