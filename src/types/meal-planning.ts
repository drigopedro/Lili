export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  prep_time: number;
  cook_time: number;
  image_url: string;
  recipe_id: string;
  scheduled_time: string;
  completed?: boolean;
  rating?: number;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface DailyMealPlan {
  date: string;
  meals: Meal[];
  total_calories: number;
  nutrition_summary: NutritionSummary;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimated_cost?: number;
}

export interface WeeklyMealPlan {
  id: string;
  user_id: string;
  week_starting: string;
  daily_plans: DailyMealPlan[];
  grocery_list: GroceryItem[];
  created_at: string;
  updated_at: string;
}

export interface MealPlanningPreferences {
  dietary_restrictions: string[];
  allergies: string[];
  cuisine_preferences: string[];
  cooking_time_limit: number;
  budget_range: 'low' | 'medium' | 'high';
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
}

export interface MealSwapRequest {
  fromMealId: string;
  toMealId: string;
  fromDate: string;
  toDate: string;
}