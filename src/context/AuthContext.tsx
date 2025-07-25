import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { AuthService } from "../services/authService";
import type {
  AuthUser,
  B2BPartner,
  AuthState,
  LoginCredentials,
  RegisterData,
  B2BRegistrationData,
  PasswordResetData,
  PasswordUpdateData,
  ProfileUpdateData,
  UserRole,
} from "../types/auth";

interface AuthContextType extends AuthState {
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  registerB2C: (data: RegisterData) => Promise<void>;
  registerB2B: (data: B2BRegistrationData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Password management
  resetPassword: (data: PasswordResetData) => Promise<void>;
  updatePassword: (data: PasswordUpdateData) => Promise<void>;

  // Profile management
  updateProfile: (data: ProfileUpdateData) => Promise<void>;

  // Email verification
  verifyEmail: (token: string) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<void>;

  // Role checking utilities
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isB2BPartner: () => boolean;
  isB2CCustomer: () => boolean;

  // B2B specific
  canViewB2BPricing: () => boolean;

  // Error handling
  clearError: () => void;

  // Refresh user data
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    b2bPartner: null,
    loading: true,
    isAuthenticated: false,
    error: null,
  });

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Set error
  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  // Set loading
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  // Initialize user from current session
  const initializeUser = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const user = await AuthService.getCurrentUser();

      if (user) {
        let b2bPartner: B2BPartner | null = null;
        if (user.role === "b2b_partner") {
          b2bPartner = await AuthService.getB2BPartner(user.id);
        }

        setState({
          user,
          b2bPartner,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setState({
          user: null,
          b2bPartner: null,
          loading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error("Error initializing user:", error);
      setState({
        user: null,
        b2bPartner: null,
        loading: false,
        isAuthenticated: false,
        error: error.message || "Failed to initialize authentication",
      });
    }
  }, [clearError]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await initializeUser();
  }, [initializeUser]);

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    initializeUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event, session?.user?.email);

      try {
        if (event === "SIGNED_IN" && session?.user) {
          const user = await AuthService.getCurrentUser();

          if (user) {
            let b2bPartner: B2BPartner | null = null;
            if (user.role === "b2b_partner") {
              b2bPartner = await AuthService.getB2BPartner(user.id);
            }

            setState({
              user,
              b2bPartner,
              loading: false,
              isAuthenticated: true,
              error: null,
            });
          } else {
            setState({
              user: null,
              b2bPartner: null,
              loading: false,
              isAuthenticated: false,
              error: "Failed to load user profile",
            });
          }
        } else if (event === "SIGNED_OUT") {
          setState({
            user: null,
            b2bPartner: null,
            loading: false,
            isAuthenticated: false,
            error: null,
          });
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          // Don't reload user data on token refresh to avoid unnecessary calls
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error: any) {
        console.error("Error handling auth state change:", error);
        setState({
          user: null,
          b2bPartner: null,
          loading: false,
          isAuthenticated: false,
          error: error.message || "Authentication error occurred",
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializeUser]);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLoading(true);
        clearError();

        const { user, b2bPartner } = await AuthService.login(credentials);

        setState({
          user,
          b2bPartner: b2bPartner || null,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (error: any) {
        setError(error.message || "Login failed");
        throw error;
      }
    },
    [clearError, setError, setLoading],
  );

  // Register B2C customer
  const registerB2C = useCallback(
    async (data: RegisterData) => {
      try {
        setLoading(true);
        clearError();

        const { user } = await AuthService.registerB2C(data);

        setState({
          user,
          b2bPartner: null,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (error: any) {
        setError(error.message || "Registration failed");
        throw error;
      }
    },
    [clearError, setError, setLoading],
  );

  // Register B2B partner
  const registerB2B = useCallback(
    async (data: B2BRegistrationData) => {
      try {
        setLoading(true);
        clearError();

        const { user, b2bPartner } = await AuthService.registerB2B(data);

        setState({
          user,
          b2bPartner,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (error: any) {
        setError(error.message || "Registration failed");
        throw error;
      }
    },
    [clearError, setError, setLoading],
  );

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      await AuthService.loginWithGoogle();
      // OAuth will redirect, so we don't need to handle the response here
    } catch (error: any) {
      setError(error.message || "Google authentication failed");
      setLoading(false);
      throw error;
    }
  }, [clearError, setError, setLoading]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await AuthService.logout();

      setState({
        user: null,
        b2bPartner: null,
        loading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      // Even if logout fails, clear the local state
      setState({
        user: null,
        b2bPartner: null,
        loading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, [setLoading]);

  // Reset password
  const resetPassword = useCallback(
    async (data: PasswordResetData) => {
      try {
        setLoading(true);
        clearError();

        await AuthService.resetPassword(data);
        setLoading(false);
      } catch (error: any) {
        setError(error.message || "Password reset failed");
        throw error;
      }
    },
    [clearError, setError, setLoading],
  );

  // Update password
  const updatePassword = useCallback(
    async (data: PasswordUpdateData) => {
      try {
        setLoading(true);
        clearError();

        await AuthService.updatePassword(data);
        setLoading(false);
      } catch (error: any) {
        setError(error.message || "Password update failed");
        throw error;
      }
    },
    [clearError, setError, setLoading],
  );

  // Update profile
  const updateProfile = useCallback(
    async (data: ProfileUpdateData) => {
      try {
        setLoading(true);
        clearError();

        const updatedUser = await AuthService.updateProfile(data);

        setState((prev) => ({
          ...prev,
          user: updatedUser,
          loading: false,
        }));
      } catch (error: any) {
        setError(error.message || "Profile update failed");
        throw error;
      }
    },
    [clearError, setError, setLoading],
  );

  // Verify email
  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        setLoading(true);
        clearError();

        await AuthService.verifyEmail(token);
        await refreshUser(); // Refresh user data after verification
      } catch (error: any) {
        setError(error.message || "Email verification failed");
        throw error;
      }
    },
    [clearError, setError, setLoading, refreshUser],
  );

  // Resend email verification
  const resendEmailVerification = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        clearError();

        await AuthService.resendEmailVerification(email);
        setLoading(false);
      } catch (error: any) {
        setError(error.message || "Failed to resend verification email");
        throw error;
      }
    },
    [clearError, setError, setLoading],
  );

  // Role checking utilities
  const hasRole = useCallback(
    (role: UserRole) => {
      return AuthService.hasRole(state.user, role);
    },
    [state.user],
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => {
      return AuthService.hasAnyRole(state.user, roles);
    },
    [state.user],
  );

  const isAdmin = useCallback(() => {
    return AuthService.isAdmin(state.user);
  }, [state.user]);

  const isB2BPartner = useCallback(() => {
    return AuthService.isB2BPartner(state.user);
  }, [state.user]);

  const isB2CCustomer = useCallback(() => {
    return AuthService.isB2CCustomer(state.user);
  }, [state.user]);

  // Check if user can view B2B pricing
  const canViewB2BPricing = useCallback(() => {
    return isB2BPartner() && state.b2bPartner?.status === "approved";
  }, [isB2BPartner, state.b2bPartner]);

  const value: AuthContextType = {
    ...state,
    login,
    registerB2C,
    registerB2B,
    loginWithGoogle,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    verifyEmail,
    resendEmailVerification,
    hasRole,
    hasAnyRole,
    isAdmin,
    isB2BPartner,
    isB2CCustomer,
    canViewB2BPricing,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };
