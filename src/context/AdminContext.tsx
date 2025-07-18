import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { AdminUser } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface AdminContextType {
  admin: AdminUser | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkFirstTimeSetup: () => Promise<boolean>;
  setupFirstAdmin: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user is admin
  const checkAdminStatus = useCallback(
    async (authUser: User): Promise<AdminUser | null> => {
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", authUser.id)
          .eq("is_active", true)
          .maybeSingle();

        if (error) {
          console.error("Error checking admin status:", error);
          return null;
        }

        return data;
      } catch (error) {
        console.error("Error in checkAdminStatus:", error);
        return null;
      }
    },
    [],
  );

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setUser(null);
        setAdmin(null);
        setIsAuthenticated(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);

        // Check if user is admin
        const adminData = await checkAdminStatus(session.user);
        if (adminData) {
          setAdmin(adminData);
          setIsAuthenticated(true);

          // Update last login
          try {
            await supabase
              .from("admin_users")
              .update({ last_login: new Date().toISOString() })
              .eq("id", session.user.id);
          } catch (updateError) {
            console.error("Error updating last login:", updateError);
          }
        } else {
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
      setAdmin(null);
      setIsAuthenticated(false);
      setError("Failed to initialize authentication");
    } finally {
      setLoading(false);
    }
  }, [checkAdminStatus]);

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event, session?.user?.email);

      try {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);

          const adminData = await checkAdminStatus(session.user);
          if (adminData) {
            setAdmin(adminData);
            setIsAuthenticated(true);

            // Update last login
            try {
              await supabase
                .from("admin_users")
                .update({ last_login: new Date().toISOString() })
                .eq("id", session.user.id);
            } catch (updateError) {
              console.error("Error updating last login:", updateError);
            }
          } else {
            setAdmin(null);
            setIsAuthenticated(false);
            setError("Access denied. Admin privileges required.");
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setAdmin(null);
          setIsAuthenticated(false);
          setError(null);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUser(session.user);
          // Don't check admin status on token refresh to avoid unnecessary calls
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        setError("Authentication error occurred");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializeAuth, checkAdminStatus]);

  // Login with email and password
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (authError) {
          throw new Error(authError.message);
        }

        if (!data.user) {
          throw new Error("Authentication failed");
        }

        // Admin status will be checked in the auth state change handler
      } catch (error: any) {
        console.error("Email login error:", error);
        setError(error.message || "Login failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin.html`,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || "Google login failed");
      setLoading(false);
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Logout error:", error);
      setError(error.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if first time setup is needed
  const checkFirstTimeSetup = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id", { count: "exact" })
        .eq("is_active", true);

      if (error) {
        console.error("Error checking admin count:", error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error("Error in checkFirstTimeSetup:", error);
      return false;
    }
  }, []);

  // Setup first admin
  const setupFirstAdmin = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        setLoading(true);
        setError(null);

        // Check if setup is actually needed
        const needsSetup = await checkFirstTimeSetup();
        if (!needsSetup) {
          throw new Error("Admin users already exist. Setup not needed.");
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          },
        );

        if (authError) {
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error("Failed to create user account");
        }

        // Create admin record
        const { error: adminError } = await supabase
          .from("admin_users")
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            role: "super_admin",
            is_active: true,
          });

        if (adminError) {
          console.error("Error creating admin record:", adminError);
          throw new Error("Failed to create admin record");
        }

        // Sign in the user
        await loginWithEmail(email, password);
      } catch (error: any) {
        console.error("Error in setupFirstAdmin:", error);
        setError(error.message || "Setup failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [checkFirstTimeSetup, loginWithEmail],
  );

  const value: AdminContextType = {
    admin,
    user,
    loading,
    isAuthenticated,
    error,
    loginWithEmail,
    loginWithGoogle,
    logout,
    clearError,
    checkFirstTimeSetup,
    setupFirstAdmin,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export { AdminContext };
