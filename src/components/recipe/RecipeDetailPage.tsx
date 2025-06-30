import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  ChefHat, 
  Users, 
  Heart, 
  Share2, 
  Plus, 
  Minus,
  ShoppingCart
} from 'lucide-react';
import { Button } from '../ui/Button';
import { NutritionDisplay } from '../food/NutritionDisplay';
import { RecipeRating } from './RecipeRating';
import { SocialShare } from '../ui/SocialShare';
import { SkeletonLoader, RecipeDetailSkeleton } from '../ui/SkeletonLoader';
import { recipeService } from '../../services/recipeService';
import { useAuth } from '../../hooks/useAuth';
import { updateMetaTags, generateRecipeMetaTags } from '../../utils/seo';
import { announceToScreenReader } from '../../utils/accessibility';
import { AnimatedButton } from '../ui/MicroInteractions';
import type { Recipe } from '../../types/recipe';

interface RecipeDetailPageProps {
  recipe: Recipe;
  onBack: () => void;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({
  recipe: initialRecipe,
  onBack,
  onAddToMealPlan,
}) => {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [servings, setServings] = useState(initialRecipe.servings);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [ratings, setRatings] = useState<any>({
    averageRating: 0,
    totalReviews: 0,
    reviews: []
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
    
    loadRatings();
    
    // Update SEO meta tags
    const metaTags = generateRecipeMetaTags(recipe);
    updateMetaTags(metaTags);
    
    // Announce to screen readers
    announceToScreenReader(`Recipe details for ${recipe.name}`);
  }, [user, recipe.id]);

  const checkIfSaved = async () => {
    if (!user) return;
    const saved = await recipeService.isRecipeSaved(user.id, recipe.id);
    setIsSaved(saved);
  };

  const loadRatings = async () => {
    setLoadingRatings(true);
    try {
      const ratingsData = await recipeService.getRecipeRatings(recipe.id);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isSaved) {
        await recipeService.unsaveRecipe(user.id, recipe.id);
        setIsSaved(false);
        announceToScreenReader('Recipe removed from favorites');
      } else {
        await recipeService.saveRecipe(user.id, recipe);
        setIsSaved(true);
        announceToScreenReader('Recipe saved to favorites');
      }
    } catch (error) {
      console.error('Error toggling recipe save:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServingsChange = (newServings: number) => {
    if (newServings < 1 || newServings > 12) return;
    
    const scaledRecipe = recipeService.scaleRecipe(recipe, newServings);
    setRecipe(scaledRecipe);
    setServings(newServings);
    announceToScreenReader(`Servings changed to ${newServings}`);
  };

  const handleRateRecipe = async (rating: number) => {
    if (!user) return;
    
    try {
      await recipeService.rateRecipe(recipe.id, rating);
      loadRatings();
      announceToScreenReader(`You rated this recipe ${rating} stars`);
    } catch (error) {
      console.error('Error rating recipe:', error);
    }
  };

  const handleReviewRecipe = async (rating: number, comment: string) => {
    if (!user) return;
    
    try {
      await recipeService.reviewRecipe(recipe.id, rating, comment);
      loadRatings();
      announceToScreenReader('Your review was submitted successfully');
    } catch (error) {
      console.error('Error reviewing recipe:', error);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) return;
    
    try {
      await recipeService.markReviewHelpful(reviewId);
      loadRatings();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    if (!user) return;
    
    try {
      await recipeService.reportReview(reviewId, reason);
      announceToScreenReader('Review reported successfully');
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-400 bg-green-400/10',
      medium: 'text-yellow-400 bg-yellow-400/10',
      hard: 'text-red-400 bg-red-400/10',
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-400 bg-gray-400/10';
  };

  const formatNutrition = () => {
    return {
      calories: recipe.nutrition.calories.toString(),
      protein: recipe.nutrition.protein.toString(),
      carbohydrate: recipe.nutrition.carbs.toString(),
      fat: recipe.nutrition.fat.toString(),
      fiber: recipe.nutrition.fibre.toString(),
      sugar: recipe.nutrition.sugar.toString(),
      sodium: recipe.nutrition.sodium.toString(),
    };
  };

  const getRecipeUrl = () => {
    return `https://lili-nutrition.app/recipes/${recipe.id}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#331442' }}>
      {/* Header */}
      <div className="bg-primary-900/50 backdrop-blur-sm border-b border-primary-700/50 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <AnimatedButton
              onClick={handleSaveToggle}
              disabled={loading || !user}
              variant="heart"
              isActive={isSaved}
              className={`p-2 rounded-full transition-all duration-200 ${
                isSaved 
                  ? 'bg-red-500/20 text-red-500' 
                  : 'bg-primary-800/50 text-gray-400 hover:text-white'
              }`}
              aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
              aria-pressed={isSaved}
            />
            
            <SocialShare
              url={getRecipeUrl()}
              title={recipe.name}
              description={recipe.description || `Try this delicious ${recipe.name} recipe!`}
              image={recipe.image_url}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Recipe Image & Basic Info */}
        <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl overflow-hidden">
          <div className="relative h-64 bg-gray-200">
            <img
              src={recipe.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
              alt={recipe.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Recipe Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl font-bold text-white mb-2" tabIndex={0}>{recipe.name}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-1">
                  <Clock size={16} aria-hidden="true" />
                  <span>{recipe.prep_time + recipe.cook_time}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat size={16} aria-hidden="true" />
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {recipe.description && (
              <p className="text-gray-300 mb-4">{recipe.description}</p>
            )}

            {/* Recipe Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-400">{recipe.prep_time}m</div>
                <div className="text-sm text-gray-400">Prep Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-400">{recipe.cook_time}m</div>
                <div className="text-sm text-gray-400">Cook Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-400">{recipe.nutrition.calories}</div>
                <div className="text-sm text-gray-400">Calories</div>
              </div>
            </div>

            {/* Servings Adjuster */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-medium">Servings</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleServingsChange(servings - 1)}
                  disabled={servings <= 1}
                  className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                  aria-label="Decrease servings"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-semibold text-white w-8 text-center" aria-live="polite">
                  {servings}
                </span>
                <button
                  onClick={() => handleServingsChange(servings + 1)}
                  disabled={servings >= 12}
                  className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                  aria-label="Increase servings"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onAddToMealPlan?.(recipe)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add to Meal Plan
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <ShoppingCart size={16} />
                Add to Shopping List
              </Button>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4" id="ingredients-heading">Ingredients</h2>
          <div className="space-y-3" aria-labelledby="ingredients-heading">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-primary-700/30 last:border-b-0">
                <span className="text-gray-300">{ingredient.name}</span>
                <span className="text-secondary-400 font-medium">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4" id="instructions-heading">Instructions</h2>
          <div className="space-y-4" aria-labelledby="instructions-heading">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary-400 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-300 leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Information */}
        <NutritionDisplay
          nutrition={formatNutrition()}
          servingDescription={`${servings} serving${servings !== 1 ? 's' : ''}`}
        />

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary-400/20 text-secondary-400 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ratings and Reviews */}
        {loadingRatings ? (
          <SkeletonLoader height="300px" className="rounded-2xl" />
        ) : (
          <RecipeRating
            recipeId={recipe.id}
            averageRating={ratings.averageRating}
            totalReviews={ratings.totalReviews}
            reviews={ratings.reviews}
            userRating={ratings.userRating}
            onRate={handleRateRecipe}
            onReview={handleReviewRecipe}
            onHelpful={handleMarkHelpful}
            onReport={handleReportReview}
          />
        )}
      </div>
    </div>
  );
};