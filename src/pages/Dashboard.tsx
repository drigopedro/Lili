import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMealPlanning } from '../hooks/useMealPlanning';
import { useGestures } from '../hooks/useGestures';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import { LazyImage } from '../components/ui/LazyImage';
import { 
  Calendar, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Apple,
  Clock,
  Award,
  Settings,
  ChefHat,
  BarChart3,
  ShoppingCart,
  Plus
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getTodaysMeals, currentMealPlan, refetch } = useMealPlanning();
  const containerRef = useRef<HTMLDivElement>(null);

  const todaysMeals = getTodaysMeals();
  const completedMeals = todaysMeals.filter(meal => meal.completed).length;
  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);

  // Gesture handling
  useGestures(containerRef, {
    onSwipeLeft: () => navigate('/meal-planning'),
    onSwipeRight: () => navigate('/recipes'),
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const quickStats = [
    { 
      label: 'Calories Today', 
      value: totalCalories.toString(), 
      target: '2,200', 
      icon: Apple, 
      color: 'text-green-400' 
    },
    { 
      label: 'Meals Complete', 
      value: `${completedMeals}/${todaysMeals.length}`, 
      target: '', 
      icon: TrendingUp, 
      color: 'text-blue-400' 
    },
    { 
      label: 'Water', 
      value: '6 glasses', 
      target: '8 glasses', 
      icon: Clock, 
      color: 'text-cyan-400' 
    },
    { 
      label: 'Streak', 
      value: '12 days', 
      target: '', 
      icon: Award, 
      color: 'text-yellow-400' 
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: '#331442' }}>
      <PullToRefresh onRefresh={handleRefresh}>
        {/* Header */}
        <div className="bg-primary-900/50 backdrop-blur-sm border-b border-primary-700/50 sticky top-0 z-10 safe-area-top">
          <div className="container-mobile py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Logo size="sm" showText={false} />
                <div>
                  <h1 className="text-responsive-lg font-medium text-white">
                    Good morning, {user?.firstName || 'there'}!
                  </h1>
                  <p className="text-responsive-sm text-gray-400">Ready to nourish your body?</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 hover:text-white transition-colors touch-manipulation"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="container-mobile py-6 space-y-6">
          {/* Bolt.new Badge */}
          <div className="flex justify-center mb-4">
            <a href="https://bolt.new" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/white-circle.svg" 
                alt="Built with Bolt.new" 
                className="w-24 h-24"
              />
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="card-mobile gesture-feedback"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-gray-400">{stat.target}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-responsive-xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Today's Meals Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-responsive-xl font-semibold text-white">Today's Meals</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/meal-planning')}
                className="touch-manipulation"
              >
                View All
              </Button>
            </div>

            {todaysMeals.length > 0 ? (
              <div className="space-y-3">
                {todaysMeals.slice(0, 3).map((meal, index) => (
                  <div
                    key={index}
                    className={`card-mobile gesture-feedback ${
                      meal.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <LazyImage
                          src={meal.image_url}
                          alt={meal.name}
                          className="w-full h-full"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium text-responsive-base ${meal.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {meal.name}
                          </h3>
                          {meal.completed && (
                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-responsive-sm text-gray-600">
                          <span className="capitalize">{meal.type}</span>
                          <span>•</span>
                          <span>{meal.calories} cal</span>
                          <span>•</span>
                          <span>{new Date(meal.scheduled_time).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}</span>
                        </div>
                      </div>
                      
                      {!meal.completed && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="touch-manipulation flex-shrink-0"
                        >
                          Log
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-mobile text-center py-8">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-responsive-lg font-medium text-gray-900 mb-2">No meals planned</h3>
                <p className="text-gray-600 mb-4 text-responsive-sm">
                  Create a meal plan to see your daily meals
                </p>
                <Button 
                  onClick={() => navigate('/meal-planning')}
                  variant="primary"
                  className="touch-manipulation"
                >
                  Create Meal Plan
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Button
              variant="secondary"
              className="h-20 flex-col space-y-2 touch-manipulation gesture-feedback"
              onClick={() => navigate('/meal-planning')}
            >
              <Calendar size={24} />
              <span className="text-responsive-sm">Meal Plan</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex-col space-y-2 touch-manipulation gesture-feedback"
              onClick={() => navigate('/recipes')}
            >
              <BookOpen size={24} />
              <span className="text-responsive-sm">Recipes</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex-col space-y-2 touch-manipulation gesture-feedback"
              onClick={() => navigate('/grocery')}
            >
              <ShoppingCart size={24} />
              <span className="text-responsive-sm">Shopping</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex-col space-y-2 touch-manipulation gesture-feedback"
            >
              <BarChart3 size={24} />
              <span className="text-responsive-sm">Progress</span>
            </Button>
          </div>

          {/* Weekly Progress */}
          <div className="card-mobile">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-responsive-lg font-semibold text-gray-900">This Week</h2>
              <Target className="w-5 h-5 text-secondary-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-responsive-sm">
                <span className="text-gray-600">Nutrition Goals Met</span>
                <span className="text-gray-900 font-medium">5/7 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-secondary-400 h-2 rounded-full transition-all duration-300" style={{ width: '71%' }} />
              </div>
              <p className="text-xs text-gray-600">
                Great progress! You're on track to meet your weekly goals.
              </p>
            </div>
          </div>

          {/* Meal Planning CTA */}
          {!currentMealPlan && (
            <div className="bg-gradient-to-r from-secondary-400/20 to-primary-600/20 border border-secondary-400/30 rounded-2xl p-6 text-center">
              <BarChart3 className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
              <h3 className="text-responsive-lg font-semibold text-white mb-2">
                Ready to plan your meals?
              </h3>
              <p className="text-gray-300 mb-4 text-responsive-sm">
                Get personalized meal recommendations based on your preferences and goals.
              </p>
              <Button 
                onClick={() => navigate('/meal-planning')}
                variant="primary"
                className="w-full touch-manipulation"
              >
                Start Meal Planning
              </Button>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};