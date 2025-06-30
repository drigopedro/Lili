import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealPlanning } from '../hooks/useMealPlanning';
import { useProfile } from '../hooks/useProfile';
import { TodaysMeals } from '../components/meal-planning/TodaysMeals';
import { WeeklyMealPlan } from '../components/meal-planning/WeeklyMealPlan';
import { NutritionSummary } from '../components/meal-planning/NutritionSummary';
import { GroceryList } from '../components/meal-planning/GroceryList';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  Calendar, 
  ChefHat, 
  Target, 
  Settings,
  ShoppingCart,
  BarChart3
} from 'lucide-react';

type ViewMode = 'today' | 'week' | 'nutrition' | 'grocery';

export const MealPlanningDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [showGroceryList, setShowGroceryList] = useState(false);
  
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const {
    currentMealPlan,
    loading,
    error,
    generateNewMealPlan,
    swapMeals,
    scaleRecipe,
    completeMeal,
    getTodaysMeals,
  } = useMealPlanning();

  const todaysMeals = getTodaysMeals();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleGenerateNewPlan = async () => {
    try {
      await generateNewMealPlan();
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    }
  };

  const handleGenerateGroceryList = () => {
    setShowGroceryList(true);
    setViewMode('grocery');
  };

  const getTodaysNutrition = () => {
    const meals = getTodaysMeals();
    return {
      calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      protein: 0, // Would calculate from recipes
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };
  };

  const getWeeklyNutrition = () => {
    if (!currentMealPlan) return getTodaysNutrition();
    
    return currentMealPlan.daily_plans.reduce(
      (total, day) => ({
        calories: total.calories + day.nutrition_summary.calories,
        protein: total.protein + day.nutrition_summary.protein,
        carbs: total.carbs + day.nutrition_summary.carbs,
        fat: total.fat + day.nutrition_summary.fat,
        fiber: total.fiber + day.nutrition_summary.fiber,
        sugar: total.sugar + day.nutrition_summary.sugar,
        sodium: total.sodium + day.nutrition_summary.sodium,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  };

  const nutritionTargets = {
    calories: 2000, // Would calculate based on user profile
    protein: 150,
    carbs: 250,
    fat: 67,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#331442' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#331442' }}>
      {/* Header */}
      <div className="bg-primary-900/50 backdrop-blur-sm border-b border-primary-700/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {profile?.firstName || user?.firstName || 'there'}!
              </h1>
              <p className="text-gray-400">Ready to nourish your body today?</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'today', label: 'Today', icon: Calendar },
              { id: 'week', label: 'Week', icon: ChefHat },
              { id: 'nutrition', label: 'Nutrition', icon: BarChart3 },
              { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-secondary-400 text-white'
                    : 'bg-primary-800/50 text-gray-300 hover:bg-primary-800/70'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6">
        {viewMode === 'today' && (
          <TodaysMeals
            meals={todaysMeals}
            onComplete={completeMeal}
            onScale={scaleRecipe}
            onAddMeal={handleGenerateNewPlan}
          />
        )}

        {viewMode === 'week' && (
          <WeeklyMealPlan
            mealPlan={currentMealPlan}
            onComplete={completeMeal}
            onScale={scaleRecipe}
            onSwap={swapMeals}
            onGenerateNew={handleGenerateNewPlan}
            onGenerateGroceryList={handleGenerateGroceryList}
          />
        )}

        {viewMode === 'nutrition' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <NutritionSummary
                nutrition={getTodaysNutrition()}
                targets={nutritionTargets}
                title="Today's Nutrition"
              />
              <NutritionSummary
                nutrition={getWeeklyNutrition()}
                targets={{
                  calories: nutritionTargets.calories * 7,
                  protein: nutritionTargets.protein * 7,
                  carbs: nutritionTargets.carbs * 7,
                  fat: nutritionTargets.fat * 7,
                }}
                title="Weekly Nutrition"
              />
            </div>

            {/* Weekly Progress Chart Placeholder */}
            <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-secondary-400" />
                <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-400">Nutrition charts and trends coming soon</p>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'grocery' && (
          <GroceryList
            items={currentMealPlan?.grocery_list || []}
            onUpdateItem={(itemId, updates) => {
              console.log('Update item:', itemId, updates);
            }}
            onAddItem={(item) => {
              console.log('Add item:', item);
            }}
            onRemoveItem={(itemId) => {
              console.log('Remove item:', itemId);
            }}
          />
        )}
      </div>

      {/* Quick Actions FAB */}
      {!currentMealPlan && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleGenerateNewPlan}
            className="rounded-full w-14 h-14 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <ChefHat size={24} />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};