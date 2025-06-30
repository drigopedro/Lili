import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  tags: string[];
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG: number;
  sugarG: number;
  sodiumMg: number;
  createdAt: string;
  updatedAt: string;
}

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRecipes = data?.map(recipe => ({
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

      setRecipes(formattedRecipes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecipeById = async (id: string): Promise<Recipe | null> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        imageUrl: data.image_url,
        prepTimeMinutes: data.prep_time_minutes,
        cookTimeMinutes: data.cook_time_minutes,
        servings: data.servings,
        difficulty: data.difficulty,
        instructions: data.instructions,
        tags: data.tags,
        caloriesPerServing: data.calories_per_serving,
        proteinG: data.protein_g,
        carbsG: data.carbs_g,
        fatG: data.fat_g,
        fibreG: data.fibre_g,
        sugarG: data.sugar_g,
        sodiumMg: data.sodium_mg,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err: any) {
      console.error('Error fetching recipe:', err);
      return null;
    }
  };

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipes,
    getRecipeById,
  };
};