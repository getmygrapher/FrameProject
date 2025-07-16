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
    let firstAuthEventReceived = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Fallback timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && !firstAuthEventReceived) {
        setLoading(false);
      }
    }, 3000); // 3 seconds

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (!firstAuthEventReceived) firstAuthEventReceived = true;
      clearTimeout(timeoutId);

      console.log('Admin auth state change:', event, session?.user?.email);

      try {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          // User just signed in or token refreshed, check if they're an admin
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
          setLoading(false);
        }
      }
    });

    // On mount, trigger a check in case the session is already available
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        checkAdminStatus();
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const adminUser = await AdminService.getCurrentAdmin();
      
      if (adminUser) {
        setAdmin(adminUser);
        setIsAuthenticated(true);
        console.log('Admin authenticated:', adminUser.email);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        console.log('User is not an admin or admin record not found');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      // CRITICAL: Always set loading to false regardless of outcome
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