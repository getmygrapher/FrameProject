import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserAuthService } from '../services/userAuthService';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for OAuth callback parameters in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // Clear the hash from URL immediately
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
          return;
        }
        
        if (mounted && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          console.log('User authenticated:', session.user.email);
        } else if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('User auth state change:', event, session?.user?.email);

      try {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          console.log('User signed in:', session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          console.log('User signed out');
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
          console.log('User updated:', session.user.email);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: loggedInUser } = await UserAuthService.loginWithEmail(email, password);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return loggedInUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { user: newUser } = await UserAuthService.registerWithEmail(email, password, fullName);
      setUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await UserAuthService.loginWithGoogle();
      // OAuth will redirect, so we don't need to handle the response here
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await UserAuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const { user: updatedUser } = await UserAuthService.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile
  };
}