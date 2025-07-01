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
        throw new Error('User profile not found. Please complete your profile setup.');
      }

      // Build comprehensive preferences from all sources
      const preferences: MealPlanningPreferences = {
        // Dietary restrictions from profile
        dietary_restrictions: profile.dietaryRestrictions || [],
        
        // Allergies from profile (extract from medical conditions)
        allergies: (profile.medicalConditions || [])
          .filter(condition => condition.toLowerCase().includes('allergy'))
          .map(condition => condition.replace(/\s*allergy\s*/i, '').trim())
          .concat(profile.allergies || []),
        
        // Cuisine preferences from settings
        cuisine_preferences: mealPlanningSettings?.preferred_cuisines || [],
        
        // Cooking time limit from settings
        cooking_time_limit: getCookingTimeLimit(mealPlanningSettings?.cooking_time_preference),
        
        // Budget range from settings
        budget_range: mealPlanningSettings?.budget_range || 'medium',
        
        // Calculate calorie target based on profile
        calorie_target: calculateCalorieTarget(profile),
        protein_target: 150,
        carb_target: 250,
        fat_target: 67,
      };

      console.log('Generating meal plan with preferences:', preferences);

      const weekStart = startDate || new Date().toISOString().split('T')[0];
      const newMealPlan = await mealPlanningService.generateWeeklyMealPlan(
        user!.id,
        preferences,
        weekStart
      );

      setCurrentMealPlan(newMealPlan);
      return newMealPlan;
    } catch (err: any) {
      console.error('Meal plan generation error:', err);
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
        return 90; // 1.5 hours default
    }
  };

  // Calculate calorie target based on user profile
  const calculateCalorieTarget = (profile: any): number => {
    // Base calories by activity level
    const baseCalories = {
      'sedentary': 1800,
      'lightly-active': 2000,
      'moderately-active': 2200,
      'very-active': 2400,
      'extremely-active': 2600
    };

    let target = baseCalories[profile.activityLevel as keyof typeof baseCalories] || 2000;

    // Adjust based on health goals
    const healthGoals = profile.healthGoals || [];
    if (healthGoals.includes('Weight Loss')) {
      target -= 300;
    } else if (healthGoals.includes('Weight Gain') || healthGoals.includes('Muscle Building')) {
      target += 300;
    }

    // Ensure reasonable bounds
    return Math.max(1500, Math.min(3000, target));
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