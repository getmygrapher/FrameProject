import React, { useState } from 'react';
import { ArrowLeft, Heart, Star, Grid, List, Filter, Search, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FrameTemplate {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  originalPrice: number;
  salePrice?: number;
  discount?: number;
  image: string;
  isPopular?: boolean;
  isFavorite?: boolean;
}

const frameTemplates: FrameTemplate[] = [
  // Anniversary Templates
  {
    id: 'ann-1',
    title: 'Anniversary Frame | Perfect Couple Gifts for Anniversary',
    category: 'Anniversary',
    rating: 4.4,
    reviews: 156,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 23,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg',
    isPopular: true
  },
  {
    id: 'ann-2',
    title: 'Best Moments Personalized Photo Frame | Customized Gift Photo Frame',
    category: 'Anniversary',
    rating: 4.4,
    reviews: 89,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 23,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'ann-3',
    title: 'Black & White Personalized Photo Frames | Customized Gift Photo Frame',
    category: 'Anniversary',
    rating: 4.5,
    reviews: 234,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 23,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },
  {
    id: 'ann-4',
    title: 'Blurred Personalized Photo Frames - Customised Gift Photo Frame',
    category: 'Anniversary',
    rating: 4.4,
    reviews: 67,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 23,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'ann-5',
    title: 'Couples Personalized Photo Frames - Customised Gift Photo Frame',
    category: 'Anniversary',
    rating: 4.5,
    reviews: 145,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 23,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },
  {
    id: 'ann-6',
    title: 'Special Moments Collage Frame - Anniversary Edition',
    category: 'Anniversary',
    rating: 4.6,
    reviews: 98,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 23,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },

  // Wedding Templates
  {
    id: 'wed-1',
    title: 'Wedding Memories Collage Frame | Perfect Wedding Gift',
    category: 'Wedding',
    rating: 4.8,
    reviews: 234,
    originalPrice: 1299.00,
    salePrice: 899.00,
    discount: 31,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg',
    isPopular: true
  },
  {
    id: 'wed-2',
    title: 'Elegant Wedding Photo Frame | Customized Couple Frame',
    category: 'Wedding',
    rating: 4.7,
    reviews: 189,
    originalPrice: 1199.00,
    salePrice: 799.00,
    discount: 33,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'wed-3',
    title: 'Classic Wedding Frame Set | Premium Quality',
    category: 'Wedding',
    rating: 4.9,
    reviews: 156,
    originalPrice: 1499.00,
    salePrice: 999.00,
    discount: 33,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },

  // Birthday Templates
  {
    id: 'birth-1',
    title: 'Cherished Moments Birthday Gift - Personalized Photo Collage',
    category: 'Birthday',
    rating: 4.7,
    reviews: 123,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 23,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'birth-2',
    title: 'Happy Birthday Memory Frame | Custom Photo Gift',
    category: 'Birthday',
    rating: 4.6,
    reviews: 87,
    originalPrice: 899.00,
    salePrice: 599.00,
    discount: 33,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },

  // Couple Gifts
  {
    id: 'couple-1',
    title: 'Romantic Couple Photo Frame | Love Story Collection',
    category: 'Couple Gifts',
    rating: 4.5,
    reviews: 167,
    originalPrice: 1099.00,
    salePrice: 749.00,
    discount: 32,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'couple-2',
    title: 'Together Forever Frame Set | Couple Anniversary Gift',
    category: 'Couple Gifts',
    rating: 4.8,
    reviews: 203,
    originalPrice: 1299.00,
    salePrice: 899.00,
    discount: 31,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },

  // New Born
  {
    id: 'newborn-1',
    title: 'Baby\'s First Moments Frame | New Born Gift',
    category: 'New Born',
    rating: 4.9,
    reviews: 145,
    originalPrice: 799.00,
    salePrice: 549.00,
    discount: 31,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'newborn-2',
    title: 'Welcome Baby Photo Frame | Personalized Nursery Decor',
    category: 'New Born',
    rating: 4.7,
    reviews: 98,
    originalPrice: 899.00,
    salePrice: 599.00,
    discount: 33,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },

  // Family Gifts
  {
    id: 'family-1',
    title: 'Family Tree Photo Frame | Multi-Photo Display',
    category: 'Family Gifts',
    rating: 4.6,
    reviews: 234,
    originalPrice: 1199.00,
    salePrice: 799.00,
    discount: 33,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'family-2',
    title: 'Family Memories Collage | Custom Family Frame',
    category: 'Family Gifts',
    rating: 4.8,
    reviews: 167,
    originalPrice: 1399.00,
    salePrice: 949.00,
    discount: 32,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },

  // Friendship
  {
    id: 'friend-1',
    title: 'Best Friends Forever Frame | Friendship Gift',
    category: 'Friendship',
    rating: 4.5,
    reviews: 89,
    originalPrice: 899.00,
    salePrice: 599.00,
    discount: 33,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'friend-2',
    title: 'Squad Goals Photo Frame | Group Photo Display',
    category: 'Friendship',
    rating: 4.7,
    reviews: 123,
    originalPrice: 999.00,
    salePrice: 699.00,
    discount: 30,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  },

  // Collage
  {
    id: 'collage-1',
    title: 'Multi-Photo Collage Frame | 6 Photos Display',
    category: 'Collage',
    rating: 4.8,
    reviews: 178,
    originalPrice: 1299.00,
    salePrice: 899.00,
    discount: 31,
    image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg'
  },
  {
    id: 'collage-2',
    title: 'Creative Collage Frame | Custom Layout Design',
    category: 'Collage',
    rating: 4.6,
    reviews: 145,
    originalPrice: 1199.00,
    salePrice: 799.00,
    discount: 33,
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg'
  }
];

interface ProductCatalogProps {
  category?: string;
}

export default function ProductCatalog({ category = 'All' }: ProductCatalogProps) {
  const { dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = ['All', 'Anniversary', 'Wedding', 'Birthday', 'Couple Gifts', 'New Born', 'Collage', 'Family Gifts', 'Friendship'];

  const filteredProducts = frameTemplates.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.salePrice || a.originalPrice) - (b.salePrice || b.originalPrice);
      case 'price-high':
        return (b.salePrice || b.originalPrice) - (a.salePrice || a.originalPrice);
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      default:
        return 0;
    }
  });

  const displayedProducts = sortedProducts.slice(0, itemsPerPage);

  const goBack = () => {
    dispatch({ type: 'SET_STEP', payload: 'home' });
  };

  const startCustomizing = (template: FrameTemplate) => {
    // In a real app, you might set the template as a starting point
    dispatch({ type: 'SET_STEP', payload: 'upload' });
  };

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
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
                {selectedCategory !== 'All' && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{selectedCategory}</span>
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
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Show: 
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                </select>
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search frames..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">Default sorting</option>
                <option value="popular">Sort by popularity</option>
                <option value="rating">Sort by rating</option>
                <option value="price-low">Sort by price: low to high</option>
                <option value="price-high">Sort by price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {displayedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{product.discount}%
                  </div>
                )}
                
                {/* Popular Badge */}
                {product.isPopular && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Popular
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <Heart 
                    size={16} 
                    className={`${favorites.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                  />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviews})
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600">₹{product.salePrice.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">₹{product.originalPrice.toFixed(2)}</span>
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
          ))}
        </div>

        {/* Load More / View All */}
        {filteredProducts.length > displayedProducts.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setItemsPerPage(prev => prev + 9)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View More Products
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}