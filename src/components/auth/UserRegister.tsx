import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  ArrowLeft,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface UserRegisterProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: (user: any) => void;
}

export default function UserRegister({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}: UserRegisterProps) {
  const { registerB2C, loginWithGoogle, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/\d/.test(pwd)) errors.push("One number");
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      return;
    }

    try {
      await registerB2C({
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        role: "b2c_customer",
      });
      onRegisterSuccess();
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      // The OAuth flow will handle the redirect
    } catch (err) {
      // Error is handled by the context
    }
  };

  const passwordErrors = validatePassword(formData.password);
  const isPasswordValid =
    formData.password.length > 0 && passwordErrors.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
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

        <form onSubmit={handleEmailRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="First name"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Last name"
                required
              />
            </div>
          </div>

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
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
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
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Create a password"
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

            {formData.password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="text-xs text-gray-600">
                  Password requirements:
                </div>
                {[
                  {
                    check: formData.password.length >= 8,
                    text: "At least 8 characters",
                  },
                  {
                    check: /[A-Z]/.test(formData.password),
                    text: "One uppercase letter",
                  },
                  {
                    check: /[a-z]/.test(formData.password),
                    text: "One lowercase letter",
                  },
                  { check: /\d/.test(formData.password), text: "One number" },
                ].map((req, index) => (
                  <div
                    key={index}
                    className={`text-xs flex items-center gap-1 ${req.check ? "text-green-600" : "text-gray-400"}`}
                  >
                    <CheckCircle
                      size={12}
                      className={req.check ? "text-green-600" : "text-gray-300"}
                    />
                    {req.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formData.confirmPassword.length > 0 && (
              <div
                className={`mt-1 text-xs flex items-center gap-1 ${
                  formData.password === formData.confirmPassword
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <CheckCircle
                  size={12}
                  className={
                    formData.password === formData.confirmPassword
                      ? "text-green-600"
                      : "text-red-300"
                  }
                />
                {formData.password === formData.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !isPasswordValid ||
              formData.password !== formData.confirmPassword
            }
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              loading ||
              !isPasswordValid ||
              formData.password !== formData.confirmPassword
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </div>
            ) : (
              "Create Account"
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
          onClick={handleGoogleRegister}
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

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
            disabled={loading}
          >
            Already have an account? Sign in
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </div>
      </div>
    </div>
  );
}
