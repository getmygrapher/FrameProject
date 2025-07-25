import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Star,
  Grid,
  List,
  Filter,
  Search,
  ShoppingCart,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  ProductService,
  type ProductFilters,
  type ProductSortOptions,
} from "../services/productService";
import { CategoryService } from "../services/categoryService";
import type { Product, Category } from "../lib/supabase";

interface WishlistState {
  [productId: string]: boolean;
}

interface ProductCatalogProps {
  category?: string;
}

export default function ProductCatalog({
  category = "All",
}: ProductCatalogProps) {
  const { dispatch } = useApp();
  const { user, canViewB2BPricing } = useAuth();

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and display state
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortBy, setSortBy] = useState<ProductSortOptions>({
    field: "created_at",
    direction: "desc",
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<WishlistState>({});
  const [wishlistLoading, setWishlistLoading] = useState<Set<string>>(
    new Set(),
  );

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [
    selectedCategory,
    searchQuery,
    filters,
    sortBy,
    currentPage,
    itemsPerPage,
  ]);

  // Load user's wishlist
  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      const categoriesData = await CategoryService.getCategories();
      setCategories([
        { id: "all", name: "All Categories", slug: "all" } as Category,
        ...categoriesData,
      ]);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("Failed to load categories");
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const productFilters: ProductFilters = {
        ...filters,
        search: searchQuery || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
      };

      const userRole = user?.role || "b2c_customer";
      const result = await ProductService.getProducts({
        filters: productFilters,
        sort: sortBy,
        page: currentPage,
        limit: itemsPerPage,
        userRole,
      });

      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotalProducts(result.total);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user) return;

    try {
      const wishlistProducts = await ProductService.getUserWishlist(user.id);
      const wishlistState: WishlistState = {};
      wishlistProducts.forEach((product) => {
        wishlistState[product.id] = true;
      });
      setWishlist(wishlistState);
    } catch (err) {
      console.error("Error loading wishlist:", err);
    }
  };

  const goBack = () => {
    dispatch({ type: "SET_STEP", payload: "home" });
  };

  const startCustomizing = (product: Product) => {
    dispatch({ type: "SET_SELECTED_PRODUCT", payload: product });
    dispatch({ type: "SET_STEP", payload: "upload" });
  };

  const viewProduct = (product: Product) => {
    dispatch({ type: "SET_SELECTED_PRODUCT", payload: product });
    dispatch({ type: "SET_STEP", payload: "product" });
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    if (wishlistLoading.has(productId)) return;

    try {
      setWishlistLoading((prev) => new Set([...prev, productId]));

      const isInWishlist = wishlist[productId];

      if (isInWishlist) {
        await ProductService.removeFromWishlist(productId, user.id);
        setWishlist((prev) => ({ ...prev, [productId]: false }));
      } else {
        await ProductService.addToWishlist(productId, user.id);
        setWishlist((prev) => ({ ...prev, [productId]: true }));
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    } finally {
      setWishlistLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProducts();
  };

  const handleSortChange = (value: string) => {
    let newSort: ProductSortOptions;
    switch (value) {
      case "price-low":
        newSort = { field: "b2c_price", direction: "asc" };
        break;
      case "price-high":
        newSort = { field: "b2c_price", direction: "desc" };
        break;
      case "name":
        newSort = { field: "name", direction: "asc" };
        break;
      case "popular":
        newSort = { field: "popularity", direction: "desc" };
        break;
      default:
        newSort = { field: "created_at", direction: "desc" };
    }
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <nav className="text-sm text-gray-600">
                <span>Home</span>
                <span className="mx-2">/</span>
                <span>Photo Frames</span>
                {selectedCategory !== "All" && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">
                      {selectedCategory}
                    </span>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug === "all" ? "All" : cat.slug);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  (selectedCategory === "All" && cat.slug === "all") ||
                  selectedCategory === cat.slug
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {products.length} of {totalProducts} products
              </span>

              <span className="text-sm text-gray-600">
                Show:
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={36}>36</option>
                  <option value={48}>48</option>
                </select>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded ${showFilters ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                >
                  <SlidersHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search frames..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at-desc">Newest first</option>
                <option value="popular">Sort by popularity</option>
                <option value="name-asc">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={48} className="animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">
              Loading products...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {products.map((product) => {
              const primaryImage = product.primaryImage || product.images?.[0];
              const hasDiscount = product.originalPrice > product.price;
              const discountPercent = hasDiscount
                ? calculateDiscount(product.originalPrice, product.price)
                : 0;
              const isInWishlist = wishlist[product.id];
              const isWishlistLoading = wishlistLoading.has(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={
                        primaryImage?.image_url ||
                        product.frame_preview_url ||
                        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80"
                      }
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => viewProduct(product)}
                    />

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{discountPercent}%
                      </div>
                    )}

                    {/* Popular/Featured Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      {product.is_popular && (
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Popular
                        </div>
                      )}
                      {product.is_featured && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    {user && (
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        disabled={isWishlistLoading}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:shadow-lg"
                      >
                        {isWishlistLoading ? (
                          <Loader2
                            size={14}
                            className="animate-spin text-gray-600"
                          />
                        ) : (
                          <Heart
                            size={16}
                            className={`${isInWishlist ? "text-red-500 fill-current" : "text-gray-600"}`}
                          />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => viewProduct(product)}
                    >
                      {product.name}
                    </h3>

                    {/* Category and Material */}
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                      {product.category && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {product.category.name}
                        </span>
                      )}
                      {product.material_type && (
                        <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                          {product.material_type}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {product.averageRating > 0 && (
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          {product.averageRating.toFixed(1)} (
                          {product.totalReviews})
                        </span>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        {canViewB2BPricing() && product.b2bPrice && (
                          <span className="text-xs text-blue-600 font-medium">
                            B2B: {formatPrice(product.b2bPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => startCustomizing(product)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilters({});
                setSelectedCategory("All");
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
