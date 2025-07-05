import React, { useState } from 'react';
import { Camera, ShoppingCart, Home, ArrowLeft, Search, User, ChevronDown, Menu, X, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const goToHome = () => {
    dispatch({ type: 'SET_STEP', payload: 'home' });
    setIsMobileMenuOpen(false);
  };

  const goToCart = () => {
    dispatch({ type: 'SET_STEP', payload: 'cart' });
    setIsMobileMenuOpen(false);
  };

  const goBack = () => {
    const stepOrder: Array<string> = ['home', 'upload', 'customize', 'cart', 'checkout', 'confirmation'];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex - 1] as any });
    }
  };

  const startFraming = () => {
    dispatch({ type: 'SET_STEP', payload: 'upload' });
    setIsMobileMenuOpen(false);
  };

  const goToAdmin = () => {
    window.open('/admin', '_blank');
  };

  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    'All Categories', 'Anniversary', 'Wedding', 'Birthday', 'Couple Gifts', 
    'New Born', 'Collage', 'Family Gifts', 'Friendship'
  ];

  const mainNavItems = [
    { label: 'Home', action: goToHome },
    { label: 'Anniversary', action: startFraming },
    { label: 'Wedding', action: startFraming },
    { label: 'Birthday', action: startFraming },
    { label: 'Couple Gifts', action: startFraming },
    { label: 'New Born', action: startFraming },
    { label: 'Collage', action: startFraming },
    { label: 'Family Gifts', action: startFraming },
    { label: 'Friendship', action: startFraming },
    { label: 'About Us', action: () => {} },
    { label: 'Contact Us', action: () => {} }
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="text-gray-600">
              Free shipping on orders over ₹75 | Call us: +91-484-FRAMING
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                Track Order
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                Help
              </button>
              <button
                onClick={goToAdmin}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Shield size={14} />
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToHome}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-blue-600 rounded-lg">
                <Camera size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FrameCraft Pro</h1>
                <p className="text-xs text-blue-600 font-medium">Crafting Memories Forever</p>
              </div>
            </button>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative flex w-full">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-gray-100 border-r border-gray-300 px-4 py-3 pr-8 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search for frames, occasions, or gifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* User Account - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <User size={20} className="text-gray-600" />
              <div className="text-sm">
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </button>
                <span className="text-gray-400 mx-1">|</span>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Register
                </button>
              </div>
            </div>

            {/* Back Button - Show when not on home page */}
            {state.currentStep !== 'home' && state.currentStep !== 'confirmation' && (
              <button
                onClick={goBack}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {/* Home Button - Show when not on home page */}
            {state.currentStep !== 'home' && (
              <button
                onClick={goToHome}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={goToCart}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Primary Navigation */}
      <nav className="hidden md:block bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 h-12 overflow-x-auto">
            {mainNavItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search frames..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {mainNavItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile User Actions */}
              <div className="border-t p-4 space-y-2">
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg">
                  Login / Register
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg">
                  Track Order
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg">
                  Help & Support
                </button>
                <button
                  onClick={goToAdmin}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg flex items-center gap-2"
                >
                  <Shield size={16} />
                  Admin Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}