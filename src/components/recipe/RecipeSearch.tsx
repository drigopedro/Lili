import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Clock, Users, Star } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useDebounce } from '../../hooks/useDebounce';
import type { Recipe, RecipeFilters } from '../../types/recipe';

interface RecipeSearchProps {
  onResults: (recipes: Recipe[]) => void;
  onFiltersChange: (filters: RecipeFilters) => void;
  loading?: boolean;
  totalResults?: number;
}

export const RecipeSearch: React.FC<RecipeSearchProps> = ({
  onResults,
  onFiltersChange,
  loading = false,
  totalResults = 0,
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'time' | 'difficulty'>('relevance');

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery || Object.keys(filters).length > 0) {
      performSearch();
    }
  }, [debouncedQuery, filters, sortBy]);

  const performSearch = async () => {
    const searchFilters: RecipeFilters = {
      ...filters,
      query: debouncedQuery,
      sortBy,
    };
    onFiltersChange(searchFilters);
  };

  const updateFilter = (key: keyof RecipeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
    setSortBy('relevance');
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search recipes, ingredients, or cuisines..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search size={20} />}
          className="pr-12"
          aria-label="Search recipes"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-secondary-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-secondary-400"
            aria-label="Sort recipes by"
          >
            <option value="relevance" className="bg-primary-900">Most Relevant</option>
            <option value="rating" className="bg-primary-900">Highest Rated</option>
            <option value="time" className="bg-primary-900">Quickest</option>
            <option value="difficulty" className="bg-primary-900">Easiest</option>
          </select>
        </div>

        {(query || activeFilterCount > 0) && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Results Summary */}
      {(query || activeFilterCount > 0) && (
        <div className="text-sm text-gray-400">
          {loading ? (
            'Searching...'
          ) : (
            `${totalResults} recipe${totalResults !== 1 ? 's' : ''} found`
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div 
          id="filter-panel"
          className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-4 space-y-4 animate-slide-down"
          role="region"
          aria-label="Recipe filters"
        >
          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map(diet => (
                <button
                  key={diet}
                  onClick={() => {
                    const current = filters.dietary_restrictions || [];
                    const updated = current.includes(diet)
                      ? current.filter(d => d !== diet)
                      : [...current, diet];
                    updateFilter('dietary_restrictions', updated);
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    (filters.dietary_restrictions || []).includes(diet)
                      ? 'bg-secondary-400 text-white'
                      : 'bg-primary-700 text-gray-300 hover:bg-primary-600'
                  }`}
                  aria-pressed={(filters.dietary_restrictions || []).includes(diet)}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Prep Time (minutes)
              </label>
              <Input
                type="number"
                placeholder="30"
                value={filters.max_prep_time || ''}
                onChange={(e) => updateFilter('max_prep_time', e.target.value ? parseInt(e.target.value) : undefined)}
                icon={<Clock size={16} />}
                min="0"
                max="180"
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
                onChange={(e) => updateFilter('max_cook_time', e.target.value ? parseInt(e.target.value) : undefined)}
                icon={<Clock size={16} />}
                min="0"
                max="300"
              />
            </div>
          </div>

          {/* Difficulty & Servings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => updateFilter('difficulty', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
              >
                <option value="" className="bg-primary-900">Any</option>
                <option value="easy" className="bg-primary-900">Easy</option>
                <option value="medium" className="bg-primary-900">Medium</option>
                <option value="hard" className="bg-primary-900">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Servings
              </label>
              <Input
                type="number"
                placeholder="2"
                value={filters.min_servings || ''}
                onChange={(e) => updateFilter('min_servings', e.target.value ? parseInt(e.target.value) : undefined)}
                icon={<Users size={16} />}
                min="1"
                max="12"
              />
            </div>
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cuisine Type
            </label>
            <div className="flex flex-wrap gap-2">
              {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'British', 'French'].map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => updateFilter('cuisine_type', filters.cuisine_type === cuisine ? undefined : cuisine)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.cuisine_type === cuisine
                      ? 'bg-secondary-400 text-white'
                      : 'bg-primary-700 text-gray-300 hover:bg-primary-600'
                  }`}
                  aria-pressed={filters.cuisine_type === cuisine}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => updateFilter('min_rating', filters.min_rating === rating ? undefined : rating)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
                    filters.min_rating === rating
                      ? 'bg-secondary-400 text-white'
                      : 'bg-primary-700 text-gray-300 hover:bg-primary-600'
                  }`}
                  aria-pressed={filters.min_rating === rating}
                  aria-label={`Minimum ${rating} star${rating !== 1 ? 's' : ''}`}
                >
                  <Star size={14} className={filters.min_rating === rating ? 'fill-current' : ''} />
                  {rating}+
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};