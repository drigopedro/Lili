import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, ChefHat } from 'lucide-react';
import { RecipeCard } from './RecipeCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { recipeService } from '../../services/recipeService';
import { useAuth } from '../../hooks/useAuth';
import type { Recipe, RecipeFilters } from '../../types/recipe';

interface RecipeListProps {
  onRecipeSelect: (recipe: Recipe) => void;
  showSavedOnly?: boolean;
}

export const RecipeList: React.FC<RecipeListProps> = ({
  onRecipeSelect,
  showSavedOnly = false,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadRecipes();
    if (user) {
      loadSavedRecipes();
    }
  }, [user, filters, showSavedOnly]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      
      if (showSavedOnly && user) {
        const saved = await recipeService.getSavedRecipes(user.id);
        setRecipes(saved.map(s => s.recipe_data));
      } else {
        const fetchedRecipes = await recipeService.getRecipes(filters);
        setRecipes(fetchedRecipes);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRecipes = async () => {
    if (!user) return;
    
    try {
      const saved = await recipeService.getSavedRecipes(user.id);
      setSavedRecipes(new Set(saved.map(s => s.recipe_id)));
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!user) return;
    
    try {
      await recipeService.saveRecipe(user.id, recipe);
      setSavedRecipes(prev => new Set([...prev, recipe.id]));
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const handleUnsaveRecipe = async (recipe: Recipe) => {
    if (!user) return;
    
    try {
      await recipeService.unsaveRecipe(user.id, recipe.id);
      setSavedRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipe.id);
        return newSet;
      });
      
      if (showSavedOnly) {
        setRecipes(prev => prev.filter(r => r.id !== recipe.id));
      }
    } catch (error) {
      console.error('Error unsaving recipe:', error);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cuisineTypes = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'British', 'French'];
  const difficulties = ['easy', 'medium', 'hard'];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={20} />}
            className="flex-1"
          />
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cuisine Type
              </label>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      cuisine_type: prev.cuisine_type === cuisine ? undefined : cuisine
                    }))}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.cuisine_type === cuisine
                        ? 'bg-secondary-400 text-white'
                        : 'bg-primary-700 text-gray-300 hover:bg-primary-600'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="flex gap-2">
                {difficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      difficulty: prev.difficulty === difficulty ? undefined : difficulty as any
                    }))}
                    className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                      filters.difficulty === difficulty
                        ? 'bg-secondary-400 text-white'
                        : 'bg-primary-700 text-gray-300 hover:bg-primary-600'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Prep Time (minutes)
                </label>
                <Input
                  type="number"
                  placeholder="30"
                  value={filters.max_prep_time || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    max_prep_time: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Cook Time (minutes)
                </label>
                <Input
                  type="number"
                  placeholder="60"
                  value={filters.max_cook_time || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    max_cook_time: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setFilters({})}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
                variant="primary"
                size="sm"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {showSavedOnly ? 'Saved Recipes' : 'All Recipes'}
          </h2>
          <p className="text-gray-400">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {showSavedOnly && (
          <div className="flex items-center gap-2 text-red-400">
            <Heart size={16} className="fill-current" />
            <span className="text-sm">Favourites</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {showSavedOnly ? 'No saved recipes yet' : 'No recipes found'}
          </h3>
          <p className="text-gray-400">
            {showSavedOnly 
              ? 'Start saving recipes to see them here'
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && filteredRecipes.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={onRecipeSelect}
              onSave={handleSaveRecipe}
              onUnsave={handleUnsaveRecipe}
              isSaved={savedRecipes.has(recipe.id)}
              showSaveButton={!!user}
            />
          ))}
        </div>
      )}
    </div>
  );
};