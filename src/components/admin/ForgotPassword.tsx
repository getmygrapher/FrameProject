import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { PasswordResetService } from '../../services/passwordResetService';
import Notification from '../Notification';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await PasswordResetService.requestPasswordReset(email, (msg) => setNotification({ message: msg, type: 'info' }));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your email and follow the instructions to reset your password.
            </p>
            <div className="space-y-4">
              <button
                onClick={onBackToLogin}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </button>
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
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
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-600 mt-2">
              Enter your admin email address and we'll send you a reset link
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="admin@framecraftpro.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Reset links expire after 1 hour for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}