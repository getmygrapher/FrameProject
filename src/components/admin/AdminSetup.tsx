import React, { useState } from 'react';
import { ArrowLeft, Shield, AlertCircle, CheckCircle, User, Mail, Chrome, Lock, Eye, EyeOff } from 'lucide-react';
import { AdminService } from '../../services/adminService';

interface AdminSetupProps {
  onBackToLogin: () => void;
  onSetupComplete: () => void;
}

export default function AdminSetup({ onBackToLogin, onSetupComplete }: AdminSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'email' | 'google' | null>(null);
  
  // Email setup form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/\d/.test(pwd)) errors.push('One number');
    return errors;
  };

  const handleEmailSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.email || !formData.password || !formData.fullName) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        throw new Error(`Password must contain: ${passwordErrors.join(', ')}`);
      }

      await AdminService.setupFirstAdminWithEmail(
        formData.email,
        formData.password,
        formData.fullName
      );

      setSuccess(true);
      setTimeout(() => {
        onSetupComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Error setting up first admin:', err);
      setError(err.message || 'Failed to set up admin account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      await AdminService.setupFirstAdminWithGoogle();
      setSuccess(true);
      
      setTimeout(() => {
        onSetupComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Error setting up first admin:', err);
      setError(err.message || 'Failed to set up admin account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              Your admin account has been created successfully. You can now access the admin panel.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to login page...
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Set up your first admin account
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">First Time Setup</h3>
                <p className="text-sm text-blue-800">
                  This will set up your first super admin account. 
                  You'll be able to manage additional admin users after logging in.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3" role="alert">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-sm font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {!setupMethod && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 text-center mb-4">Choose setup method:</h3>
              
              <button
                onClick={() => setSetupMethod('email')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Mail size={24} className="text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Email & Password</div>
                    <div className="text-sm text-gray-600">Create account with email and password</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSetupMethod('google')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Chrome size={24} className="text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Google OAuth</div>
                    <div className="text-sm text-gray-600">Use your Google account</div>
                  </div>
                </div>
              </button>

              <button
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>
            </div>
          )}

          {setupMethod === 'email' && (
            <form onSubmit={handleEmailSetup} className="space-y-6">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@example.com"
                    required
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
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password (min 8 characters)"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      { check: /\d/.test(formData.password), text: 'One number' }
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
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSetupMethod(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isLoading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Creating...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          )}

          {setupMethod === 'google' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-2">Authenticate with Google</h3>
                <p className="text-sm text-gray-600">
                  Click the button below to sign in with your Google account and set up admin access.
                </p>
              </div>

              <button
                onClick={handleGoogleSetup}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Setting up admin account...
                  </div>
                ) : (
                  <>
                    <Chrome size={20} className="text-blue-600" />
                    Continue with Google
                  </>
                )}
              </button>

              <button
                onClick={() => setSetupMethod(null)}
                disabled={isLoading}
                className="w-full text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                ← Back to Setup Options
              </button>
            </div>
          )}

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