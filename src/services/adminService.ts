import { supabase, AdminUser } from '../lib/supabase';

export class AdminService {
  // Check if current user is admin
  static async isAdmin(): Promise<boolean> {
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
  }

  // Get current admin user
  static async getCurrentAdmin(): Promise<AdminUser | null> {
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
  }

  // Check if first time setup is needed
  static async needsFirstTimeSetup(): Promise<boolean> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    if (error) {
      console.error('Error checking admin count:', error);
      return false;
    }

    return !data || data.length === 0;
  }

  // Google OAuth login
  static async loginWithGoogle(): Promise<{ user: any; admin: AdminUser | null }> {
    // Sign in with Google OAuth
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`
      }
    });

    if (authError) {
      console.error('Google OAuth error:', authError);
      throw new Error('Google authentication failed');
    }

    // Wait for the OAuth flow to complete
    return new Promise((resolve, reject) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          subscription.unsubscribe();
          
          try {
            // Check if user is an active admin
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .eq('is_active', true)
              .maybeSingle();

            if (adminError) {
              console.error('Admin verification error:', adminError);
              await supabase.auth.signOut();
              reject(new Error('Error verifying admin privileges'));
              return;
            }

            if (!adminData) {
              console.error('Admin verification failed: User not found or inactive');
              await supabase.auth.signOut();
              reject(new Error('Access denied. Admin privileges required.'));
              return;
            }

            // Update last login timestamp
            try {
              await supabase
                .from('admin_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', session.user.id);
            } catch (updateError) {
              console.error('Error updating last login:', updateError);
            }

            resolve({ user: session.user, admin: adminData });
          } catch (error) {
            subscription.unsubscribe();
            reject(error);
          }
        } else if (event === 'SIGNED_OUT') {
          subscription.unsubscribe();
          reject(new Error('Authentication cancelled'));
        }
      });

      // Set a timeout to prevent hanging
      setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error('Authentication timeout'));
      }, 60000); // 60 seconds timeout
    });
  }

  // Setup first admin with Google OAuth
  static async setupFirstAdminWithGoogle(): Promise<AdminUser> {
    // First check if setup is actually needed
    const needsSetup = await this.needsFirstTimeSetup();
    if (!needsSetup) {
      throw new Error('Admin users already exist. Setup not needed.');
    }

    // Sign in with Google OAuth
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`
      }
    });

    if (authError) {
      console.error('Google OAuth error:', authError);
      throw new Error('Google authentication failed');
    }

    // Wait for the OAuth flow to complete and create admin record
    return new Promise((resolve, reject) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          subscription.unsubscribe();
          
          try {
            // Create admin record for the authenticated user
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .insert({
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
                role: 'super_admin',
                is_active: true
              })
              .select()
              .single();

            if (adminError) {
              console.error('Error creating admin record:', adminError);
              await supabase.auth.signOut();
              reject(new Error('Failed to create admin record'));
              return;
            }

            resolve(adminData);
          } catch (error) {
            subscription.unsubscribe();
            await supabase.auth.signOut();
            reject(error);
          }
        } else if (event === 'SIGNED_OUT') {
          subscription.unsubscribe();
          reject(new Error('Authentication cancelled'));
        }
      });

      // Set a timeout to prevent hanging
      setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error('Authentication timeout'));
      }, 60000); // 60 seconds timeout
    });
  }

  // Admin logout
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Get all admin users (super admin only)
  static async getAllAdmins(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }

    return data || [];
  }

  // Create new admin user via Google OAuth (for existing admins to add new ones)
  static async createAdminWithGoogle(role: 'admin' | 'super_admin' = 'admin'): Promise<AdminUser> {
    // This would be used by existing admins to add new admin users
    // The new user would need to authenticate with Google first
    throw new Error('This feature requires additional implementation for inviting users');
  }

  // Update admin user (super admin only)
  static async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
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
  }

  // Deactivate admin user (super admin only)
  static async deactivateAdmin(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating admin user:', error);
      throw error;
    }
  }

  // Legacy method - kept for backward compatibility but will throw error
  static async createAdmin(
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'super_admin' = 'admin'
  ): Promise<AdminUser> {
    throw new Error('Email/password authentication is disabled. Please use Google OAuth instead.');
  }
}