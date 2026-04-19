import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser(data);
    if (result.success) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Create your account
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                {...register('firstName', {
                  required: 'First name is required',
                })}
                type="text"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="First name"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="mt-1 relative">
              <input
                {...register('lastName', {
                  required: 'Last name is required',
                })}
                type="text"
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Last name"
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              autoComplete="email"
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={20} className="text-gray-400" />
            </div>
            <input
              {...register('phone', {
                required: 'Phone number is required',
              })}
              type="tel"
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-2 pointer-events-none">
              <MapPin size={20} className="text-gray-400" />
            </div>
            <textarea
              {...register('address')}
              rows={2}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter your address"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Create a password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-400" />
              ) : (
                <Eye size={20} className="text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              type="password"
              autoComplete="new-password"
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;
