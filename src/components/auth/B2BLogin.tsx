import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  ArrowLeft,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface B2BLoginProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export default function B2BLogin({
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
}: B2BLoginProps) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      onLoginSuccess();
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // OAuth will redirect, so we don't need to handle success here
    } catch (err) {
      // Error is handled by the context
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                B2B Partner Login
              </h2>
              <p className="text-sm text-gray-600">
                Access your business account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* B2B Benefits */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            B2B Partner Benefits
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-600" />
              Wholesale pricing and bulk discounts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-600" />
              Extended payment terms
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-600" />
              Priority customer support
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-600" />
              Custom order management
            </li>
          </ul>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Business Email Address
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your business email"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Sign In to Business Account"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <Chrome size={20} className="text-blue-600" />
          Continue with Google
        </button>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
            disabled={loading}
          >
            Don't have a business account? Apply now
          </button>

          <div className="text-sm text-gray-600">
            <button className="hover:text-gray-900 transition-colors">
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Account Status Info */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Account Verification Required</p>
              <p>
                New B2B accounts require approval before accessing wholesale
                pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
