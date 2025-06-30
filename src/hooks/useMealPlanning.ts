import { useState, useEffect } from 'react';
import { mealPlanningService } from '../services/mealPlanningService';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useSettings } from './useSettings';
import type { WeeklyMealPlan, MealPlanningPreferences } from '../types/meal-planning';

export const useMealPlanning = () => {
  const [currentMealPlan, setCurrentMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { mealPlanningSettings } = useSettings();

  useEffect(() => {
    if (user) {
      fetchCurrentMealPlan();
    }
  }, [user]);

  const fetchCurrentMealPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const mealPlan = await mealPlanningService.getCurrentMealPlan(user!.id);
      setCurrentMealPlan(mealPlan);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meal plan');
    } finally {
      setLoading(false);
    }
  };

  const generateNewMealPlan = async (startDate?: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Get meal preferences from settings
      const cookingTimeLimit = getCookingTimeLimit(mealPlanningSettings?.cooking_time_preference);
      
      const preferences: MealPlanningPreferences = {
        dietary_restrictions: profile.dietaryRestrictions || [],
        allergies: profile.allergies || [],
        cuisine_preferences: mealPlanningSettings?.preferred_cuisines || [],
        cooking_time_limit: cookingTimeLimit,
        budget_range: mealPlanningSettings?.budget_range || 'medium',
        calorie_target: 2000, // Would calculate based on user profile
        protein_target: 150,
        carb_target: 250,
        fat_target: 67,
      };

      const weekStart = startDate || new Date().toISOString().split('T')[0];
      const newMealPlan = await mealPlanningService.generateWeeklyMealPlan(
        user!.id,
        preferences,
        weekStart
      );

      setCurrentMealPlan(newMealPlan);
      return newMealPlan;
    } catch (err: any) {
      setError(err.message || 'Failed to generate meal plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert cooking time preference to minutes
  const getCookingTimeLimit = (preference?: string): number => {
    switch (preference) {
      case 'quick':
        return 30; // 30 minutes
      case 'moderate':
        return 60; // 1 hour
      case 'long':
        return 120; // 2 hours
      case 'any':
      default:
        return 180; // 3 hours (essentially no limit)
    }
  };

  const swapMeals = async (fromMealId: string, toMealId: string) => {
    try {
      if (!currentMealPlan) return;

      await mealPlanningService.swapMeals(currentMealPlan.id, fromMealId, toMealId);
      await fetchCurrentMealPlan(); // Refresh the meal plan
    } catch (err: any) {
      setError(err.message || 'Failed to swap meals');
      throw err;
    }
  };

  const scaleRecipe = async (mealId: string, scaleFactor: number) => {
    try {
      await mealPlanningService.scaleRecipe(mealId, scaleFactor);
      await fetchCurrentMealPlan(); // Refresh the meal plan
    } catch (err: any) {
      setError(err.message || 'Failed to scale recipe');
      throw err;
    }
  };

  const completeMeal = async (mealId: string, rating?: number) => {
    try {
      await mealPlanningService.completeMeal(mealId, rating);
      await fetchCurrentMealPlan(); // Refresh the meal plan
    } catch (err: any) {
      setError(err.message || 'Failed to complete meal');
      throw err;
    }
  };

  const getTodaysMeals = () => {
    if (!currentMealPlan) return [];
    
    const today = new Date().toISOString().split('T')[0];
    const todaysPlan = currentMealPlan.daily_plans.find(plan => plan.date === today);
    
    return todaysPlan?.meals || [];
  };

  return {
    currentMealPlan,
    loading,
    error,
    generateNewMealPlan,
    swapMeals,
    scaleRecipe,
    completeMeal,
    getTodaysMeals,
    refetch: fetchCurrentMealPlan,
  };
};