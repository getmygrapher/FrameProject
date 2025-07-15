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

    // Listen for auth state changes only (no initializeAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log('[useAdmin] onAuthStateChange fired:', event, session?.user?.email);
      setLoading(true);
      try {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          await checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
        } else if (event === 'USER_UPDATED' && session?.user) {
          await checkAdminStatus();
        } else {
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
        if (mounted) setLoading(false);
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