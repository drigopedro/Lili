import React, { useState } from 'react';
import { ArrowLeft, Heart, Search } from 'lucide-react';
import { RecipeList } from '../components/recipe/RecipeList';
import { RecipeDetailPage } from '../components/recipe/RecipeDetailPage';
import { Button } from '../components/ui/Button';
import type { Recipe } from '../types/recipe';

type ViewMode = 'all' | 'saved';

export const RecipesPage: React.FC = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleBack = () => {
    setSelectedRecipe(null);
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    // This would integrate with the meal planning system
    console.log('Adding recipe to meal plan:', recipe.name);
    // You could show a modal to select which meal/day to add it to
  };

  if (selectedRecipe) {
    return (
      <RecipeDetailPage
        recipe={selectedRecipe}
        onBack={handleBack}
        onAddToMealPlan={handleAddToMealPlan}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#331442' }}>
      {/* Header */}
      <div className="bg-primary-900/50 backdrop-blur-sm border-b border-primary-700/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Recipes</h1>
              <p className="text-gray-400">Discover delicious and healthy recipes</p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                viewMode === 'all'
                  ? 'bg-secondary-400 text-white'
                  : 'bg-primary-800/50 text-gray-300 hover:bg-primary-800/70'
              }`}
            >
              <Search size={16} />
              All Recipes
            </button>
            <button
              onClick={() => setViewMode('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                viewMode === 'saved'
                  ? 'bg-secondary-400 text-white'
                  : 'bg-primary-800/50 text-gray-300 hover:bg-primary-800/70'
              }`}
            >
              <Heart size={16} />
              Saved
            </button>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="px-6 py-6">
        <RecipeList
          onRecipeSelect={handleRecipeSelect}
          showSavedOnly={viewMode === 'saved'}
        />
      </div>
    </div>
  );
};