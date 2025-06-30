import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Recipe, SavedRecipe } from '../types/recipe';

export const useSavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavedRecipes();
    } else {
      setSavedRecipes([]);
      setLoading(false);
    }
  }, [user]);

  const loadSavedRecipes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      
      setSavedRecipes(data || []);
    } catch (err: any) {
      console.error('Error loading saved recipes:', err);
      setError(err.message || 'Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe: Recipe): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if already saved
      const { data: existingData, error: checkError } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      // If already saved, return true
      if (existingData) return true;
      
      // Save the recipe
      const { error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          recipe_data: recipe,
        });
      
      if (error) throw error;
      
      // Refresh the list
      await loadSavedRecipes();
      return true;
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      setError(err.message || 'Failed to save recipe');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsaveRecipe = async (recipeId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);
      
      if (error) throw error;
      
      // Update local state
      setSavedRecipes(prev => prev.filter(item => item.recipe_id !== recipeId));
      return true;
    } catch (err: any) {
      console.error('Error removing saved recipe:', err);
      setError(err.message || 'Failed to remove saved recipe');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isRecipeSaved = async (recipeId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return !!data;
    } catch (err: any) {
      console.error('Error checking if recipe is saved:', err);
      return false;
    }
  };

  return {
    savedRecipes,
    loading,
    error,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved,
    refetch: loadSavedRecipes,
  };
};