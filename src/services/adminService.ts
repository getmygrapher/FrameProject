import { supabase, AdminUser } from "../lib/supabase";

export class AdminService {
  // Check if current user is admin
  static async isAdmin(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { data, error } = await supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in isAdmin:", error);
      return false;
    }
  }

  // Get current admin user
  static async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching admin user:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getCurrentAdmin:", error);
      return null;
    }
  }

  // Get all admin users (super admin only)
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching admin users:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllAdmins:", error);
      throw error;
    }
  }

  // Update admin user (super admin only)
  static async updateAdmin(
    id: string,
    updates: Partial<AdminUser>,
  ): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating admin user:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateAdmin:", error);
      throw error;
    }
  }

  // Deactivate admin user (super admin only)
  static async deactivateAdmin(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        console.error("Error deactivating admin user:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deactivateAdmin:", error);
      throw error;
    }
  }

  // Create new admin user (for existing admins to add new ones)
  static async createAdmin(
    email: string,
    password: string,
    fullName: string,
    role: "admin" | "super_admin" = "admin",
  ): Promise<AdminUser> {
    try {
      // Verify current user is a super admin
      const currentAdmin = await this.getCurrentAdmin();
      if (!currentAdmin || currentAdmin.role !== "super_admin") {
        throw new Error("Only super admins can create new admin users");
      }

      // Use the edge function to create admin user
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-admin-user",
        {
          body: {
            email,
            password,
            fullName,
            role,
          },
        },
      );

      if (error) {
        console.error("Error calling create-admin-user function:", error);
        throw new Error("Failed to create admin user");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to create admin user");
      }

      return data.admin;
    } catch (error) {
      console.error("Error in createAdmin:", error);
      throw error;
    }
  }
}
