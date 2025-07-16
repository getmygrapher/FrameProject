import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AdminService } from '../services/adminService';
import { AdminUser } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  admin: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<AdminUser | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  checkFirstTimeSetup: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const waitForSession = async (timeout = 1000, interval = 50) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;
    await new Promise(res => setTimeout(res, interval));
  }
  return null;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const adminUser = await AdminService.getCurrentAdmin();
      console.log('[AdminProvider] getCurrentAdmin result:', adminUser);
      if (adminUser) {
        setAdmin(adminUser);
        setIsAuthenticated(true);
        console.log('[AdminProvider] Admin authenticated:', adminUser.email);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        setError('User is not an admin or admin record not found');
        console.warn('[AdminProvider] User is not an admin or admin record not found');
      }
    } catch (error) {
      console.error('[AdminProvider] Error checking admin status:', error);
      setAdmin(null);
      setIsAuthenticated(false);
      setError('Error checking admin status: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
      console.log('[AdminProvider] Loading set to false (checkAdminStatus)');
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // OAuth callback cleanup
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      // Wait for session rehydration
      const session = await waitForSession();
      console.log('[AdminProvider] Session after waitForSession:', session);
      if (session?.user) {
        await checkAdminStatus();
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
        setError('No session found after waiting for rehydration');
        setLoading(false);
        console.warn('[AdminProvider] No session found after waiting for rehydration');
      }
    } catch (error) {
      console.error('[AdminProvider] Error initializing auth:', error);
      setAdmin(null);
      setIsAuthenticated(false);
      setError('Error initializing auth: ' + (error instanceof Error ? error.message : String(error)));
      setLoading(false);
    }
  }, [checkAdminStatus]);

  useEffect(() => {
    let mounted = true;
    initializeAuth();
    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log('Admin auth state change:', event, session?.user?.email);
      try {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
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
        setAdmin(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });
    // Tab visibility handler
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        setLoading(true);
        setError(null);
        const session = await waitForSession();
        console.log('[AdminProvider] Session after waitForSession (visibility):', session);
        if (session) {
          await checkAdminStatus();
        } else {
          setAdmin(null);
          setIsAuthenticated(false);
          setError('No session found after tab became visible');
          setLoading(false);
          console.warn('[AdminProvider] No session found after tab became visible');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [initializeAuth, checkAdminStatus]);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
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
    setLoading(true);
    try {
      await AdminService.loginWithGoogle();
      // OAuth will redirect
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

  return (
    <AdminContext.Provider value={{
      admin,
      loading,
      isAuthenticated,
      loginWithEmail,
      loginWithGoogle,
      logout,
      checkAdminStatus,
      checkFirstTimeSetup
    }}>
      {error && (
        <div style={{ color: 'red', background: '#fee', padding: 8, margin: 8, border: '1px solid #f99' }}>
          <strong>Admin Auth Error:</strong> {error}
        </div>
      )}
      {children}
    </AdminContext.Provider>
  );
};

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}

export { AdminContext };