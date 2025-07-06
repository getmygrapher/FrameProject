import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, UserPlus, Chrome } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import PasswordResetSuccess from './PasswordResetSuccess';
import AdminSetup from './AdminSetup';

type LoginView = 'login' | 'forgot-password' | 'reset-password' | 'reset-success' | 'setup';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<LoginView>('login');
  const [resetToken, setResetToken] = useState('');
  const { loginWithGoogle, checkFirstTimeSetup } = useAdmin();
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  // Check for reset token in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setCurrentView('reset-password');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check if this is first time setup
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const needsSetup = await checkFirstTimeSetup();
        setIsFirstTimeSetup(needsSetup);
      } catch (error) {
        console.error('Error checking first time setup:', error);
      }
    };
    
    checkSetup();
  }, [checkFirstTimeSetup]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await loginWithGoogle();
      // No need to manually redirect - the useAdmin hook will handle state updates
      // and the parent component will automatically show the dashboard
    } catch (err: any) {
      console.error('Google login error:', err);
      
      if (err.message?.includes('Admin verification failed') || 
          err.message?.includes('User not found or inactive') ||
          err.message?.includes('Access denied. Admin privileges required')) {
        setError('Access denied. This Google account is not authorized for admin access.');
      } else if (err.message?.includes('popup_closed_by_user')) {
        setError('Login cancelled. Please try again.');
      } else {
        setError(err.message || 'Google login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setError('');
    setResetToken('');
  };

  const handleResetSuccess = () => {
    setCurrentView('reset-success');
  };

  const handleSetupComplete = () => {
    setCurrentView('login');
    setError('');
    setIsFirstTimeSetup(false);
  };

  if (currentView === 'setup') {
    return <AdminSetup onBackToLogin={handleBackToLogin} onSetupComplete={handleSetupComplete} />;
  }

  if (currentView === 'forgot-password') {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  if (currentView === 'reset-password') {
    return (
      <ResetPassword 
        token={resetToken}
        onSuccess={handleResetSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  if (currentView === 'reset-success') {
    return <PasswordResetSuccess onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Access the FrameCraft Pro admin panel</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{error}</p>
                  {isFirstTimeSetup && (error.includes('not authorized') || error.includes('Access denied')) && (
                    <button
                      onClick={() => setCurrentView('setup')}
                      className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <UserPlus size={16} />
                      Set up first admin account
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {isFirstTimeSetup && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <UserPlus size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">First Time Setup</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    No admin users found. Set up your first admin account to get started.
                  </p>
                  <button
                    onClick={() => setCurrentView('setup')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Set up first admin account →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
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
                  Signing in...
                </div>
              ) : (
                <>
                  <Chrome size={20} className="text-blue-600" />
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('forgot-password')}
              className="w-full text-sm text-blue-600 hover:text-blue-500 transition-colors py-2"
              disabled={isLoading}
            >
              Need help accessing your account?
            </button>
          </div>

          {!isFirstTimeSetup && (
            <div className="mt-6 text-center">
              <div className="text-xs text-gray-500 mb-4">
                Don't have admin access?
              </div>
              <p className="text-xs text-gray-500">
                Contact your system administrator to get admin privileges for your Google account.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure admin access only. Contact IT support if you need assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}