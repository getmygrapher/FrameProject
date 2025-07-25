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
  Building,
  Phone,
  MapPin,
  FileText,
  Upload,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { B2BRegistrationData } from "../../types/auth";

interface B2BRegisterProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export default function B2BRegister({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}: B2BRegisterProps) {
  const { registerB2B, loading, error } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<B2BRegistrationData>({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "b2b_partner",
    company_name: "",
    business_type: "",
    tax_id: "",
    business_address: {
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "India",
    },
    contact_person: "",
    contact_phone: "",
    contact_email: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/\d/.test(pwd)) errors.push("One number");
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("business_address.")) {
      const addressField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        business_address: {
          ...prev.business_address!,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      return;
    }

    if (!acceptedTerms) {
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      return;
    }

    try {
      await registerB2B(formData);
      onRegisterSuccess();
    } catch (err) {
      // Error is handled by the context
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStep1Valid = () => {
    return (
      formData.full_name &&
      formData.email &&
      formData.password &&
      confirmPassword &&
      formData.password === confirmPassword &&
      validatePassword(formData.password).length === 0
    );
  };

  const isStep2Valid = () => {
    return (
      formData.company_name &&
      formData.business_type &&
      formData.business_address?.street &&
      formData.business_address?.city &&
      formData.business_address?.state &&
      formData.business_address?.zip_code
    );
  };

  const passwordErrors = validatePassword(formData.password);
  const isPasswordValid =
    formData.password.length > 0 && passwordErrors.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                B2B Partner Application
              </h2>
              <p className="text-sm text-gray-600">
                Join our business partner program
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Personal Info</span>
            <span>Business Details</span>
            <span>Review & Submit</span>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email Address *
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.business@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                      required
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
                        {
                          check: /\d/.test(formData.password),
                          text: "One number",
                        },
                      ].map((req, index) => (
                        <div
                          key={index}
                          className={`text-xs flex items-center gap-1 ${req.check ? "text-green-600" : "text-gray-400"}`}
                        >
                          <CheckCircle
                            size={12}
                            className={
                              req.check ? "text-green-600" : "text-gray-300"
                            }
                          />
                          {req.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <div
                      className={`mt-1 text-xs flex items-center gap-1 ${
                        formData.password === confirmPassword
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <CheckCircle
                        size={12}
                        className={
                          formData.password === confirmPassword
                            ? "text-green-600"
                            : "text-red-300"
                        }
                      />
                      {formData.password === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) =>
                        handleInputChange("company_name", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your company name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    value={formData.business_type}
                    onChange={(e) =>
                      handleInputChange("business_type", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="retailer">Retailer</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="distributor">Distributor</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID / GST Number
                </label>
                <div className="relative">
                  <FileText
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) =>
                      handleInputChange("tax_id", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your tax ID or GST number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin
                      size={20}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.business_address?.street}
                      onChange={(e) =>
                        handleInputChange(
                          "business_address.street",
                          e.target.value,
                        )
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.business_address?.city}
                      onChange={(e) =>
                        handleInputChange(
                          "business_address.city",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                      required
                    />
                    <input
                      type="text"
                      value={formData.business_address?.state}
                      onChange={(e) =>
                        handleInputChange(
                          "business_address.state",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="State"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.business_address?.zip_code}
                      onChange={(e) =>
                        handleInputChange(
                          "business_address.zip_code",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ZIP Code"
                      required
                    />
                    <input
                      type="text"
                      value={formData.business_address?.country}
                      onChange={(e) =>
                        handleInputChange(
                          "business_address.country",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) =>
                      handleInputChange("contact_person", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Primary contact person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      handleInputChange("contact_phone", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Business phone number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Application Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Personal Information
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {formData.full_name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {formData.email}
                      </p>
                      {formData.phone && (
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {formData.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Business Information
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Company:</span>{" "}
                        {formData.company_name}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {formData.business_type}
                      </p>
                      {formData.tax_id && (
                        <p>
                          <span className="font-medium">Tax ID:</span>{" "}
                          {formData.tax_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Privacy Policy
                  </button>
                  . I understand that my application will be reviewed and I will
                  be notified of the approval status.
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  What happens next?
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    • Your application will be reviewed within 2-3 business days
                  </li>
                  <li>
                    • You'll receive an email notification about your approval
                    status
                  </li>
                  <li>
                    • Once approved, you'll have access to wholesale pricing and
                    B2B features
                  </li>
                  <li>
                    • Our team may contact you for additional verification if
                    needed
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid())
                }
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid())
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading || !acceptedTerms
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Application"
                )}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
            disabled={loading}
          >
            Already have a business account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
