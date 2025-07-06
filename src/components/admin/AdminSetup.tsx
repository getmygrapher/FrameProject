import React, { useState } from 'react';
import { ArrowLeft, Shield, AlertCircle, CheckCircle, User, Mail, Chrome } from 'lucide-react';
import { AdminService } from '../../services/adminService';

interface AdminSetupProps {
  onBackToLogin: () => void;
  onSetupComplete: () => void;
}

export default function AdminSetup({ onBackToLogin, onSetupComplete }: AdminSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'instructions' | 'google-auth' | 'complete'>('instructions');

  const handleGoogleSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      await AdminService.setupFirstAdminWithGoogle();
      setStep('complete');
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

  if (success && step === 'complete') {
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
              Set up your first admin account using Google
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">First Time Setup</h3>
                <p className="text-sm text-blue-800">
                  This will set up your first super admin account using Google OAuth. 
                  You'll be able to manage additional admin users after logging in.
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

          {step === 'instructions' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Setup Instructions:</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p>Click "Continue with Google" to authenticate with your Google account</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p>Your Google account will be automatically granted super admin privileges</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p>You'll be able to add additional admin users from the admin panel</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('google-auth')}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Setup
              </button>
            </div>
          )}

          {step === 'google-auth' && (
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
                onClick={() => setStep('instructions')}
                disabled={isLoading}
                className="w-full text-gray-600 hover:text-gray-900 transition-colors py-2"
              >
                ← Back to Instructions
              </button>
            </div>
          )}

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