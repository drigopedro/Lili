import { useState } from 'react';
import { fatSecretService, FoodSearchResult, RecipeSearchResult, NutritionInfo, BarcodeResult } from '../services/fatSecretService';

export const useFatSecret = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFoods = async (
    query: string, 
    pageNumber: number = 0, 
    maxResults: number = 20
  ): Promise<FoodSearchResult | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await fatSecretService.searchFoods(query, pageNumber, maxResults);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to search foods');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async (
    query: string, 
    cuisine?: string,
    pageNumber: number = 0, 
    maxResults: number = 20
  ): Promise<RecipeSearchResult | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await fatSecretService.searchRecipes(query, cuisine, pageNumber, maxResults);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to search recipes');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getNutritionInfo = async (foodId: string, servingId?: string): Promise<NutritionInfo | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await fatSecretService.getNutritionInfo(foodId, servingId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to get nutrition information');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const lookupBarcode = async (barcode: string): Promise<BarcodeResult | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await fatSecretService.lookupBarcode(barcode);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to lookup barcode');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchAndSaveIngredient = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fatSecretService.searchAndSaveIngredient(query);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to search and save ingredient');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchFoods,
    searchRecipes,
    getNutritionInfo,
    lookupBarcode,
    searchAndSaveIngredient,
  };
};