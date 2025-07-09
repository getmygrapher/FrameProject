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
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Check current session first
        const { data: { session } } = await supabase.auth.getSession();
        
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

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        // User just signed in, check if they're an admin
        await checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setAdmin(null);
        setIsAuthenticated(false);
        setLoading(false);
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
      const adminUser = await AdminService.getCurrentAdmin();
      
      setAdmin(adminUser);
      setIsAuthenticated(!!adminUser);
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
      const { admin: adminUser } = await AdminService.loginWithGoogle();
      setAdmin(adminUser);
      setIsAuthenticated(true);
      return adminUser;
    } catch (error) {
      console.error('Google login error:', error);
      setAdmin(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
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