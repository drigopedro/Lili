import React, { useState } from 'react';
import { Camera, User, Mail, Lock, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import type { UserSettings } from '../../types/settings';

interface ProfileSettingsProps {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<boolean>;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    display_name: settings?.display_name || '',
    timezone: settings?.timezone || 'Europe/London',
    language: settings?.language || 'en-GB',
    theme: settings?.theme || 'dark',
    units: settings?.units || 'metric',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { user } = useAuth();
  const { uploadProfilePicture, changePassword, deleteAccount } = useSettings();

  const timezones = [
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ];

  const languages = [
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'es-ES', label: 'Español' },
    { value: 'it-IT', label: 'Italiano' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadProfilePicture(file);
      if (url) {
        // Profile picture URL is automatically updated in the hook
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const success = await changePassword(newPassword);
      if (success) {
        setNewPassword('');
        setConfirmPassword('');
        alert('Password changed successfully');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const success = await deleteAccount();
      if (success) {
        alert('Account deletion requested. You will be contacted within 24 hours.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center overflow-hidden">
              {settings?.profile_picture_url ? (
                <img
                  src={settings.profile_picture_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-secondary-500 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>
          <div>
            <p className="text-white font-medium">Change Profile Picture</p>
            <p className="text-gray-400 text-sm">
              Upload a new profile picture. Max size 5MB.
            </p>
            {uploadingImage && (
              <p className="text-secondary-400 text-sm mt-1">Uploading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={formData.display_name}
            onChange={(e) => handleInputChange('display_name', e.target.value)}
            placeholder="Enter your display name"
            icon={<User size={20} />}
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            icon={<Mail size={20} />}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value} className="bg-primary-900">
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value} className="bg-primary-900">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
              >
                <option value="dark" className="bg-primary-900">Dark</option>
                <option value="light" className="bg-primary-900">Light</option>
                <option value="auto" className="bg-primary-900">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Units
              </label>
              <select
                value={formData.units}
                onChange={(e) => handleInputChange('units', e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
              >
                <option value="metric" className="bg-primary-900">Metric (kg, cm)</option>
                <option value="imperial" className="bg-primary-900">Imperial (lbs, ft)</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            loading={loading}
            className="w-full flex items-center gap-2"
          >
            <Save size={16} />
            Save Profile
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            icon={<Lock size={20} />}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            icon={<Lock size={20} />}
          />

          <Button
            onClick={handlePasswordChange}
            disabled={!newPassword || !confirmPassword || loading}
            className="w-full"
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Delete Account</h3>
        <p className="text-gray-300 mb-4">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
        
        {!showDeleteConfirm ? (
          <Button
            onClick={handleDeleteAccount}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-red-400 font-medium">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                loading={loading}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Yes, Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};