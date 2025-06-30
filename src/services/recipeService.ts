import { supabase } from '../lib/supabase';
import type { Recipe, SavedRecipe, RecipeFilters } from '../types/recipe';

class RecipeService {
  // Get recipe by ID from our database
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.formatRecipeFromDatabase(data);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      return null;
    }
  }

  // Get recipes with filters
  async getRecipes(filters?: RecipeFilters): Promise<Recipe[]> {
    try {
      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.cuisine_type) {
        query = query.ilike('tags', `%${filters.cuisine_type}%`);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.max_prep_time) {
        query = query.lte('prep_time_minutes', filters.max_prep_time);
      }

      if (filters?.max_cook_time) {
        query = query.lte('cook_time_minutes', filters.max_cook_time);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      return data?.map(recipe => this.formatRecipeFromDatabase(recipe)) || [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }

  // Save recipe to user's collection
  async saveRecipe(userId: string, recipe: Recipe): Promise<SavedRecipe | null> {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: userId,
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          recipe_data: recipe,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        user_id: data.user_id,
        recipe_id: data.recipe_id,
        recipe_name: data.recipe_name,
        recipe_data: data.recipe_data,
        saved_at: data.saved_at,
      };
    } catch (error) {
      console.error('Error saving recipe:', error);
      return null;
    }
  }

  // Get user's saved recipes
  async getSavedRecipes(userId: string): Promise<SavedRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      return [];
    }
  }

  // Remove recipe from saved collection
  async unsaveRecipe(userId: string, recipeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unsaving recipe:', error);
      return false;
    }
  }

  // Check if recipe is saved by user
  async isRecipeSaved(userId: string, recipeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if recipe is saved:', error);
      return false;
    }
  }

  // Scale recipe servings
  scaleRecipe(recipe: Recipe, newServings: number): Recipe {
    const scaleFactor = newServings / recipe.servings;

    return {
      ...recipe,
      servings: newServings,
      ingredients: recipe.ingredients.map(ingredient => ({
        ...ingredient,
        quantity: Math.round((ingredient.quantity * scaleFactor) * 100) / 100,
      })),
      nutrition: {
        ...recipe.nutrition,
        calories: Math.round(recipe.nutrition.calories * scaleFactor),
        protein: Math.round((recipe.nutrition.protein * scaleFactor) * 10) / 10,
        carbs: Math.round((recipe.nutrition.carbs * scaleFactor) * 10) / 10,
        fat: Math.round((recipe.nutrition.fat * scaleFactor) * 10) / 10,
        fibre: Math.round((recipe.nutrition.fibre * scaleFactor) * 10) / 10,
        sugar: Math.round((recipe.nutrition.sugar * scaleFactor) * 10) / 10,
        sodium: Math.round((recipe.nutrition.sodium * scaleFactor) * 10) / 10,
      },
    };
  }

  private formatRecipeFromDatabase(data: any): Recipe {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      prep_time: data.prep_time_minutes,
      cook_time: data.cook_time_minutes,
      servings: data.servings,
      difficulty: data.difficulty,
      ingredients: [], // Would need to fetch from recipe_ingredients table
      instructions: data.instructions || [],
      nutrition: {
        calories: data.calories_per_serving,
        protein: data.protein_g,
        carbs: data.carbs_g,
        fat: data.fat_g,
        fibre: data.fibre_g,
        sugar: data.sugar_g,
        sodium: data.sodium_mg,
      },
      cuisine_type: data.tags?.[0] || '',
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}

export const recipeService = new RecipeService();