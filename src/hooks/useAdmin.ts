import { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import { AdminUser } from '../lib/supabase';
import { supabase } from '../lib/supabase';

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper: Wait for Supabase session to be available (max 1s)
  const waitForSession = async (maxWaitMs = 1000, intervalMs = 50) => {
    let waited = 0;
    while (waited < maxWaitMs) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return session;
      await new Promise(res => setTimeout(res, intervalMs));
      waited += intervalMs;
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;
    let firstAuthEventReceived = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    console.log('[useAdmin] Effect mounted');

    // Fallback timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && !firstAuthEventReceived) {
        console.warn('[useAdmin] Fallback timeout hit, setting loading to false');
        setLoading(false);
      }
    }, 3000); // 3 seconds

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (!firstAuthEventReceived) firstAuthEventReceived = true;
      clearTimeout(timeoutId);

      console.log('[useAdmin] Auth state change:', event, session?.user?.email);

      try {
        if (session?.user) {
          console.log('[useAdmin] Session user found, checking admin status...');
          await checkAdminStatus();
        } else {
          console.log('[useAdmin] No session user, setting admin to null and loading to false');
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('[useAdmin] Error handling auth state change:', error);
        if (mounted) {
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    });

    // Listen for tab visibility changes
    const handleVisibilityChange = async () => {
      console.log('[useAdmin] Tab visibility changed:', document.visibilityState);
      if (document.visibilityState === 'visible') {
        console.log('[useAdmin] Tab is visible, waiting for session and re-checking admin status');
        setLoading(true);
        const session = await waitForSession();
        if (session) {
          await checkAdminStatus();
        } else {
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
          console.warn('[useAdmin] No session found after tab switch');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('[useAdmin] Effect cleaned up');
    };
  }, []);

  const checkAdminStatus = async () => {
    try {
      console.log('[useAdmin] checkAdminStatus: started');
      setLoading(true);
      const adminUser = await AdminService.getCurrentAdmin();
      
      if (adminUser) {
        setAdmin(adminUser);
        setIsAuthenticated(true);
        console.log('[useAdmin] checkAdminStatus: admin authenticated', adminUser.email);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        console.warn('[useAdmin] checkAdminStatus: user is not an admin or admin record not found');
      }
    } catch (error) {
      console.error('[useAdmin] checkAdminStatus: error', error);
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('[useAdmin] checkAdminStatus: loading set to false');
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      console.log('[useAdmin] loginWithEmail: started');
      setLoading(true);
      const { admin: adminUser } = await AdminService.loginWithEmail(email, password);
      setAdmin(adminUser);
      setIsAuthenticated(true);
      console.log('[useAdmin] loginWithEmail: success', adminUser.email);
      return adminUser;
    } catch (error) {
      console.error('[useAdmin] loginWithEmail: error', error);
      setAdmin(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
      console.log('[useAdmin] loginWithEmail: loading set to false');
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('[useAdmin] loginWithGoogle: started');
      setLoading(true);
      await AdminService.loginWithGoogle();
      // OAuth will redirect, so we don't need to handle the response here
    } catch (error) {
      console.error('[useAdmin] loginWithGoogle: error', error);
      setAdmin(null);
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const checkFirstTimeSetup = async () => {
    try {
      console.log('[useAdmin] checkFirstTimeSetup: started');
      return await AdminService.needsFirstTimeSetup();
    } catch (error) {
      console.error('[useAdmin] checkFirstTimeSetup: error', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[useAdmin] logout: started');
      await AdminService.logout();
      setAdmin(null);
      setIsAuthenticated(false);
      console.log('[useAdmin] logout: success');
    } catch (error) {
      console.error('[useAdmin] logout: error', error);
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