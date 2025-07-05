import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface PasswordResetSuccessProps {
  onBackToLogin: () => void;
}

export default function PasswordResetSuccess({ onBackToLogin }: PasswordResetSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
          
          <p className="text-gray-600 mb-8">
            Your admin password has been successfully updated. You can now log in with your new password.
          </p>

          <div className="space-y-4">
            <button
              onClick={onBackToLogin}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Continue to Login
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Security Tips:</div>
              <ul className="text-xs space-y-1 text-left">
                <li>• Keep your password secure and don't share it</li>
                <li>• Use a unique password for your admin account</li>
                <li>• Consider using a password manager</li>
                <li>• Log out when finished with admin tasks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}