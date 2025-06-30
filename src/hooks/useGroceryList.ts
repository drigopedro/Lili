import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { GroceryList, GroceryItem } from '../types/recipe';

export const useGroceryList = () => {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadLatestGroceryList();
    } else {
      setGroceryList(null);
      setLoading(false);
    }
  }, [user]);

  const loadLatestGroceryList = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (error && error.code !== 'PGRST116') throw error;
      
      setGroceryList(data);
    } catch (err: any) {
      console.error('Error loading grocery list:', err);
      setError(err.message || 'Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  const createGroceryList = async (mealPlanId?: string): Promise<GroceryList | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const newList = {
        user_id: user.id,
        meal_plan_id: mealPlanId,
        items: [],
        estimated_cost: 0,
      };
      
      const { data, error } = await supabase
        .from('grocery_lists')
        .insert(newList)
        .select()
        .single();
      
      if (error) throw error;
      
      setGroceryList(data);
      return data;
    } catch (err: any) {
      console.error('Error creating grocery list:', err);
      setError(err.message || 'Failed to create grocery list');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGroceryItem = async (itemId: string, updates: Partial<GroceryItem>): Promise<boolean> => {
    if (!user || !groceryList) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Find and update the item in the local state
      const updatedItems = groceryList.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      // Update in database
      const { error } = await supabase
        .from('grocery_lists')
        .update({ items: updatedItems })
        .eq('id', groceryList.id);
      
      if (error) throw error;
      
      // Update local state
      setGroceryList({
        ...groceryList,
        items: updatedItems,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating grocery item:', err);
      setError(err.message || 'Failed to update grocery item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addGroceryItem = async (newItem: Omit<GroceryItem, 'id'>): Promise<boolean> => {
    if (!user || !groceryList) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Create new item with ID
      const item: GroceryItem = {
        ...newItem,
        id: crypto.randomUUID(),
        checked: false,
      };
      
      // Add to items array
      const updatedItems = [...groceryList.items, item];
      
      // Update in database
      const { error } = await supabase
        .from('grocery_lists')
        .update({ items: updatedItems })
        .eq('id', groceryList.id);
      
      if (error) throw error;
      
      // Update local state
      setGroceryList({
        ...groceryList,
        items: updatedItems,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error adding grocery item:', err);
      setError(err.message || 'Failed to add grocery item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeGroceryItem = async (itemId: string): Promise<boolean> => {
    if (!user || !groceryList) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Remove item from array
      const updatedItems = groceryList.items.filter(item => item.id !== itemId);
      
      // Update in database
      const { error } = await supabase
        .from('grocery_lists')
        .update({ items: updatedItems })
        .eq('id', groceryList.id);
      
      if (error) throw error;
      
      // Update local state
      setGroceryList({
        ...groceryList,
        items: updatedItems,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error removing grocery item:', err);
      setError(err.message || 'Failed to remove grocery item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    groceryList,
    loading,
    error,
    loadLatestGroceryList,
    createGroceryList,
    updateGroceryItem,
    addGroceryItem,
    removeGroceryItem,
  };
};