import React, { useState } from 'react';
import { ArrowLeft, User, Heart, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { DietaryPreferences } from '../components/settings/DietaryPreferences';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { MealPlanningSettings } from '../components/settings/MealPlanningSettings';
import { AccountSettings } from '../components/settings/AccountSettings';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useSettings } from '../hooks/useSettings';
import { useProfile } from '../hooks/useProfile';

type SettingsTab = 'profile' | 'dietary' | 'notifications' | 'meal-planning' | 'account';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const navigate = useNavigate();
  
  const {
    userSettings,
    notificationPreferences,
    mealPlanningSettings,
    loading,
    error,
    updatePreferences,
  } = useSettings();
  
  const { profile, updateProfile } = useProfile();

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
      description: 'Personal information and account settings',
    },
    {
      id: 'dietary' as const,
      label: 'Dietary',
      icon: Heart,
      description: 'Food preferences and restrictions',
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: Bell,
      description: 'Alerts and reminders',
    },
    {
      id: 'meal-planning' as const,
      label: 'Meal Planning',
      icon: SettingsIcon,
      description: 'Meal planning preferences',
    },
    {
      id: 'account' as const,
      label: 'Account',
      icon: SettingsIcon,
      description: 'Data management and privacy',
    },
  ];

  const handleUpdateSettings = async (updates: any) => {
    try {
      return await updatePreferences({ settings: updates });
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  const handleUpdateNotifications = async (updates: any) => {
    try {
      return await updatePreferences({ notifications: updates });
    } catch (error) {
      console.error('Error updating notifications:', error);
      return false;
    }
  };

  const handleUpdateMealPlanning = async (updates: any) => {
    try {
      return await updatePreferences({ meal_planning: updates });
    } catch (error) {
      console.error('Error updating meal planning settings:', error);
      return false;
    }
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
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
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

      {/* Tab Content */}
      <div className="px-6 py-6">
        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-400">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileSettings
            settings={userSettings}
            onUpdate={handleUpdateSettings}
          />
        )}

        {activeTab === 'dietary' && (
          <DietaryPreferences
            profile={profile}
            onUpdate={updateProfile}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings
            preferences={notificationPreferences}
            onUpdate={handleUpdateNotifications}
          />
        )}

        {activeTab === 'meal-planning' && (
          <MealPlanningSettings
            settings={mealPlanningSettings}
            onUpdate={handleUpdateMealPlanning}
          />
        )}

        {activeTab === 'account' && (
          <AccountSettings />
        )}
      </div>
    </div>
  );
};