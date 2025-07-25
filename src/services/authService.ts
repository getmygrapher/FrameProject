import { supabase } from "../lib/supabase";
import type {
  AuthUser,
  B2BPartner,
  LoginCredentials,
  RegisterData,
  B2BRegistrationData,
  PasswordResetData,
  PasswordUpdateData,
  ProfileUpdateData,
  UserRole,
} from "../types/auth";

export class AuthService {
  // Clear all authentication tokens and session data
  static async clearAuthTokens(): Promise<void> {
    try {
      // Sign out from Supabase (this clears tokens)
      await supabase.auth.signOut({ scope: "global" });

      // Clear any local storage items related to auth
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem(
          "sb-" + supabase.supabaseUrl.split("//")[1] + "-auth-token",
        );
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  }

  // Get current authenticated user with role information
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Get user profile with role information
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select(
          `
          *,
          role:user_roles(name, display_name, permissions)
        `,
        )
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Error fetching user profile:", profileError);
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role?.name || "b2c_customer",
        is_active: profile.is_active,
        email_verified: profile.email_verified,
        phone_verified: profile.phone_verified,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_login: profile.last_login,
        avatar_url: user.user_metadata?.avatar_url,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // Get B2B partner information if user is a B2B partner
  static async getB2BPartner(userId: string): Promise<B2BPartner | null> {
    try {
      const { data, error } = await supabase
        .from("b2b_accounts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching B2B partner:", error);
      return null;
    }
  }

  // Login with email and password
  static async login(
    credentials: LoginCredentials,
  ): Promise<{ user: AuthUser; b2bPartner?: B2BPartner }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Authentication failed");
      }

      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("Failed to fetch user profile");
      }

      // Update last login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", user.id);

      let b2bPartner: B2BPartner | undefined;
      if (user.role === "b2b_partner") {
        b2bPartner = (await this.getB2BPartner(user.id)) || undefined;
      }

      return { user, b2bPartner };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  // Register B2C customer
  static async registerB2C(data: RegisterData): Promise<{ user: AuthUser }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Registration failed");
      }

      // Get default B2C role
      const { data: role } = await supabase
        .from("user_roles")
        .select("id")
        .eq("name", "b2c_customer")
        .single();

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        role_id: role?.id,
        is_active: true,
        email_verified: false,
        phone_verified: false,
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        throw new Error("Failed to create user profile");
      }

      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("Failed to fetch user profile");
      }

      return { user };
    } catch (error: any) {
      console.error("B2C registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  }

  // Register B2B partner
  static async registerB2B(
    data: B2BRegistrationData,
  ): Promise<{ user: AuthUser; b2bPartner: B2BPartner }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Registration failed");
      }

      // Get B2B partner role
      const { data: role } = await supabase
        .from("user_roles")
        .select("id")
        .eq("name", "b2b_partner")
        .single();

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        role_id: role?.id,
        is_active: true,
        email_verified: false,
        phone_verified: false,
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        throw new Error("Failed to create user profile");
      }

      // Create B2B account
      const { data: b2bData, error: b2bError } = await supabase
        .from("b2b_accounts")
        .insert({
          user_id: authData.user.id,
          company_name: data.company_name,
          business_type: data.business_type,
          tax_id: data.tax_id,
          business_address: data.business_address,
          contact_person: data.contact_person,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          credit_limit: 0,
          payment_terms: 30,
          discount_percentage: 0,
          status: "pending",
        })
        .select()
        .single();

      if (b2bError) {
        console.error("Error creating B2B account:", b2bError);
        throw new Error("Failed to create B2B account");
      }

      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("Failed to fetch user profile");
      }

      return { user, b2bPartner: b2bData };
    } catch (error: any) {
      console.error("B2B registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  }

  // Login with Google OAuth
  static async loginWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Google authentication failed");
    }
  }

  // Logout and clear all tokens
  static async logout(): Promise<void> {
    try {
      await this.clearAuthTokens();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(data: PasswordResetData): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.message || "Password reset failed");
    }
  }

  // Update password
  static async updatePassword(data: PasswordUpdateData): Promise<void> {
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      throw new Error(error.message || "Password update failed");
    }
  }

  // Update user profile
  static async updateProfile(data: ProfileUpdateData): Promise<AuthUser> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Update auth metadata if avatar_url is provided
      if (data.avatar_url) {
        const { error: metaError } = await supabase.auth.updateUser({
          data: { avatar_url: data.avatar_url },
        });

        if (metaError) {
          console.error("Error updating user metadata:", metaError);
        }
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from("users")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      const updatedUser = await this.getCurrentUser();
      if (!updatedUser) {
        throw new Error("Failed to fetch updated user profile");
      }

      return updatedUser;
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw new Error(error.message || "Profile update failed");
    }
  }

  // Check if user has specific role
  static hasRole(user: AuthUser | null, role: UserRole): boolean {
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  static hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  // Check if user is admin (admin or super_admin)
  static isAdmin(user: AuthUser | null): boolean {
    return this.hasAnyRole(user, ["admin", "super_admin"]);
  }

  // Check if user is B2B partner
  static isB2BPartner(user: AuthUser | null): boolean {
    return this.hasRole(user, "b2b_partner");
  }

  // Check if user is B2C customer
  static isB2CCustomer(user: AuthUser | null): boolean {
    return this.hasRole(user, "b2c_customer");
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      throw new Error(error.message || "Email verification failed");
    }
  }

  // Resend email verification
  static async resendEmailVerification(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Resend email verification error:", error);
      throw new Error(error.message || "Failed to resend verification email");
    }
  }

  // Admin: Approve B2B partner
  static async approveB2BPartner(
    partnerId: string,
    adminId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("b2b_accounts")
        .update({
          status: "approved",
          approved_by: adminId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", partnerId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("B2B partner approval error:", error);
      throw new Error(error.message || "Failed to approve B2B partner");
    }
  }

  // Admin: Reject B2B partner
  static async rejectB2BPartner(partnerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("b2b_accounts")
        .update({ status: "rejected" })
        .eq("id", partnerId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("B2B partner rejection error:", error);
      throw new Error(error.message || "Failed to reject B2B partner");
    }
  }

  // Get pending B2B partners for admin approval
  static async getPendingB2BPartners(): Promise<
    (B2BPartner & { user: AuthUser })[]
  > {
    try {
      const { data, error } = await supabase
        .from("b2b_accounts")
        .select(
          `
          *,
          user:users(*)
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error("Error fetching pending B2B partners:", error);
      throw new Error(error.message || "Failed to fetch pending B2B partners");
    }
  }
}
