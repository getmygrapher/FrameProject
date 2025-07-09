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
          redirectTo: `${window.location.origin}/admin`,
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
    try {
      // First check if setup is actually needed
      const needsSetup = await this.needsFirstTimeSetup();
      if (!needsSetup) {
        throw new Error('Admin users already exist. Setup not needed.');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create admin record
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role: 'super_admin',
          is_active: true
        })
        .select()
        .single();

      if (adminError) {
        console.error('Error creating admin record:', adminError);
        // Clean up auth user if admin creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Error cleaning up auth user:', cleanupError);
        }
        throw new Error('Failed to create admin record');
      }

      return adminData;
    } catch (error) {
      console.error('Error in setupFirstAdminWithEmail:', error);
      throw error;
    }
  }

  // Setup first admin with Google OAuth
  static async setupFirstAdminWithGoogle(): Promise<AdminUser> {
    try {
      // First check if setup is actually needed
      const needsSetup = await this.needsFirstTimeSetup();
      if (!needsSetup) {
        throw new Error('Admin users already exist. Setup not needed.');
      }

      // Sign in with Google OAuth
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
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
    } catch (error) {
      console.error('Error in setupFirstAdminWithGoogle:', error);
      throw error;
    }
  }

  // Create new admin user (for existing admins to add new ones)
  static async createAdmin(
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'super_admin' = 'admin'
  ): Promise<AdminUser> {
    try {
      // Verify current user is a super admin
      const currentAdmin = await this.getCurrentAdmin();
      if (!currentAdmin || currentAdmin.role !== 'super_admin') {
        throw new Error('Only super admins can create new admin users');
      }

      // Use the edge function to create admin user
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email,
          password,
          fullName,
          role
        }
      });

      if (error) {
        console.error('Error calling create-admin-user function:', error);
        throw new Error('Failed to create admin user');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create admin user');
      }

      return data.admin;
    } catch (error) {
      console.error('Error in createAdmin:', error);
      throw error;
    }
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