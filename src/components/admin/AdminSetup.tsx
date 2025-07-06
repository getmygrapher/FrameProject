import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Lock } from 'lucide-react';
import { AdminService } from '../../services/adminService';

interface AdminSetupProps {
  onBackToLogin: () => void;
  onSetupComplete: () => void;
}

export default function AdminSetup({ onBackToLogin, onSetupComplete }: AdminSetupProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/\d/.test(pwd)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('One special character');
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }
      
      if (!formData.password) {
        throw new Error('Password is required');
      }
      
      if (!formData.confirmPassword) {
        throw new Error('Password confirmation is required');
      }
      
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        throw new Error(`Password must contain: ${passwordErrors.join(', ')}`);
      }

      console.log('Creating admin user with:', {
        email: formData.email,
        fullName: formData.fullName,
        role: 'super_admin'
      });

      // Create the first admin user
      const result = await AdminService.createAdmin(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        'super_admin'
      );

      console.log('Admin user created successfully:', result);

      setSuccess(true);
      setTimeout(() => {
        onSetupComplete();
      }, 2000);

    } catch (err: any) {
      console.error('Error creating admin user:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        cause: err.cause
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create admin user. Please try again.';
      
      if (err.message) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          errorMessage = 'An admin user with this email already exists.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('validation') || err.message.includes('invalid')) {
          errorMessage = err.message;
        } else if (err.message.includes('unauthorized') || err.message.includes('permission')) {
          errorMessage = 'Permission denied. Please check your configuration.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Complete!</h1>
            <p className="text-gray-600 mb-6">
              Your admin account has been created successfully. You can now log in with your credentials.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to login page...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const passwordErrors = validatePassword(formData.password);
  const isPasswordValid = formData.password.length > 0 && passwordErrors.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Setup</h1>
            <p className="text-gray-600 mt-2">
              Create your first admin account to get started
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">First Time Setup</h3>
                <p className="text-sm text-blue-800">
                  This will create your first super admin account. You'll be able to create additional admin users after logging in.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-sm font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="admin@framecraftpro.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600">Password requirements:</div>
                  {[
                    { check: formData.password.length >= 8, text: 'At least 8 characters' },
                    { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                    { check: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                    { check: /\d/.test(formData.password), text: 'One number' },
                    { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'One special character' }
                  ].map((req, index) => (
                    <div key={index} className={`text-xs flex items-center gap-1 ${req.check ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle size={12} className={req.check ? 'text-green-600' : 'text-gray-300'} />
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {formData.confirmPassword.length > 0 && (
                <div className={`mt-1 text-xs flex items-center gap-1 ${
                  formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  <CheckCircle size={12} className={formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-300'} />
                  {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || formData.password !== formData.confirmPassword || !formData.email.trim() || !formData.fullName.trim()}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                isLoading || !isPasswordValid || formData.password !== formData.confirmPassword || !formData.email.trim() || !formData.fullName.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Admin Account...
                </div>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This account will have super admin privileges and can create additional admin users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}