export interface Recipe {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  cuisine_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  notes?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  sugar: number;
  sodium: number;
  saturated_fat?: number;
  cholesterol?: number;
  potassium?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  calcium?: number;
  iron?: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: UKGroceryCategory;
  estimated_cost?: number;
  checked: boolean;
  notes?: string;
  brand?: string;
}

export interface GroceryList {
  id: string;
  user_id: string;
  meal_plan_id?: string;
  items: GroceryItem[];
  estimated_cost: number;
  created_at: string;
  updated_at?: string;
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  recipe_name: string;
  recipe_data: Recipe;
  saved_at: string;
}

export type UKGroceryCategory = 
  | 'Fresh Produce'
  | 'Meat & Poultry'
  | 'Fish & Seafood'
  | 'Dairy & Eggs'
  | 'Bakery'
  | 'Frozen Foods'
  | 'Pantry Essentials'
  | 'Herbs & Spices'
  | 'Beverages'
  | 'Household'
  | 'Health & Beauty';

export interface RecipeFilters {
  cuisine_type?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  max_prep_time?: number;
  max_cook_time?: number;
  dietary_restrictions?: string[];
  tags?: string[];
}

export interface ServingAdjustment {
  original_servings: number;
  new_servings: number;
  scale_factor: number;
}