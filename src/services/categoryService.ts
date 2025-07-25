import { supabase } from "../lib/supabase";
import type { Category } from "../lib/supabase";

export class CategoryService {
  // Get all active categories
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getCategories:", error);
      throw error;
    }
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        console.error("Error fetching category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getCategoryBySlug:", error);
      throw error;
    }
  }

  // Get categories with product counts
  static async getCategoriesWithCounts(): Promise<
    (Category & { product_count: number })[]
  > {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(
          `
          *,
          products!inner(count)
        `,
        )
        .eq("is_active", true)
        .eq("products.is_active", true);

      if (error) {
        console.error("Error fetching categories with counts:", error);
        throw error;
      }

      // Transform the data to include product counts
      const categoriesWithCounts =
        data?.map((category) => ({
          ...category,
          product_count: category.products?.length || 0,
        })) || [];

      return categoriesWithCounts;
    } catch (error) {
      console.error("Error in getCategoriesWithCounts:", error);
      throw error;
    }
  }

  // Get parent categories (top-level)
  static async getParentCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .eq("is_active", true)
        .order("sort_order")
        .order("name");

      if (error) {
        console.error("Error fetching parent categories:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getParentCategories:", error);
      throw error;
    }
  }

  // Get subcategories for a parent category
  static async getSubcategories(parentId: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", parentId)
        .eq("is_active", true)
        .order("sort_order")
        .order("name");

      if (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getSubcategories:", error);
      throw error;
    }
  }

  // Get category hierarchy (parent with children)
  static async getCategoryHierarchy(): Promise<
    (Category & { children: Category[] })[]
  > {
    try {
      const [parentCategories, allCategories] = await Promise.all([
        this.getParentCategories(),
        this.getCategories(),
      ]);

      const hierarchy = parentCategories.map((parent) => ({
        ...parent,
        children: allCategories.filter((cat) => cat.parent_id === parent.id),
      }));

      return hierarchy;
    } catch (error) {
      console.error("Error in getCategoryHierarchy:", error);
      throw error;
    }
  }

  // Admin functions
  static async createCategory(
    category: Omit<Category, "id" | "created_at" | "updated_at">,
  ): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error("Error creating category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createCategory:", error);
      throw error;
    }
  }

  static async updateCategory(
    id: string,
    updates: Partial<Category>,
  ): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateCategory:", error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      throw error;
    }
  }

  // Toggle category active status
  static async toggleCategoryStatus(id: string): Promise<Category> {
    try {
      // First get current status
      const { data: current, error: fetchError } = await supabase
        .from("categories")
        .select("is_active")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching category status:", fetchError);
        throw fetchError;
      }

      // Toggle the status
      const { data, error } = await supabase
        .from("categories")
        .update({ is_active: !current.is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling category status:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in toggleCategoryStatus:", error);
      throw error;
    }
  }
}
