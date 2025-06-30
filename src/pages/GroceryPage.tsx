import React, { useState, useEffect } from 'react';
import { GroceryListPage } from '../components/grocery/GroceryListPage';
import { useMealPlanning } from '../hooks/useMealPlanning';
import { groceryService } from '../services/groceryService';
import { useAuth } from '../hooks/useAuth';
import type { GroceryList } from '../types/recipe';

export const GroceryPage: React.FC = () => {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const { currentMealPlan } = useMealPlanning();
  const { user } = useAuth();

  const handleBack = () => {
    // Navigate back to main dashboard or previous page
    window.history.back();
  };

  const handleGenerateFromMealPlan = async () => {
    if (!user || !currentMealPlan) return;
    
    try {
      const newGroceryList = await groceryService.generateGroceryList(user.id, currentMealPlan);
      setGroceryList(newGroceryList);
    } catch (error) {
      console.error('Error generating grocery list:', error);
    }
  };

  return (
    <GroceryListPage
      groceryList={groceryList}
      onBack={handleBack}
      onGenerateFromMealPlan={currentMealPlan ? handleGenerateFromMealPlan : undefined}
    />
  );
};