/**
 * UserAuthService provides authentication-related methods using Supabase Auth.
 * 
 * Error Handling Contract:
 * - All async methods may throw errors (usually instances of Error with a user-friendly message).
 * - Callers MUST wrap calls in try/catch and provide user feedback as appropriate.
 * - Errors are logged to the console for debugging, but not handled internally.
 */
import { supabase } from '../lib/supabase';
import { AuthApiError } from '@supabase/supabase-js';

export class UserAuthService {
  // Register with email and password
  static async registerWithEmail(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Login with email and password
  static async loginWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Login with Google OAuth
  static async loginWithGoogle() {
    const currentUrl = window.location.origin;
    const redirectTo = window.location.pathname.includes('/admin') 
      ? `${currentUrl}/admin.html` 
      : currentUrl;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Google authentication failed');
    }
  }

  // Get current user
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Handle "Auth session missing!" as a warning, not an error
      if (error.message?.includes('Auth session missing')) {
        console.info('No active auth session found');
      } else {
        console.error('Error getting current user:', error);
      }
      return null;
    }

    return user;
  }

  // Update user profile
  static async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Logout
  static async logout() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Password update error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}