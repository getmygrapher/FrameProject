import { supabase, AdminUser } from '../lib/supabase';

export class AdminService {
  // Check if current user is admin
  static async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isAdmin:', error);
      return false;
    }
  }

  // Get current admin user
  static async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching admin user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentAdmin:', error);
      return null;
    }
  }

  // Check if first time setup is needed
  static async needsFirstTimeSetup(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      if (error) {
        console.error('Error checking admin count:', error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error in needsFirstTimeSetup:', error);
      return false;
    }
  }

  // Login with email and password
  static async loginWithEmail(email: string, password: string): Promise<{ user: any; admin: AdminUser }> {
    try {
      // First authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth login error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Authentication failed');
      }

      // Check if user is an active admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError) {
        console.error('Admin verification error:', adminError);
        await supabase.auth.signOut();
        throw new Error('Error verifying admin privileges');
      }

      if (!adminData) {
        console.error('Admin verification failed: User not found or inactive');
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Update last login timestamp
      try {
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authData.user.id);
      } catch (updateError) {
        console.error('Error updating last login:', updateError);
      }

      return { user: authData.user, admin: adminData };
    } catch (error) {
      console.error('Error in loginWithEmail:', error);
      throw error;
    }
  }

  // Google OAuth login
  static async loginWithGoogle(): Promise<{ user: any; admin: AdminUser | null }> {
    try {
      // Sign in with Google OAuth
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin.html`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (authError) {
        console.error('Google OAuth error:', authError);
        throw new Error('Google authentication failed');
      }

      // Don't wait for the OAuth flow here - let the hook handle it
      return { user: null, admin: null };
    } catch (error) {
      console.error('Error in loginWithGoogle:', error);
      throw error;
    }
  }

  // Setup first admin with email/password
  static async setupFirstAdminWithEmail(
    email: string,
    password: string,
    fullName: string
  ): Promise<AdminUser> {
    console.info('First-time admin setup is deferred.');
    throw new Error('First-time admin setup is temporarily disabled.');
  }

  // Setup first admin with Google OAuth
  static async setupFirstAdminWithGoogle(): Promise<AdminUser> {
    console.info('First-time admin setup is deferred.');
    throw new Error('First-time admin setup is temporarily disabled.');
  }

  // Create new admin user (for existing admins to add new ones)
  static async createAdmin(
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'super_admin' = 'admin'
  ): Promise<AdminUser> {
    console.info('Admin user creation is deferred.');
    throw new Error('Admin user creation is temporarily disabled.');
  }

  // Admin logout
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  }

  // Get all admin users (super admin only)
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllAdmins:', error);
      throw error;
    }
  }

  // Update admin user (super admin only)
  static async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating admin user:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateAdmin:', error);
      throw error;
    }
  }

  // Deactivate admin user (super admin only)
  static async deactivateAdmin(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deactivating admin user:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deactivateAdmin:', error);
      throw error;
    }
  }
}
