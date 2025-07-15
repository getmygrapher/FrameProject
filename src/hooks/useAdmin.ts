import { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import { AdminUser } from '../lib/supabase';
import { supabase } from '../lib/supabase';

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
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
        
        // Check current session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setAdmin(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          // User is logged in, check if they're an admin
          await checkAdminStatus();
        } else if (mounted) {
          // No session, user is not authenticated
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Admin auth state change:', event, session?.user?.email);

      setLoading(true); // Always set loading true at the start of handler
      try {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          // User just signed in, token refreshed, or session restored: check if they're an admin
          await checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
        } else if (event === 'USER_UPDATED' && session?.user) {
          // User updated, recheck admin status
          await checkAdminStatus();
        } else {
          // Handle any other auth state that doesn't have a user
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (mounted) {
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setLoading(false); // Always set loading false at the end
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      // Log current session user
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) {
        console.error('Supabase session error:', sessionError);
      } else {
        console.log('Supabase session user:', user?.id, user?.email);
      }
      const adminUser = await AdminService.getCurrentAdmin();
      console.log('AdminService.getCurrentAdmin() result:', adminUser);
      if (adminUser) {
        setAdmin(adminUser);
        setIsAuthenticated(true);
        console.log('Admin authenticated:', adminUser.email);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        console.warn('User is not an admin or admin record not found');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { admin: adminUser } = await AdminService.loginWithEmail(email, password);
      setAdmin(adminUser);
      setIsAuthenticated(true);
      return adminUser;
    } catch (error) {
      console.error('Email login error:', error);
      setAdmin(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await AdminService.loginWithGoogle();
      // OAuth will redirect, so we don't need to handle the response here
    } catch (error) {
      console.error('Google login error:', error);
      setAdmin(null);
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const checkFirstTimeSetup = async () => {
    try {
      return await AdminService.needsFirstTimeSetup();
    } catch (error) {
      console.error('Error checking first time setup:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AdminService.logout();
      setAdmin(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    admin,
    loading,
    isAuthenticated,
    loginWithEmail,
    loginWithGoogle,
    logout,
    checkAdminStatus,
    checkFirstTimeSetup
  };
}