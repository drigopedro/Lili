import { supabase } from '../lib/supabase';
import type { 
  WeeklyMealPlan, 
  DailyMealPlan, 
  Meal, 
  MealPlanningPreferences,
  NutritionSummary,
  GroceryItem
} from '../types/meal-planning';
import { Recipe } from '../hooks/useRecipes';

class MealPlanningService {
  // Generate a weekly meal plan based on user preferences
  async generateWeeklyMealPlan(
    userId: string, 
    preferences: MealPlanningPreferences,
    startDate: string
  ): Promise<WeeklyMealPlan> {
    try {
      // Get available recipes that match preferences
      const availableRecipes = await this.getMatchingRecipes(preferences);
      
      // Generate daily plans for 7 days
      const dailyPlans: DailyMealPlan[] = [];
      const usedRecipeIds = new Set<string>();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const dailyPlan = await this.generateDailyMealPlan(
          date.toISOString().split('T')[0],
          preferences,
          availableRecipes,
          usedRecipeIds
        );
        
        dailyPlans.push(dailyPlan);
      }
      
      // Generate grocery list
      const groceryList = this.generateGroceryList(dailyPlans);
      
      // Save to database
      const weeklyPlan: WeeklyMealPlan = {
        id: crypto.randomUUID(),
        user_id: userId,
        week_starting: startDate,
        daily_plans: dailyPlans,
        grocery_list: groceryList,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await this.saveMealPlan(weeklyPlan);
      
      return weeklyPlan;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  }

  private async getMatchingRecipes(preferences: MealPlanningPreferences): Promise<Recipe[]> {
    let query = supabase
      .from('recipes')
      .select('*')
      .lte('prep_time_minutes', preferences.cooking_time_limit)
      .lte('cook_time_minutes', preferences.cooking_time_limit);

    // Filter by dietary restrictions
    if (preferences.dietary_restrictions.length > 0) {
      query = query.not('tags', 'cs', `{${preferences.dietary_restrictions.join(',')}}`);
    }

    // Filter by allergies
    if (preferences.allergies.length > 0) {
      query = query.not('tags', 'cs', `{${preferences.allergies.join(',')}}`);
    }

    // Filter by cuisine preferences if specified
    if (preferences.cuisine_preferences && preferences.cuisine_preferences.length > 0) {
      // Use the overlaps operator to find recipes with matching cuisine tags
      query = query.or(
        preferences.cuisine_preferences.map(cuisine => 
          `tags.cs.{${cuisine}}`
        ).join(',')
      );
    }

    const { data: recipes, error } = await query.limit(50);
    
    if (error) throw error;
    
    return recipes?.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.image_url,
      prepTimeMinutes: recipe.prep_time_minutes,
      cookTimeMinutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      instructions: recipe.instructions,
      tags: recipe.tags,
      caloriesPerServing: recipe.calories_per_serving,
      proteinG: recipe.protein_g,
      carbsG: recipe.carbs_g,
      fatG: recipe.fat_g,
      fibreG: recipe.fibre_g,
      sugarG: recipe.sugar_g,
      sodiumMg: recipe.sodium_mg,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    })) || [];
  }

  private async generateDailyMealPlan(
    date: string,
    preferences: MealPlanningPreferences,
    availableRecipes: Recipe[],
    usedRecipeIds: Set<string>
  ): Promise<DailyMealPlan> {
    const meals: Meal[] = [];
    const mealTypes: Array<{ type: 'breakfast' | 'lunch' | 'dinner', time: string, calorieTarget: number }> = [
      { type: 'breakfast', time: '08:00', calorieTarget: preferences.calorie_target * 0.25 },
      { type: 'lunch', time: '13:00', calorieTarget: preferences.calorie_target * 0.35 },
      { type: 'dinner', time: '19:00', calorieTarget: preferences.calorie_target * 0.4 },
    ];

    for (const mealType of mealTypes) {
      const recipe = this.selectOptimalRecipe(
        availableRecipes,
        mealType.type,
        mealType.calorieTarget,
        usedRecipeIds
      );

      if (recipe) {
        usedRecipeIds.add(recipe.id);
        
        const meal: Meal = {
          id: crypto.randomUUID(),
          name: recipe.name,
          type: mealType.type,
          calories: recipe.caloriesPerServing,
          prep_time: recipe.prepTimeMinutes,
          cook_time: recipe.cookTimeMinutes,
          image_url: recipe.imageUrl || this.getDefaultMealImage(mealType.type),
          recipe_id: recipe.id,
          scheduled_time: `${date}T${mealType.time}:00`,
          completed: false,
        };
        
        meals.push(meal);
      }
    }

    const nutritionSummary = this.calculateNutritionSummary(meals, availableRecipes);
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    return {
      date,
      meals,
      total_calories: totalCalories,
      nutrition_summary: nutritionSummary,
    };
  }

  private selectOptimalRecipe(
    recipes: Recipe[],
    mealType: string,
    calorieTarget: number,
    usedRecipeIds: Set<string>
  ): Recipe | null {
    // Filter recipes suitable for meal type and not recently used
    const suitableRecipes = recipes.filter(recipe => {
      if (usedRecipeIds.has(recipe.id)) return false;
      
      const tags = recipe.tags || [];
      const isBreakfast = mealType === 'breakfast' && 
        (tags.includes('breakfast') || recipe.name.toLowerCase().includes('breakfast'));
      const isLunch = mealType === 'lunch' && 
        (tags.includes('lunch') || tags.includes('main'));
      const isDinner = mealType === 'dinner' && 
        (tags.includes('dinner') || tags.includes('main'));
      
      return isBreakfast || isLunch || isDinner || tags.includes('any-meal');
    });

    if (suitableRecipes.length === 0) {
      return recipes.find(recipe => !usedRecipeIds.has(recipe.id)) || null;
    }

    // Score recipes based on calorie proximity and other factors
    const scoredRecipes = suitableRecipes.map(recipe => {
      const calorieScore = 1 - Math.abs(recipe.caloriesPerServing - calorieTarget) / calorieTarget;
      const difficultyScore = recipe.difficulty === 'easy' ? 1 : recipe.difficulty === 'medium' ? 0.7 : 0.4;
      const timeScore = 1 - (recipe.prepTimeMinutes + recipe.cookTimeMinutes) / 120; // Prefer shorter cooking times
      
      return {
        recipe,
        score: calorieScore * 0.5 + difficultyScore * 0.3 + timeScore * 0.2
      };
    });

    // Sort by score and return the best match
    scoredRecipes.sort((a, b) => b.score - a.score);
    return scoredRecipes[0]?.recipe || null;
  }

  private calculateNutritionSummary(meals: Meal[], recipes: Recipe[]): NutritionSummary {
    const summary: NutritionSummary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    meals.forEach(meal => {
      const recipe = recipes.find(r => r.id === meal.recipe_id);
      if (recipe) {
        summary.calories += recipe.caloriesPerServing;
        summary.protein += recipe.proteinG;
        summary.carbs += recipe.carbsG;
        summary.fat += recipe.fatG;
        summary.fiber += recipe.fibreG;
        summary.sugar += recipe.sugarG;
        summary.sodium += recipe.sodiumMg;
      }
    });

    return summary;
  }

  private generateGroceryList(dailyPlans: DailyMealPlan[]): GroceryItem[] {
    const ingredientMap = new Map<string, { quantity: number; unit: string; category: string }>();

    // This would typically fetch ingredients from recipes
    // For now, we'll generate a sample grocery list
    const sampleItems: GroceryItem[] = [
      { id: '1', name: 'Chicken Breast', quantity: 2, unit: 'lbs', category: 'Meat' },
      { id: '2', name: 'Brown Rice', quantity: 1, unit: 'bag', category: 'Grains' },
      { id: '3', name: 'Broccoli', quantity: 3, unit: 'heads', category: 'Vegetables' },
      { id: '4', name: 'Greek Yogurt', quantity: 1, unit: 'container', category: 'Dairy' },
      { id: '5', name: 'Salmon Fillet', quantity: 4, unit: 'pieces', category: 'Seafood' },
    ];

    return sampleItems;
  }

  private getDefaultMealImage(mealType: string): string {
    const images = {
      breakfast: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
      lunch: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      dinner: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      snack: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
    };
    return images[mealType as keyof typeof images] || images.lunch;
  }

  private async saveMealPlan(weeklyPlan: WeeklyMealPlan): Promise<void> {
    // Save meal plan to database
    const { error: planError } = await supabase
      .from('meal_plans')
      .insert({
        id: weeklyPlan.id,
        user_id: weeklyPlan.user_id,
        name: `Week of ${weeklyPlan.week_starting}`,
        start_date: weeklyPlan.week_starting,
        end_date: new Date(new Date(weeklyPlan.week_starting).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
      });

    if (planError) throw planError;

    // Save individual meals
    const mealsToInsert = weeklyPlan.daily_plans.flatMap(day => 
      day.meals.map(meal => ({
        id: meal.id,
        meal_plan_id: weeklyPlan.id,
        recipe_id: meal.recipe_id,
        meal_type: meal.type,
        scheduled_date: meal.scheduled_time.split('T')[0],
        scheduled_time: meal.scheduled_time.split('T')[1],
        servings: 1,
        completed: false,
      }))
    );

    const { error: mealsError } = await supabase
      .from('meals')
      .insert(mealsToInsert);

    if (mealsError) throw mealsError;
  }

  // Swap meals between different days/times
  async swapMeals(
    mealPlanId: string,
    fromMealId: string,
    toMealId: string
  ): Promise<void> {
    try {
      // Get both meals
      const { data: meals, error } = await supabase
        .from('meals')
        .select('*')
        .in('id', [fromMealId, toMealId]);

      if (error) throw error;
      if (!meals || meals.length !== 2) throw new Error('Meals not found');

      const [meal1, meal2] = meals;

      // Swap their scheduled times
      const { error: updateError } = await supabase
        .from('meals')
        .upsert([
          {
            ...meal1,
            scheduled_date: meal2.scheduled_date,
            scheduled_time: meal2.scheduled_time,
          },
          {
            ...meal2,
            scheduled_date: meal1.scheduled_date,
            scheduled_time: meal1.scheduled_time,
          },
        ]);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error swapping meals:', error);
      throw error;
    }
  }

  // Scale recipe servings
  async scaleRecipe(mealId: string, scaleFactor: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('meals')
        .update({ servings: scaleFactor })
        .eq('id', mealId);

      if (error) throw error;
    } catch (error) {
      console.error('Error scaling recipe:', error);
      throw error;
    }
  }

  // Mark meal as completed
  async completeMeal(mealId: string, rating?: number): Promise<void> {
    try {
      const updateData: any = {
        completed: true,
        completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('meals')
        .update(updateData)
        .eq('id', mealId);

      if (error) throw error;

      // Log the meal completion
      if (rating) {
        await this.logMealRating(mealId, rating);
      }
    } catch (error) {
      console.error('Error completing meal:', error);
      throw error;
    }
  }

  private async logMealRating(mealId: string, rating: number): Promise<void> {
    // This would typically save to a meal_ratings table
    console.log(`Meal ${mealId} rated ${rating} stars`);
  }

  // Get user's current meal plan
  async getCurrentMealPlan(userId: string): Promise<WeeklyMealPlan | null> {
    try {
      const { data: mealPlan, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            *,
            recipes (*)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!mealPlan) return null;

      // Transform database data to WeeklyMealPlan format
      const dailyPlans = this.groupMealsByDate(mealPlan.meals);
      
      return {
        id: mealPlan.id,
        user_id: mealPlan.user_id,
        week_starting: mealPlan.start_date,
        daily_plans: dailyPlans,
        grocery_list: [], // Would be fetched separately
        created_at: mealPlan.created_at,
        updated_at: mealPlan.updated_at,
      };
    } catch (error) {
      console.error('Error getting current meal plan:', error);
      return null;
    }
  }

  private groupMealsByDate(meals: any[]): DailyMealPlan[] {
    const grouped = meals.reduce((acc, meal) => {
      const date = meal.scheduled_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        id: meal.id,
        name: meal.recipes?.name || 'Unknown Meal',
        type: meal.meal_type,
        calories: meal.recipes?.calories_per_serving || 0,
        prep_time: meal.recipes?.prep_time_minutes || 0,
        cook_time: meal.recipes?.cook_time_minutes || 0,
        image_url: meal.recipes?.image_url || this.getDefaultMealImage(meal.meal_type),
        recipe_id: meal.recipe_id,
        scheduled_time: `${meal.scheduled_date}T${meal.scheduled_time}`,
        completed: meal.completed,
      });
      return acc;
    }, {} as Record<string, Meal[]>);

    return Object.entries(grouped).map(([date, meals]) => ({
      date,
      meals,
      total_calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      nutrition_summary: {
        calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
        protein: 0, // Would calculate from recipes
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      },
    }));
  }
}

export const mealPlanningService = new MealPlanningService();