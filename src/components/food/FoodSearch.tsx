import React, { useState } from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import { useFatSecret } from '../../hooks/useFatSecret';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { FoodSearchResult } from '../../services/fatSecretService';

interface FoodSearchProps {
  onFoodSelect?: (food: any) => void;
  placeholder?: string;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ 
  onFoodSelect, 
  placeholder = "Search for foods..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult | null>(null);
  const { searchFoods, loading, error } = useFatSecret();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchResults = await searchFoods(query.trim());
    setResults(searchResults);
  };

  const handleFoodSelect = (food: any) => {
    if (onFoodSelect) {
      onFoodSelect(food);
    }
    setQuery('');
    setResults(null);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search size={20} />}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {results?.foods?.food && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Search Results ({results.foods.total_results} found)
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.foods.food.map((food) => (
              <div
                key={food.food_id}
                className="bg-primary-800/50 border border-primary-700/50 rounded-xl p-4 hover:bg-primary-800/70 transition-colors cursor-pointer"
                onClick={() => handleFoodSelect(food)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">
                      {food.food_name}
                    </h4>
                    {food.brand_name && (
                      <p className="text-sm text-secondary-400 mb-1">
                        {food.brand_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      {food.food_description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center text-gray-400">
                    <Package size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results && !results.foods?.food && (
        <div className="text-center py-8">
          <p className="text-gray-400">No foods found for "{query}"</p>
        </div>
      )}
    </div>
  );
};