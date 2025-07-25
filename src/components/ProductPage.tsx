import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Camera,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Award,
  Plus,
  Minus,
  Check,
  Info,
  Ruler,
  Palette,
  Settings,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { FrameTemplate } from "../types";
import { FrameService } from "../services/frameService";
import { FrameMaterial, FrameSize, FrameColor } from "../lib/supabase";

export default function ProductPage() {
  const { state, dispatch } = useApp();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");
  const [materials, setMaterials] = useState<FrameMaterial[]>([]);
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const product = state.selectedProduct as FrameTemplate;

  useEffect(() => {
    loadFrameData();
  }, []);

  const loadFrameData = async () => {
    try {
      const [materialsData, sizesData] = await Promise.all([
        FrameService.getFrameMaterials(),
        FrameService.getFrameSizes(),
      ]);

      setMaterials(materialsData);
      setSizes(sizesData);

      // Set default selections if not already set
      if (materialsData.length > 0 && !state.productSelections.material) {
        const defaultMaterial = materialsData[0];
        const defaultColor = defaultMaterial.colors?.[0];
        if (defaultColor) {
          dispatch({
            type: "UPDATE_PRODUCT_SELECTIONS",
            payload: {
              material: defaultMaterial,
              color: defaultColor,
            },
          });
        }
      }

      if (sizesData.length > 0 && !state.productSelections.size) {
        const defaultSize = sizesData.find((s) => s.is_popular) || sizesData[0];
        dispatch({
          type: "UPDATE_PRODUCT_SELECTIONS",
          payload: { size: defaultSize },
        });
      }
    } catch (error) {
      console.error("Error loading frame data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Product not found
          </h2>
          <button
            onClick={() => dispatch({ type: "SET_STEP", payload: "home" })}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const goBack = () => {
    dispatch({ type: "SET_STEP", payload: "home" });
  };

  const startCustomizing = () => {
    // Ensure we have selections before proceeding
    if (
      state.productSelections.size &&
      state.productSelections.material &&
      state.productSelections.color
    ) {
      dispatch({ type: "SET_STEP", payload: "upload" });
    } else {
      alert("Please select size, material, and color before customizing.");
    }
  };

  const updateSelection = (type: "size" | "material" | "color", value: any) => {
    if (type === "material") {
      // When material changes, also update color to the first available color
      const defaultColor = value.colors?.[0];
      dispatch({
        type: "UPDATE_PRODUCT_SELECTIONS",
        payload: {
          material: value,
          color: defaultColor,
        },
      });
    } else {
      dispatch({
        type: "UPDATE_PRODUCT_SELECTIONS",
        payload: { [type]: value },
      });
    }
  };

  const addToWishlist = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would save to user's wishlist
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this beautiful frame: ${product.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  // Mock additional product images
  const productImages = [
    product.image,
    "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg",
    "https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg",
    "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg",
  ];

  const productFeatures = product.features || [
    "Premium quality materials",
    "UV-resistant glass protection",
    "Easy wall mounting system",
    "Lifetime craftsmanship guarantee",
    "Custom sizing available",
    "Professional photo printing",
  ];

  const specifications = product.specifications || {
    Material: "Premium Oak Wood",
    "Glass Type": "UV-Resistant Acrylic",
    Mounting: "Wall Mount Ready",
    Orientation: "Portrait & Landscape",
    Customization: "Size, Color, Border",
    Shipping: "2-3 Business Days",
  };

  const relatedProducts = [
    {
      id: "related-1",
      title: "Similar Classic Frame",
      image:
        "https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg",
      price: 59.99,
      rating: 4.8,
    },
    {
      id: "related-2",
      title: "Matching Set Frame",
      image:
        "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg",
      price: 79.99,
      rating: 4.9,
    },
    {
      id: "related-3",
      title: "Premium Alternative",
      image:
        "https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg",
      price: 89.99,
      rating: 4.7,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <nav className="text-sm text-gray-600">
              <span
                className="hover:text-gray-900 cursor-pointer"
                onClick={goBack}
              >
                Home
              </span>
              <span className="mx-2">/</span>
              <span
                className="hover:text-gray-900 cursor-pointer"
                onClick={goBack}
              >
                Photo Frames
              </span>
              <span className="mx-2">/</span>
              <span
                className="hover:text-gray-900 cursor-pointer"
                onClick={goBack}
              >
                {product.category}
              </span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{product.title}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.title}
                className={`w-full h-96 lg:h-[500px] object-cover rounded-xl shadow-lg cursor-zoom-in transition-transform duration-300 ${
                  isImageZoomed ? "scale-110" : "hover:scale-105"
                }`}
                onClick={() => setIsImageZoomed(!isImageZoomed)}
              />
              {product.discount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discount}% OFF
                </div>
              )}
              {product.isPopular && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Popular Choice
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? "border-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {product.category}
                </span>
                {product.isPopular && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                    Bestseller
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                {product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">
                      ₹{product.salePrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                      Save ₹
                      {(product.originalPrice - product.salePrice).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Frame Customization Options */}
            {!loading && (
              <div className="space-y-6">
                {/* Frame Size Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Frame Size</h3>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {sizes.slice(0, 8).map((size) => (
                      <button
                        key={size.id}
                        onClick={() => updateSelection("size", size)}
                        className={`
                          p-3 rounded-lg border-2 text-center transition-all duration-200 text-sm
                          ${
                            state.productSelections.size?.id === size.id
                              ? "border-blue-500 bg-blue-50 text-blue-900"
                              : "border-gray-200 hover:border-gray-300"
                          }
                          ${size.is_popular ? "ring-1 ring-amber-400 ring-opacity-50" : ""}
                        `}
                      >
                        <div className="font-medium">{size.display_name}</div>
                        {size.is_popular && (
                          <div className="text-xs text-amber-600 font-medium mt-1">
                            Popular
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Material Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Material</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {materials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => updateSelection("material", material)}
                        className={`
                          p-3 rounded-lg border-2 text-left transition-all duration-200
                          ${
                            state.productSelections.material?.id === material.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {material.photo_url ? (
                            <img
                              src={material.photo_url}
                              alt={material.name}
                              className="w-10 h-10 object-cover rounded border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                              <Settings size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {material.name}
                            </div>
                            <div className="text-xs text-gray-600 capitalize">
                              {material.category} Frame
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Color Selection */}
                {state.productSelections.material?.colors && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Palette size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Color</h3>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {state.productSelections.material.colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => updateSelection("color", color)}
                          className={`
                            group relative p-2 rounded-lg border-2 transition-all duration-200
                            ${
                              state.productSelections.color?.id === color.id
                                ? "border-blue-500 shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div
                            className="w-full h-8 rounded-md mb-1 shadow-sm"
                            style={{ backgroundColor: color.hex_code }}
                          />
                          <div className="text-xs font-medium text-gray-900 text-center">
                            {color.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Features */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {productFeatures.slice(0, 4).map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <Check size={16} className="text-green-600 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startCustomizing}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  Customize Frame
                </button>
                <button
                  onClick={addToWishlist}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    isFavorite
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-300 hover:border-gray-400 text-gray-600"
                  }`}
                >
                  <Heart
                    size={20}
                    className={isFavorite ? "fill-current" : ""}
                  />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-600 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
              {[
                {
                  icon: <Truck size={20} className="text-blue-600" />,
                  text: "Free Shipping",
                },
                {
                  icon: <Shield size={20} className="text-green-600" />,
                  text: "Secure Payment",
                },
                {
                  icon: <RefreshCw size={20} className="text-purple-600" />,
                  text: "Easy Returns",
                },
                {
                  icon: <Award size={20} className="text-orange-600" />,
                  text: "Quality Guarantee",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "reviews", label: `Reviews (${product.reviews})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {product.description ||
                    `Transform your precious memories with our ${product.title}. Crafted with premium materials and attention to detail, this frame is perfect for showcasing your most cherished photographs. Whether it's for your home, office, or as a thoughtful gift, this frame combines elegance with durability.`}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Features & Benefits
                </h3>
                <ul className="space-y-2">
                  {productFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <Check
                        size={16}
                        className="text-green-600 flex-shrink-0 mt-0.5"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-3 border-b border-gray-200"
                  >
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customer Reviews
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} out of 5
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Based on {product.reviews} reviews
                  </p>
                </div>

                {/* Sample Reviews */}
                {[
                  {
                    name: "Sarah Johnson",
                    rating: 5,
                    date: "2 weeks ago",
                    comment:
                      "Absolutely beautiful frame! The quality exceeded my expectations and it looks perfect in our living room.",
                  },
                  {
                    name: "Mike Chen",
                    rating: 5,
                    date: "1 month ago",
                    comment:
                      "Great craftsmanship and fast shipping. The customization options made it perfect for our wedding photos.",
                  },
                  {
                    name: "Emily Davis",
                    rating: 4,
                    date: "2 months ago",
                    comment:
                      "Very happy with the purchase. The frame is sturdy and the finish is exactly what I wanted.",
                  },
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {review.name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={`${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 ml-13">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {relatedProduct.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${i < Math.floor(relatedProduct.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({relatedProduct.rating})
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{relatedProduct.price}
                    </span>
                  </div>
                  <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
