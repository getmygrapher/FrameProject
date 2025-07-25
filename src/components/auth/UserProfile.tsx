import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Edit,
  Save,
  X,
  Shield,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const {
    user,
    b2bPartner,
    loading,
    error: authError,
    updateProfile,
    logout,
    clearError,
    isB2BPartner,
    canViewB2BPricing,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    clearError();

    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "b2c_customer":
        return "Customer";
      case "b2b_partner":
        return "Business Partner";
      case "admin":
        return "Administrator";
      case "super_admin":
        return "Super Administrator";
      default:
        return "User";
    }
  };

  const getStatusBadge = () => {
    if (!isB2BPartner() || !b2bPartner) return null;

    const statusConfig = {
      pending: {
        icon: Clock,
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        text: "Pending Approval",
      },
      approved: {
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200",
        text: "Approved",
      },
      suspended: {
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50 border-red-200",
        text: "Suspended",
      },
      rejected: {
        icon: X,
        color: "text-red-600 bg-red-50 border-red-200",
        text: "Rejected",
      },
    };

    const config = statusConfig[b2bPartner.status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent size={12} />
        {config.text}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {(error || authError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error || authError}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User size={32} className="text-blue-600" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.full_name || "User"}
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {getRoleDisplayName(user.role)}
            </p>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">
                    {user.full_name || "Not set"}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-900">
                    {user.phone || "Not set"}
                  </span>
                  {user.phone_verified && (
                    <Shield
                      size={16}
                      className="text-green-600"
                      title="Verified"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-900">{user.email}</span>
                {user.email_verified && (
                  <Shield
                    size={16}
                    className="text-green-600"
                    title="Verified"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-400" />
                <span
                  className={`text-sm font-medium ${
                    user.is_active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {user.last_login && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Login
                </label>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(user.last_login).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* B2B Partner Information */}
            {isB2BPartner() && b2bPartner && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Building size={16} />
                  Business Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Company Name
                    </label>
                    <span className="text-gray-900">
                      {b2bPartner.company_name}
                    </span>
                  </div>
                  {b2bPartner.business_type && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Business Type
                      </label>
                      <span className="text-gray-900">
                        {b2bPartner.business_type}
                      </span>
                    </div>
                  )}
                  {canViewB2BPricing() && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Credit Limit
                        </label>
                        <span className="text-gray-900">
                          ₹{b2bPartner.credit_limit.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Discount
                        </label>
                        <span className="text-gray-900">
                          {b2bPartner.discount_percentage}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading || loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isLoading || loading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isLoading || loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(user.full_name || "");
                    setPhone(user.phone || "");
                    setError("");
                    clearError();
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
