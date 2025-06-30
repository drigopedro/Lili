import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { useProfile } from '../../hooks/useProfile';
import type { UserProfile } from '../../hooks/useProfile';

interface DietaryPreferencesProps {
  profile: UserProfile | null;
  onUpdate: (updates: Partial<UserProfile>) => Promise<any>;
}

export const DietaryPreferences: React.FC<DietaryPreferencesProps> = ({
  profile,
  onUpdate,
}) => {
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    profile?.dietaryRestrictions || []
  );
  const [allergies, setAllergies] = useState<string[]>(
    profile?.medicalConditions?.filter(condition => 
      condition.toLowerCase().includes('allergy') || 
      condition.toLowerCase().includes('intolerance')
    ) || []
  );
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [customRestriction, setCustomRestriction] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customExclusion, setCustomExclusion] = useState('');
  const [loading, setLoading] = useState(false);

  const commonRestrictions = [
    'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Low Carb',
    'Gluten Free', 'Dairy Free', 'Sugar Free', 'Low Sodium', 'Halal', 'Kosher'
  ];

  const commonAllergies = [
    'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Dairy', 'Soy', 
    'Wheat', 'Sesame', 'Sulphites', 'Mustard', 'Celery'
  ];

  const cuisineTypes = [
    'British', 'Italian', 'French', 'Spanish', 'Greek', 'Mediterranean',
    'Indian', 'Chinese', 'Japanese', 'Thai', 'Vietnamese', 'Korean',
    'Mexican', 'American', 'Middle Eastern', 'African', 'Caribbean'
  ];

  const portionSizes = [
    { value: 'small', label: 'Small portions', description: 'Smaller than average servings' },
    { value: 'standard', label: 'Standard portions', description: 'Regular serving sizes' },
    { value: 'large', label: 'Large portions', description: 'Bigger than average servings' },
  ];

  const toggleItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomItem = (custom: string, list: string[], setList: (list: string[]) => void, setCustom: (value: string) => void) => {
    if (custom.trim() && !list.includes(custom.trim())) {
      setList([...list, custom.trim()]);
      setCustom('');
    }
  };

  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate({
        dietaryRestrictions,
        // Store allergies in medical conditions for now
        medicalConditions: [
          ...(profile?.medicalConditions?.filter(condition => 
            !condition.toLowerCase().includes('allergy') && 
            !condition.toLowerCase().includes('intolerance')
          ) || []),
          ...allergies.map(allergy => `${allergy} allergy`)
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dietary Restrictions */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dietary Restrictions</h3>
        <p className="text-gray-400 text-sm mb-4">
          Select your dietary preferences and restrictions
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {commonRestrictions.map((restriction) => (
            <button
              key={restriction}
              onClick={() => toggleItem(restriction, dietaryRestrictions, setDietaryRestrictions)}
              className={`px-3 py-2 rounded-xl border-2 text-sm transition-all duration-200 ${
                dietaryRestrictions.includes(restriction)
                  ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {restriction}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={customRestriction}
            onChange={(e) => setCustomRestriction(e.target.value)}
            placeholder="Add custom restriction"
            className="flex-1 px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem(customRestriction, dietaryRestrictions, setDietaryRestrictions, setCustomRestriction)}
          />
          <button
            onClick={() => addCustomItem(customRestriction, dietaryRestrictions, setDietaryRestrictions, setCustomRestriction)}
            className="p-2 border-2 border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {dietaryRestrictions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dietaryRestrictions.map((restriction) => (
              <span
                key={restriction}
                className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-400/20 text-secondary-400 rounded-full text-sm"
              >
                {restriction}
                <button
                  onClick={() => removeItem(restriction, dietaryRestrictions, setDietaryRestrictions)}
                  className="hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Food Allergies */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Food Allergies & Intolerances</h3>
        <p className="text-gray-400 text-sm mb-4">
          Important: Select foods you must avoid for safety
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {commonAllergies.map((allergy) => (
            <button
              key={allergy}
              onClick={() => toggleItem(allergy, allergies, setAllergies)}
              className={`px-3 py-2 rounded-xl border-2 text-sm transition-all duration-200 ${
                allergies.includes(allergy)
                  ? 'border-red-400 bg-red-400/10 text-red-400'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            placeholder="Add custom allergy"
            className="flex-1 px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem(customAllergy, allergies, setAllergies, setCustomAllergy)}
          />
          <button
            onClick={() => addCustomItem(customAllergy, allergies, setAllergies, setCustomAllergy)}
            className="p-2 border-2 border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-400/20 text-red-400 rounded-full text-sm"
              >
                {allergy}
                <button
                  onClick={() => removeItem(allergy, allergies, setAllergies)}
                  className="hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cuisine Preferences */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cuisine Preferences</h3>
        <p className="text-gray-400 text-sm mb-4">
          Select cuisines you enjoy (this helps with meal recommendations)
        </p>
        
        <div className="grid grid-cols-3 gap-3">
          {cuisineTypes.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => toggleItem(cuisine, cuisinePreferences, setCuisinePreferences)}
              className={`px-3 py-2 rounded-xl border-2 text-sm transition-all duration-200 ${
                cuisinePreferences.includes(cuisine)
                  ? 'border-secondary-400 bg-secondary-400/10 text-secondary-400'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient Exclusions */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ingredient Exclusions</h3>
        <p className="text-gray-400 text-sm mb-4">
          Ingredients you prefer not to eat (different from allergies)
        </p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={customExclusion}
            onChange={(e) => setCustomExclusion(e.target.value)}
            placeholder="Add ingredient to exclude"
            className="flex-1 px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem(customExclusion, excludedIngredients, setExcludedIngredients, setCustomExclusion)}
          />
          <button
            onClick={() => addCustomItem(customExclusion, excludedIngredients, setExcludedIngredients, setCustomExclusion)}
            className="p-2 border-2 border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {excludedIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {excludedIngredients.map((ingredient) => (
              <span
                key={ingredient}
                className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm"
              >
                {ingredient}
                <button
                  onClick={() => removeItem(ingredient, excludedIngredients, setExcludedIngredients)}
                  className="hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        loading={loading}
        className="w-full flex items-center gap-2"
      >
        <Save size={16} />
        Save Dietary Preferences
      </Button>
    </div>
  );
};