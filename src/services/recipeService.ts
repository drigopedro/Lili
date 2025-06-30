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
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) throw error;
      if (!data) return null;

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
      // Check if already saved
      const { data: existingData, error: checkError } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipe.id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      // If already saved, return existing data
      if (existingData) {
        const { data: savedRecipe } = await supabase
          .from('saved_recipes')
          .select('*')
          .eq('id', existingData.id)
          .maybeSingle(); // Changed from .single() to .maybeSingle()
          
        return savedRecipe;
      }
      
      // Otherwise, save the recipe
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
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if recipe is saved:', error);
      return false;
    }
  }

  // Rate a recipe
  async rateRecipe(recipeId: string, rating: number): Promise<boolean> {
    // This would typically save to a recipe_ratings table
    console.log(`Recipe ${recipeId} rated ${rating} stars`);
    return true;
  }

  // Review a recipe
  async reviewRecipe(recipeId: string, rating: number, comment: string): Promise<boolean> {
    // This would typically save to a recipe_reviews table
    console.log(`Recipe ${recipeId} reviewed with ${rating} stars: ${comment}`);
    return true;
  }

  // Mark a review as helpful
  async markReviewHelpful(reviewId: string): Promise<boolean> {
    // This would typically update a helpful_count in the reviews table
    console.log(`Review ${reviewId} marked as helpful`);
    return true;
  }

  // Report a review
  async reportReview(reviewId: string, reason: string): Promise<boolean> {
    // This would typically save to a review_reports table
    console.log(`Review ${reviewId} reported for ${reason}`);
    return true;
  }

  // Get recipe ratings
  async getRecipeRatings(recipeId: string): Promise<any> {
    // This would typically fetch from a recipe_ratings table
    // For now, return mock data
    return {
      averageRating: 4.5,
      totalReviews: 12,
      userRating: null,
      reviews: [
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah M.',
          rating: 5,
          comment: 'Absolutely delicious! My family loved it.',
          createdAt: new Date().toISOString(),
          helpful: 3,
          userHelpful: false
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'John D.',
          rating: 4,
          comment: 'Great recipe, but I added a bit more seasoning.',
          createdAt: new Date().toISOString(),
          helpful: 1,
          userHelpful: false
        }
      ]
    };
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
      ingredients: this.generateSampleIngredients(data.name), // Would fetch from recipe_ingredients table
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

  // Helper method to generate sample ingredients for demo purposes
  private generateSampleIngredients(recipeName: string) {
    // This is a simplified version - in reality, you'd fetch from recipe_ingredients table
    const commonIngredients = [
      { id: '1', name: 'Chicken breast', quantity: 500, unit: 'g', category: 'Meat' },
      { id: '2', name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Oils' },
      { id: '3', name: 'Garlic', quantity: 2, unit: 'cloves', category: 'Produce' },
      { id: '4', name: 'Salt', quantity: 1, unit: 'tsp', category: 'Spices' },
      { id: '5', name: 'Black pepper', quantity: 0.5, unit: 'tsp', category: 'Spices' },
      { id: '6', name: 'Onion', quantity: 1, unit: 'medium', category: 'Produce' },
      { id: '7', name: 'Tomatoes', quantity: 2, unit: 'large', category: 'Produce' },
      { id: '8', name: 'Pasta', quantity: 200, unit: 'g', category: 'Grains' },
    ];

    // Return a random subset of ingredients
    return commonIngredients.slice(0, 4 + Math.floor(Math.random() * 4));
  }
}

export const recipeService = new RecipeService();