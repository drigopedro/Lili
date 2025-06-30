import React, { useState } from 'react';
import { Download, FileText, RotateCcw, AlertTriangle, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { settingsService } from '../../services/settingsService';

export const AccountSettings: React.FC = () => {
  const [dataPreview, setDataPreview] = useState<any>(null);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { requestDataExport, resetPreferences } = useSettings();

  const exportOptions = [
    {
      type: 'full' as const,
      title: 'Complete Data Export',
      description: 'All your data including profile, recipes, meal plans, and preferences',
      icon: FileText,
    },
    {
      type: 'recipes' as const,
      title: 'Saved Recipes',
      description: 'Your saved recipes and cooking preferences',
      icon: FileText,
    },
    {
      type: 'meal_plans' as const,
      title: 'Meal Plans',
      description: 'Your meal planning history and current plans',
      icon: FileText,
    },
    {
      type: 'preferences' as const,
      title: 'Settings & Preferences',
      description: 'Your account settings and dietary preferences',
      icon: FileText,
    },
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON', description: 'Machine-readable format' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet format' },
    { value: 'pdf', label: 'PDF', description: 'Human-readable document' },
  ];

  const handleDataPreview = async () => {
    if (!user) return;
    
    try {
      setExportLoading(true);
      const preview = await settingsService.getUserDataPreview(user.id);
      setDataPreview(preview);
      setShowDataPreview(true);
    } catch (error) {
      console.error('Error loading data preview:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportData = async (
    type: 'full' | 'recipes' | 'meal_plans' | 'preferences',
    format: 'json' | 'csv' | 'pdf'
  ) => {
    if (!user) return;
    
    try {
      setExportLoading(true);
      const exportId = await requestDataExport(type, format);
      
      if (exportId) {
        alert(`Data export requested successfully! You'll receive an email when it's ready.`);
      }
    } catch (error) {
      console.error('Error requesting data export:', error);
      alert('Failed to request data export. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleResetPreferences = async (type: 'all' | 'notifications' | 'meal_planning') => {
    if (!showResetConfirm) {
      setShowResetConfirm(type);
      return;
    }

    if (showResetConfirm !== type) return;

    try {
      setResetLoading(true);
      const success = await resetPreferences(type);
      
      if (success) {
        alert('Preferences reset successfully!');
        setShowResetConfirm(null);
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      alert('Failed to reset preferences. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Data Export */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Export</h3>
        <p className="text-gray-400 text-sm mb-6">
          Download your data in various formats. Exports are processed securely and you'll receive an email when ready.
        </p>

        <div className="space-y-4 mb-6">
          {exportOptions.map(option => (
            <div
              key={option.type}
              className="bg-primary-700/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <option.icon className="w-5 h-5 text-secondary-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{option.title}</h4>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {formatOptions.map(format => (
                  <Button
                    key={format.value}
                    onClick={() => handleExportData(option.type, format.value as any)}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {format.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleDataPreview}
          loading={exportLoading}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <FileText size={16} />
          Preview My Data
        </Button>
      </div>

      {/* Data Preview Modal */}
      {showDataPreview && dataPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Data Preview</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-primary-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Profile Information</h4>
                <pre className="text-gray-300 text-sm overflow-x-auto">
                  {JSON.stringify(dataPreview.profile, null, 2)}
                </pre>
              </div>
              
              <div className="bg-primary-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Saved Recipes ({dataPreview.saved_recipes?.length || 0})</h4>
                <p className="text-gray-400 text-sm">
                  {dataPreview.saved_recipes?.length > 0 
                    ? `You have ${dataPreview.saved_recipes.length} saved recipes`
                    : 'No saved recipes'
                  }
                </p>
              </div>
              
              <div className="bg-primary-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Meal Plans ({dataPreview.meal_plans?.length || 0})</h4>
                <p className="text-gray-400 text-sm">
                  {dataPreview.meal_plans?.length > 0 
                    ? `You have ${dataPreview.meal_plans.length} meal plans`
                    : 'No meal plans'
                  }
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowDataPreview(false)}
              className="w-full"
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}

      {/* Reset Preferences */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Reset Preferences</h3>
        <p className="text-gray-400 text-sm mb-6">
          Reset your preferences to default values. This action cannot be undone.
        </p>

        <div className="space-y-4">
          <div className="bg-primary-700/30 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Reset All Preferences</h4>
            <p className="text-gray-400 text-sm mb-3">
              Reset all settings including notifications and meal planning preferences
            </p>
            
            {showResetConfirm === 'all' ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowResetConfirm(null)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleResetPreferences('all')}
                  loading={resetLoading}
                  size="sm"
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Confirm Reset
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleResetPreferences('all')}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-700/30 rounded-xl p-4">
              <h4 className="text-white font-medium mb-2">Notifications</h4>
              <p className="text-gray-400 text-sm mb-3">
                Reset notification preferences only
              </p>
              
              {showResetConfirm === 'notifications' ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowResetConfirm(null)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleResetPreferences('notifications')}
                    loading={resetLoading}
                    size="sm"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleResetPreferences('notifications')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Reset
                </Button>
              )}
            </div>

            <div className="bg-primary-700/30 rounded-xl p-4">
              <h4 className="text-white font-medium mb-2">Meal Planning</h4>
              <p className="text-gray-400 text-sm mb-3">
                Reset meal planning preferences only
              </p>
              
              {showResetConfirm === 'meal_planning' ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowResetConfirm(null)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleResetPreferences('meal_planning')}
                    loading={resetLoading}
                    size="sm"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleResetPreferences('meal_planning')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Retention</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Data Retention Policy</h4>
              <p className="text-gray-300 text-sm">
                Your data is retained for as long as your account is active. Deleted accounts are permanently 
                removed after 30 days, during which you can recover your account by contacting support.
              </p>
            </div>
          </div>

          <div className="bg-primary-700/30 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Data Processing</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Your data is processed securely and never shared with third parties</li>
              <li>• Meal recommendations are generated using your preferences locally</li>
              <li>• Export requests are processed within 24 hours</li>
              <li>• All data transfers are encrypted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};