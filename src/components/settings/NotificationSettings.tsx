import React, { useState } from 'react';
import { Bell, Plus, X, Save, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import type { NotificationPreferences, CustomReminder } from '../../types/settings';

interface NotificationSettingsProps {
  preferences: NotificationPreferences | null;
  onUpdate: (updates: Partial<NotificationPreferences>) => Promise<boolean>;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    meal_prep_reminders: preferences?.meal_prep_reminders ?? true,
    shopping_list_notifications: preferences?.shopping_list_notifications ?? true,
    weekly_meal_plan_alerts: preferences?.weekly_meal_plan_alerts ?? true,
    notification_methods: preferences?.notification_methods ?? {
      email: true,
      push: false,
      sms: false,
    },
    reminder_times: preferences?.reminder_times ?? {
      meal_prep: "09:00",
      shopping: "18:00",
      weekly_plan: "Sunday 10:00",
    },
  });
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>(
    preferences?.custom_reminders || []
  );
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '09:00',
    days: [] as string[],
    enabled: true,
  });
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleToggle = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMethodToggle = (method: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_methods: {
        ...prev.notification_methods,
        [method]: value,
      },
    }));
  };

  const handleTimeChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      reminder_times: {
        ...prev.reminder_times,
        [field]: value,
      },
    }));
  };

  const toggleReminderDay = (day: string) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const addCustomReminder = () => {
    if (!newReminder.title.trim() || newReminder.days.length === 0) return;

    const reminder: CustomReminder = {
      id: crypto.randomUUID(),
      title: newReminder.title.trim(),
      time: newReminder.time,
      days: newReminder.days,
      enabled: true,
    };

    setCustomReminders(prev => [...prev, reminder]);
    setNewReminder({ title: '', time: '09:00', days: [], enabled: true });
    setShowAddReminder(false);
  };

  const removeCustomReminder = (id: string) => {
    setCustomReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleCustomReminder = (id: string) => {
    setCustomReminders(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate({
        ...formData,
        custom_reminders: customReminders,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Notifications */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Meal Prep Reminders</h4>
              <p className="text-gray-400 text-sm">Get reminded when it's time to prepare meals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.meal_prep_reminders}
                onChange={(e) => handleToggle('meal_prep_reminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Shopping List Notifications</h4>
              <p className="text-gray-400 text-sm">Get notified about shopping list updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shopping_list_notifications}
                onChange={(e) => handleToggle('shopping_list_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Weekly Meal Plan Alerts</h4>
              <p className="text-gray-400 text-sm">Get reminded to plan your weekly meals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.weekly_meal_plan_alerts}
                onChange={(e) => handleToggle('weekly_meal_plan_alerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Methods */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Methods</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Email Notifications</h4>
              <p className="text-gray-400 text-sm">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notification_methods.email}
                onChange={(e) => handleMethodToggle('email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Push Notifications</h4>
              <p className="text-gray-400 text-sm">Receive push notifications on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notification_methods.push}
                onChange={(e) => handleMethodToggle('push', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">SMS Notifications</h4>
              <p className="text-gray-400 text-sm">Receive text message notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notification_methods.sms}
                onChange={(e) => handleMethodToggle('sms', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-400"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Reminder Times */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Reminder Times</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Meal Prep Reminder</label>
            <input
              type="time"
              value={formData.reminder_times.meal_prep}
              onChange={(e) => handleTimeChange('meal_prep', e.target.value)}
              className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Shopping Reminder</label>
            <input
              type="time"
              value={formData.reminder_times.shopping}
              onChange={(e) => handleTimeChange('shopping', e.target.value)}
              className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Weekly Plan Reminder</label>
            <input
              type="text"
              value={formData.reminder_times.weekly_plan}
              onChange={(e) => handleTimeChange('weekly_plan', e.target.value)}
              placeholder="e.g., Sunday 10:00"
              className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
            />
          </div>
        </div>
      </div>

      {/* Custom Reminders */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Custom Reminders</h3>
          <Button
            onClick={() => setShowAddReminder(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Reminder
          </Button>
        </div>

        {/* Add Reminder Form */}
        {showAddReminder && (
          <div className="bg-primary-700/50 rounded-xl p-4 mb-4">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reminder title"
                value={newReminder.title}
                onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
              />

              <div className="flex items-center gap-4">
                <label className="text-white font-medium">Time:</label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                  className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Days:</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleReminderDay(day)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        newReminder.days.includes(day)
                          ? 'bg-secondary-400 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAddReminder(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addCustomReminder}
                  disabled={!newReminder.title.trim() || newReminder.days.length === 0}
                  size="sm"
                  className="flex-1"
                >
                  Add Reminder
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Reminders List */}
        {customReminders.length > 0 ? (
          <div className="space-y-3">
            {customReminders.map(reminder => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-primary-700/30 rounded-xl"
              >
                <div className="flex-1">
                  <h4 className="text-white font-medium">{reminder.title}</h4>
                  <p className="text-gray-400 text-sm">
                    {reminder.time} • {reminder.days.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={() => toggleCustomReminder(reminder.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary-400"></div>
                  </label>
                  <button
                    onClick={() => removeCustomReminder(reminder.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            No custom reminders set up yet
          </p>
        )}
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        loading={loading}
        className="w-full flex items-center gap-2"
      >
        <Save size={16} />
        Save Notification Settings
      </Button>
    </div>
  );
};