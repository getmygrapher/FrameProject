import React, { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Chrome,
  User,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import AdminSetup from "./AdminSetup";

type LoginView = "login" | "setup";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<LoginView>("login");
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  const {
    loginWithEmail,
    loginWithGoogle,
    error,
    clearError,
    checkFirstTimeSetup,
  } = useAdmin();

  // Check if this is first time setup
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const needsSetup = await checkFirstTimeSetup();
        setIsFirstTimeSetup(needsSetup);
        if (needsSetup) {
          setCurrentView("setup");
        }
      } catch (error) {
        console.error("Error checking first time setup:", error);
      }
    };

    checkSetup();
  }, [checkFirstTimeSetup]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    clearError();

    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error("Email login error:", err);
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    clearError();

    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google login error:", err);
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setCurrentView("login");
    setIsFirstTimeSetup(false);
  };

  if (currentView === "setup") {
    return (
      <AdminSetup
        onBackToLogin={() => setCurrentView("login")}
        onSetupComplete={handleSetupComplete}
      />
    );
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
            <p className="text-gray-600 mt-2">
              Access the FrameCraft Pro admin panel
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-600 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{error}</p>
                  {error.includes("Access denied") && (
                    <button
                      onClick={() => setCurrentView("setup")}
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

          {isFirstTimeSetup && currentView === "login" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <UserPlus
                  size={20}
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    First Time Setup
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    No admin users found. Set up your first admin account to get
                    started.
                  </p>
                  <button
                    onClick={() => setCurrentView("setup")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Set up first admin account →
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
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
                  placeholder="admin@framecraftpro.com"
                  required
                  disabled={isLoading}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
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
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <Chrome size={20} className="text-blue-600" />
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure admin access only. Contact IT support if you need
              assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
