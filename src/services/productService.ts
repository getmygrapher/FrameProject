import { supabase } from "../lib/supabase";
import type {
  Product,
  Category,
  Tag,
  Review,
  ProductVariant,
} from "../lib/supabase";

export interface ProductFilters {
  category?: string;
  material_type?: string;
  price_min?: number;
  price_max?: number;
  orientation?: string;
  is_featured?: boolean;
  is_popular?: boolean;
  search?: string;
  tags?: string[];
}

export interface ProductSortOptions {
  field: "created_at" | "b2c_price" | "name" | "popularity";
  direction: "asc" | "desc";
}

export class ProductService {
  // Get all products with filtering, sorting, and pagination
  static async getProducts({
    filters = {},
    sort = { field: "created_at", direction: "desc" },
    page = 1,
    limit = 12,
    userRole = "b2c_customer",
  }: {
    filters?: ProductFilters;
    sort?: ProductSortOptions;
    page?: number;
    limit?: number;
    userRole?: string;
  } = {}) {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          tags:product_tags(tag:tags(*))
        `,
        )
        .eq("is_active", true);

      // Apply filters
      if (filters.category) {
        query = query.eq("category.slug", filters.category);
      }

      if (filters.material_type) {
        query = query.eq("material_type", filters.material_type);
      }

      if (filters.orientation) {
        query = query.in("orientation", [filters.orientation, "any"]);
      }

      if (filters.is_featured !== undefined) {
        query = query.eq("is_featured", filters.is_featured);
      }

      if (filters.is_popular !== undefined) {
        query = query.eq("is_popular", filters.is_popular);
      }

      if (filters.price_min !== undefined) {
        query = query.gte("b2c_price", filters.price_min);
      }

      if (filters.price_max !== undefined) {
        query = query.lte("b2c_price", filters.price_max);
      }

      // Full-text search
      if (filters.search) {
        query = query.textSearch("name", filters.search, {
          type: "websearch",
          config: "english",
        });
      }

      // Apply sorting
      if (sort.field === "popularity") {
        query = query
          .order("is_popular", { ascending: false })
          .order("is_featured", { ascending: false });
      } else {
        query = query.order(sort.field, {
          ascending: sort.direction === "asc",
        });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      // Process products to show appropriate pricing based on user role
      const processedProducts =
        data?.map((product) => ({
          ...product,
          price:
            userRole === "b2b_partner" && product.b2b_price
              ? product.b2b_price
              : product.b2c_price,
          originalPrice: product.b2c_price,
          b2bPrice: product.b2b_price,
          images:
            product.images?.sort((a, b) => a.sort_order - b.sort_order) || [],
          primaryImage:
            product.images?.find((img) => img.is_primary) ||
            product.images?.[0],
          tags: product.tags?.map((pt) => pt.tag).filter(Boolean) || [],
        })) || [];

      return {
        products: processedProducts,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("Error in getProducts:", error);
      throw error;
    }
  }

  // Get single product by slug
  static async getProductBySlug(
    slug: string,
    userRole: string = "b2c_customer",
  ): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          tags:product_tags(tag:tags(*)),
          reviews:reviews(*, user:users(full_name))
        `,
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        return null;
      }

      if (!data) return null;

      // Process product data
      const processedProduct = {
        ...data,
        price:
          userRole === "b2b_partner" && data.b2b_price
            ? data.b2b_price
            : data.b2c_price,
        originalPrice: data.b2c_price,
        b2bPrice: data.b2b_price,
        images: data.images?.sort((a, b) => a.sort_order - b.sort_order) || [],
        primaryImage:
          data.images?.find((img) => img.is_primary) || data.images?.[0],
        tags: data.tags?.map((pt) => pt.tag).filter(Boolean) || [],
        reviews: data.reviews?.filter((review) => review.is_approved) || [],
        averageRating: this.calculateAverageRating(data.reviews || []),
        totalReviews:
          data.reviews?.filter((review) => review.is_approved).length || 0,
      };

      return processedProduct;
    } catch (error) {
      console.error("Error in getProductBySlug:", error);
      throw error;
    }
  }

  // Get featured products
  static async getFeaturedProducts(
    limit: number = 8,
    userRole: string = "b2c_customer",
  ) {
    return this.getProducts({
      filters: { is_featured: true },
      limit,
      userRole,
    });
  }

  // Get popular products
  static async getPopularProducts(
    limit: number = 8,
    userRole: string = "b2c_customer",
  ) {
    return this.getProducts({
      filters: { is_popular: true },
      limit,
      userRole,
    });
  }

  // Get products by category
  static async getProductsByCategory(
    categorySlug: string,
    options: {
      limit?: number;
      userRole?: string;
      sort?: ProductSortOptions;
    } = {},
  ) {
    return this.getProducts({
      filters: { category: categorySlug },
      limit: options.limit,
      userRole: options.userRole,
      sort: options.sort,
    });
  }

  // Search products
  static async searchProducts(
    query: string,
    options: {
      limit?: number;
      userRole?: string;
      filters?: Omit<ProductFilters, "search">;
    } = {},
  ) {
    return this.getProducts({
      filters: { ...options.filters, search: query },
      limit: options.limit,
      userRole: options.userRole,
    });
  }

  // Get all categories
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

  // Get all tags
  static async getTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching tags:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getTags:", error);
      throw error;
    }
  }

  // Get product reviews
  static async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          *,
          user:users(full_name)
        `,
        )
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getProductReviews:", error);
      throw error;
    }
  }

  // Add product to wishlist
  static async addToWishlist(productId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("wishlist")
        .insert({ product_id: productId, user_id: userId });

      if (error) {
        console.error("Error adding to wishlist:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in addToWishlist:", error);
      throw error;
    }
  }

  // Remove product from wishlist
  static async removeFromWishlist(
    productId: string,
    userId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error removing from wishlist:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in removeFromWishlist:", error);
      throw error;
    }
  }

  // Get user's wishlist
  static async getUserWishlist(userId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(
          `
          product:products(
            *,
            category:categories(*),
            images:product_images(*),
            tags:product_tags(tag:tags(*))
          )
        `,
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
      }

      return data?.map((item) => item.product).filter(Boolean) || [];
    } catch (error) {
      console.error("Error in getUserWishlist:", error);
      throw error;
    }
  }

  // Check if product is in user's wishlist
  static async isInWishlist(
    productId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking wishlist:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in isInWishlist:", error);
      return false;
    }
  }

  // Submit product review
  static async submitReview(review: {
    productId: string;
    userId: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: review.productId,
        user_id: review.userId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_verified_purchase: false, // Would be set based on actual purchase history
        is_approved: false, // Requires admin approval
      });

      if (error) {
        console.error("Error submitting review:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in submitReview:", error);
      throw error;
    }
  }

  // Helper function to calculate average rating
  private static calculateAverageRating(reviews: Review[]): number {
    if (!reviews || reviews.length === 0) return 0;

    const approvedReviews = reviews.filter((review) => review.is_approved);
    if (approvedReviews.length === 0) return 0;

    const sum = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / approvedReviews.length) * 10) / 10;
  }

  // Get price range for filtering
  static async getPriceRange(): Promise<{ min: number; max: number }> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("b2c_price")
        .eq("is_active", true)
        .order("b2c_price", { ascending: true });

      if (error) {
        console.error("Error fetching price range:", error);
        return { min: 0, max: 1000 };
      }

      if (!data || data.length === 0) {
        return { min: 0, max: 1000 };
      }

      const prices = data.map((p) => p.b2c_price).filter(Boolean);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };
    } catch (error) {
      console.error("Error in getPriceRange:", error);
      return { min: 0, max: 1000 };
    }
  }

  // Get material types for filtering
  static async getMaterialTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("material_type")
        .eq("is_active", true)
        .not("material_type", "is", null);

      if (error) {
        console.error("Error fetching material types:", error);
        return [];
      }

      const uniqueTypes = [
        ...new Set(data?.map((p) => p.material_type).filter(Boolean)),
      ];
      return uniqueTypes.sort();
    } catch (error) {
      console.error("Error in getMaterialTypes:", error);
      return [];
    }
  }
}
