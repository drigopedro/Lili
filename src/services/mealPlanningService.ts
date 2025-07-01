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
  // Generate a weekly meal plan using the edge function
  async generateWeeklyMealPlan(
    userId: string, 
    preferences: MealPlanningPreferences,
    startDate: string
  ): Promise<WeeklyMealPlan> {
    try {
      console.log('Generating meal plan with preferences:', preferences);
      
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          user_id: userId,
          start_date: startDate,
          preferences: {
            dietary_restrictions: preferences.dietary_restrictions,
            allergies: preferences.allergies,
            cuisine_preferences: preferences.cuisine_preferences,
            cooking_time_limit: preferences.cooking_time_limit,
            budget_range: preferences.budget_range,
            calorie_target: preferences.calorie_target
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate meal plan');
      }

      if (!data) {
        throw new Error('No data returned from meal plan generation');
      }

      console.log('Generated meal plan:', data);
      return data;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
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

  private getDefaultMealImage(mealType: string): string {
    const images = {
      breakfast: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
      lunch: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      dinner: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      snack: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
    };
    return images[mealType as keyof typeof images] || images.lunch;
  }
}

export const mealPlanningService = new MealPlanningService();