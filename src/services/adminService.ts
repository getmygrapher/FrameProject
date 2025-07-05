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
      .single();

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
      .single();

    if (error) {
      console.error('Error fetching admin user:', error);
      return null;
    }

    return data;
  }

  // Admin login
  static async login(email: string, password: string): Promise<{ user: any; admin: AdminUser | null }> {
    // First, sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error('Invalid email or password');
    }

    if (!authData.user) {
      throw new Error('Authentication failed');
    }

    // Wait a moment for the session to be established
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if user is an active admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminData) {
      console.error('Admin verification error:', adminError);
      // Sign out the user since they're not an admin
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
      // Don't fail login for this
    }

    return { user: authData.user, admin: adminData };
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

  // Create new admin user (super admin only) - now uses edge function
  static async createAdmin(
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'super_admin' = 'admin'
  ): Promise<AdminUser> {
    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      // Call the edge function to create admin user
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create admin user');
      }

      if (!result.success || !result.admin) {
        throw new Error('Failed to create admin user');
      }

      return result.admin;
    } catch (error: any) {
      console.error('Error in createAdmin:', error);
      throw error;
    }
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
}