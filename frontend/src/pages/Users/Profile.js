import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    const result = await updateProfile(data);
    if (result.success) {
      resetPassword();
    }
    setIsLoading(false);
  };

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    const result = await changePassword(data);
    if (result.success) {
      resetPassword();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your personal information and password</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    {...registerProfile('firstName', { required: 'First name is required' })}
                    type="text"
                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      profileErrors.firstName ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                {profileErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...registerProfile('lastName', { required: 'Last name is required' })}
                  type="text"
                  className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    profileErrors.lastName ? 'border-red-300' : ''
                  }`}
                />
                {profileErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  {...registerProfile('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    profileErrors.email ? 'border-red-300' : ''
                  }`}
                />
              </div>
              {profileErrors.email && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  {...registerProfile('phone', { required: 'Phone is required' })}
                  type="tel"
                  className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    profileErrors.phone ? 'border-red-300' : ''
                  }`}
                />
              </div>
              {profileErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea
                  {...registerProfile('address')}
                  rows={3}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  type={showCurrentPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    passwordErrors.currentPassword ? 'border-red-300' : ''
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  {...registerPassword('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showNewPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    passwordErrors.newPassword ? 'border-red-300' : ''
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value) => value === document.querySelector('input[name="newPassword"]')?.value || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    passwordErrors.confirmPassword ? 'border-red-300' : ''
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
