import { supabase } from '../lib/supabase';

export interface FoodSearchResult {
  foods?: {
    food: Array<{
      food_id: string;
      food_name: string;
      food_type: string;
      food_url: string;
      brand_name?: string;
      food_description: string;
    }>;
    page_number: string;
    total_results: string;
    max_results: string;
  };
}

export interface RecipeSearchResult {
  recipes?: {
    recipe: Array<{
      recipe_id: string;
      recipe_name: string;
      recipe_url: string;
      recipe_description: string;
      recipe_image?: string;
      recipe_nutrition?: {
        calories: string;
        carbohydrate: string;
        fat: string;
        protein: string;
      };
    }>;
    page_number: string;
    total_results: string;
    max_results: string;
  };
}

export interface NutritionInfo {
  food: {
    food_id: string;
    food_name: string;
    food_type: string;
    food_url: string;
    servings: {
      serving: Array<{
        serving_id: string;
        serving_description: string;
        serving_url: string;
        metric_serving_amount: string;
        metric_serving_unit: string;
        number_of_units: string;
        measurement_description: string;
        calories: string;
        carbohydrate: string;
        protein: string;
        fat: string;
        saturated_fat: string;
        polyunsaturated_fat: string;
        monounsaturated_fat: string;
        cholesterol: string;
        sodium: string;
        potassium: string;
        fiber: string;
        sugar: string;
        vitamin_a: string;
        vitamin_c: string;
        calcium: string;
        iron: string;
      }>;
    };
  };
}

export interface BarcodeResult {
  food_id?: {
    value: string;
  };
  nutrition?: NutritionInfo;
  error?: {
    message: string;
  };
}

class FatSecretService {
  async searchFoods(
    query: string, 
    pageNumber: number = 0, 
    maxResults: number = 20
  ): Promise<FoodSearchResult> {
    try {
      const { data, error } = await supabase.functions.invoke('food-search', {
        body: { 
          search_expression: query,
          page_number: pageNumber,
          max_results: maxResults
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to search foods');
      }

      return data;
    } catch (error) {
      console.error('Food search error:', error);
      throw error;
    }
  }

  async searchRecipes(
    query: string, 
    cuisine?: string,
    pageNumber: number = 0, 
    maxResults: number = 20
  ): Promise<RecipeSearchResult> {
    try {
      const { data, error } = await supabase.functions.invoke('recipe-search', {
        body: { 
          search_expression: query,
          cuisine,
          page_number: pageNumber,
          max_results: maxResults
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to search recipes');
      }

      return data;
    } catch (error) {
      console.error('Recipe search error:', error);
      throw error;
    }
  }

  async getNutritionInfo(foodId: string, servingId?: string): Promise<NutritionInfo> {
    try {
      const { data, error } = await supabase.functions.invoke('nutrition-info', {
        body: { 
          food_id: foodId,
          serving_id: servingId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get nutrition information');
      }

      return data;
    } catch (error) {
      console.error('Nutrition info error:', error);
      throw error;
    }
  }

  async lookupBarcode(barcode: string): Promise<BarcodeResult> {
    try {
      const { data, error } = await supabase.functions.invoke('barcode-lookup', {
        body: { barcode }
      });

      if (error) {
        throw new Error(error.message || 'Failed to lookup barcode');
      }

      return data;
    } catch (error) {
      console.error('Barcode lookup error:', error);
      throw error;
    }
  }

  // Helper method to format nutrition data for our database
  formatNutritionForDatabase(serving: any) {
    return {
      calories: parseFloat(serving.calories) || 0,
      protein_g: parseFloat(serving.protein) || 0,
      carbs_g: parseFloat(serving.carbohydrate) || 0,
      fat_g: parseFloat(serving.fat) || 0,
      fiber_g: parseFloat(serving.fiber) || 0,
      sugar_g: parseFloat(serving.sugar) || 0,
      sodium_mg: parseFloat(serving.sodium) || 0,
      saturated_fat_g: parseFloat(serving.saturated_fat) || 0,
      cholesterol_mg: parseFloat(serving.cholesterol) || 0,
      potassium_mg: parseFloat(serving.potassium) || 0,
      vitamin_a_iu: parseFloat(serving.vitamin_a) || 0,
      vitamin_c_mg: parseFloat(serving.vitamin_c) || 0,
      calcium_mg: parseFloat(serving.calcium) || 0,
      iron_mg: parseFloat(serving.iron) || 0,
    };
  }

  // Helper method to search and save ingredients to our database
  async searchAndSaveIngredient(query: string) {
    try {
      const searchResult = await this.searchFoods(query, 0, 1);
      
      if (!searchResult.foods?.food || searchResult.foods.food.length === 0) {
        throw new Error('No foods found');
      }

      const food = searchResult.foods.food[0];
      const nutritionInfo = await this.getNutritionInfo(food.food_id);
      
      if (!nutritionInfo.food.servings?.serving || nutritionInfo.food.servings.serving.length === 0) {
        throw new Error('No nutrition information available');
      }

      // Use the first serving as the base nutrition info (usually per 100g)
      const baseServing = nutritionInfo.food.servings.serving[0];
      const nutritionData = this.formatNutritionForDatabase(baseServing);

      // Save to our ingredients table
      const { data, error } = await supabase
        .from('ingredients')
        .upsert({
          name: food.food_name,
          category: this.categorizeFood(food.food_name),
          calories_per_100g: nutritionData.calories,
          protein_per_100g: nutritionData.protein_g,
          carbs_per_100g: nutritionData.carbs_g,
          fat_per_100g: nutritionData.fat_g,
          fibre_per_100g: nutritionData.fiber_g,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error searching and saving ingredient:', error);
      throw error;
    }
  }

  // Helper method to categorize foods
  private categorizeFood(foodName: string): string {
    const name = foodName.toLowerCase();
    
    if (name.includes('meat') || name.includes('beef') || name.includes('pork') || name.includes('lamb')) {
      return 'meat';
    } else if (name.includes('chicken') || name.includes('turkey') || name.includes('duck')) {
      return 'poultry';
    } else if (name.includes('fish') || name.includes('salmon') || name.includes('tuna') || name.includes('cod')) {
      return 'seafood';
    } else if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('butter')) {
      return 'dairy';
    } else if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('berry')) {
      return 'fruit';
    } else if (name.includes('lettuce') || name.includes('spinach') || name.includes('carrot') || name.includes('broccoli')) {
      return 'vegetable';
    } else if (name.includes('rice') || name.includes('bread') || name.includes('pasta') || name.includes('oats')) {
      return 'grain';
    } else if (name.includes('beans') || name.includes('lentils') || name.includes('chickpeas')) {
      return 'legume';
    } else if (name.includes('nuts') || name.includes('seeds') || name.includes('almond') || name.includes('walnut')) {
      return 'nuts_seeds';
    } else {
      return 'other';
    }
  }
}

export const fatSecretService = new FatSecretService();