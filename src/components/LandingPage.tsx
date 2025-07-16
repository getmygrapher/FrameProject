import React, { useState, useEffect } from 'react';
import { 
  Camera, Star, Shield, Truck, Award, ArrowRight, Play, Check, Upload, Settings, 
  ShoppingCart, RefreshCw, Lock, Heart, Baby, Users, Gift, Calendar, 
  HelpCircle, Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin,
  CreditCard, Smartphone, Clock, Zap, Search, User, ChevronDown, Menu, X, Home, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import ProductCatalog from './ProductCatalog';
import UserLogin from './auth/UserLogin';
import UserRegister from './auth/UserRegister';
import UserProfile from './auth/UserProfile';

export default function LandingPage() {
  const { dispatch } = useApp();
  const { user, isAuthenticated, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProductCatalog, setShowProductCatalog] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState('All');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startFraming = () => {
    dispatch({ type: 'SET_STEP', payload: 'upload' });
  };

  const showCategoryProducts = (category: string) => {
    setSelectedProductCategory(category);
    setShowProductCatalog(true);
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToAdmin = () => {
    window.open('/admin', '_blank');
  };

  const handleLoginSuccess = (user: any) => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (user: any) => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfile(false);
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError('Logout failed. Please try again.');
    }
  };

  const categories = [
    'All Categories', 'Anniversary', 'Wedding', 'Birthday', 'Couple Gifts', 
    'New Born', 'Collage', 'Family Gifts', 'Friendship'
  ];

  const mainNavItems = [
    { label: 'Home', action: () => { setShowProductCatalog(false); scrollToSection('hero'); } },
    { label: 'Anniversary', action: () => showCategoryProducts('Anniversary') },
    { label: 'Wedding', action: () => showCategoryProducts('Wedding') },
    { label: 'Birthday', action: () => showCategoryProducts('Birthday') },
    { label: 'Couple Gifts', action: () => showCategoryProducts('Couple Gifts') },
    { label: 'New Born', action: () => showCategoryProducts('New Born') },
    { label: 'Collage', action: () => showCategoryProducts('Collage') },
    { label: 'Family Gifts', action: () => showCategoryProducts('Family Gifts') },
    { label: 'Friendship', action: () => showCategoryProducts('Friendship') },
    { label: 'About Us', action: () => { setShowProductCatalog(false); scrollToSection('about'); } },
    { label: 'Contact Us', action: () => { setShowProductCatalog(false); scrollToSection('contact'); } }
  ];

  // If showing product catalog, render it instead of landing page
  if (showProductCatalog) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation Header */}
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
                  onClick={() => setShowProductCatalog(false)}
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
                  {isAuthenticated && user ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowProfile(true)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User size={20} />
                        )}
                        <span className="text-sm font-medium">
                          {user.user_metadata?.full_name || user.email}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User size={20} className="text-gray-600" />
                      <div className="text-sm">
                        <button
                          onClick={() => setShowLogin(true)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Login
                        </button>
                        <span className="text-gray-400 mx-1">|</span>
                        <button
                          onClick={() => setShowRegister(true)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Start Framing Button */}
                <button
                  onClick={startFraming}
                  className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Camera size={16} />
                  Start Framing
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
        </header>

        <ProductCatalog category={selectedProductCategory} />

        {/* Auth Modals */}
        {showLogin && (
          <UserLogin
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {showRegister && (
          <UserRegister
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {showProfile && user && (
          <UserProfile
            user={user}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Logout Error Banner */}
      {logoutError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-xl mx-auto" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Logout Error</h3>
              <p className="text-sm text-red-800">{logoutError}</p>
            </div>
          </div>
        </div>
      )}
      {/* Navigation Header */}
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
                onClick={() => scrollToSection('hero')}
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
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowProfile(true)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={20} />
                      )}
                      <span className="text-sm font-medium">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User size={20} className="text-gray-600" />
                    <div className="text-sm">
                      <button
                        onClick={() => setShowLogin(true)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Login
                      </button>
                      <span className="text-gray-400 mx-1">|</span>
                      <button
                        onClick={() => setShowRegister(true)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Start Framing Button */}
              <button
                onClick={startFraming}
                className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Camera size={16} />
                Start Framing
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
                  <button
                    onClick={() => {
                      startFraming();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-medium"
                  >
                    🎨 Start Framing
                  </button>
                  
                  {mainNavItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Mobile User Actions */}
                <div className="border-t p-4 space-y-2">
                  {isAuthenticated && user ? (
                    <>
                      <button
                        onClick={() => {
                          setShowProfile(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg flex items-center gap-2"
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowLogin(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setShowRegister(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        Register
                      </button>
                    </>
                  )}
                  <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg">
                    Track Order
                  </button>
                  <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg">
                    Help & Support
                  </button>
                  <button
                    onClick={() => {
                      goToAdmin();
                      setIsMobileMenuOpen(false);
                    }}
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

      {/* Hero Section */}
      <section id="hero" className="relative bg-gradient-to-br from-blue-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Heart size={16} className="mr-2" />
                  Trusted by 100,000+ Families
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  A Lifetime of
                  <span className="text-blue-600 block">Love in Every Frame</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your precious memories into stunning personalized photo frames. 
                  From weddings to birthdays, capture every special moment with our premium custom frames.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={startFraming}
                  className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  Order Now
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
                >
                  <Play size={20} className="mr-2" />
                  See How It Works
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white"></div>
                    ))}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">50,000+ Happy Customers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg"
                  alt="Happy family with framed photos"
                  className="w-full rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Premium Quality</p>
                      <p className="text-sm text-gray-600">Lifetime Guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { icon: <Shield size={32} className="text-blue-600" />, title: "Secure Transit", desc: "Safe & Protected" },
              { icon: <Lock size={32} className="text-green-600" />, title: "Data Protected", desc: "100% Secure" },
              { icon: <RefreshCw size={32} className="text-purple-600" />, title: "Easy Replace", desc: "Hassle-Free Returns" },
              { icon: <Truck size={32} className="text-orange-600" />, title: "Free Delivery", desc: "On Orders ₹75+" },
              { icon: <CreditCard size={32} className="text-blue-600" />, title: "Secure Payment", desc: "Multiple Options" }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Occasion</h2>
            <p className="text-lg text-gray-600">Perfect frames for every special moment</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { icon: <Heart size={32} className="text-white" />, title: "Wedding", bg: "bg-blue-500", category: "Wedding" },
              { icon: <Baby size={32} className="text-white" />, title: "New Born", bg: "bg-indigo-500", category: "New Born" },
              { icon: <Users size={32} className="text-white" />, title: "Friendship", bg: "bg-cyan-500", category: "Friendship" },
              { icon: <Gift size={32} className="text-white" />, title: "For Him", bg: "bg-teal-500", category: "Couple Gifts" },
              { icon: <Heart size={32} className="text-white" />, title: "For Her", bg: "bg-purple-500", category: "Couple Gifts" },
              { icon: <Users size={32} className="text-white" />, title: "Couple Gifts", bg: "bg-blue-600", category: "Couple Gifts" },
              { icon: <Calendar size={32} className="text-white" />, title: "Birthday", bg: "bg-indigo-600", category: "Birthday" },
              { icon: <Award size={32} className="text-white" />, title: "Anniversary", bg: "bg-gray-500", category: "Anniversary" }
            ].map((category, index) => (
              <button
                key={index}
                onClick={() => showCategoryProducts(category.category)}
                className="group text-center hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className={`w-20 h-20 ${category.bg} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg`}>
                  {category.icon}
                </div>
                <h3 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{category.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Best Sellers */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
              <button 
                onClick={() => showCategoryProducts('All')}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  image: "https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg",
                  title: "Classic Wedding Frame",
                  rating: 4.9,
                  reviews: 234,
                  originalPrice: 89.99,
                  salePrice: 64.99,
                  sale: true,
                  category: "Wedding"
                },
                {
                  image: "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg",
                  title: "Family Portrait Frame",
                  rating: 4.8,
                  reviews: 189,
                  originalPrice: 79.99,
                  salePrice: null,
                  sale: false,
                  category: "Family Gifts"
                },
                {
                  image: "https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg",
                  title: "Baby's First Frame",
                  rating: 5.0,
                  reviews: 156,
                  originalPrice: 59.99,
                  salePrice: 44.99,
                  sale: true,
                  category: "New Born"
                },
                {
                  image: "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg",
                  title: "Anniversary Collage",
                  rating: 4.7,
                  reviews: 98,
                  originalPrice: 99.99,
                  salePrice: null,
                  sale: false,
                  category: "Anniversary"
                }
              ].map((product, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.sale && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        SALE
                      </div>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={16} className="text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.salePrice ? (
                          <>
                            <span className="text-lg font-bold text-blue-600">₹{product.salePrice}</span>
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => showCategoryProducts(product.category)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
              <button 
                onClick={() => showCategoryProducts('All')}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="relative">
                    <img
                      src={`https://images.pexels.com/photos/${1762851 + index}/pexels-photo-${1762851 + index}.jpeg`}
                      alt={`New arrival ${index + 1}`}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      NEW
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">Premium Frame #{index + 1}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">₹{(29.99 + index * 10).toFixed(2)}</span>
                      <button 
                        onClick={() => showCategoryProducts('All')}
                        className="text-blue-600 text-xs hover:text-blue-700 transition-colors"
                      >
                        Try →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                <Clock size={16} className="mr-2" />
                Limited Time Offer
              </div>
              <h2 className="text-4xl font-bold">Buy 3 Get 1 Free</h2>
              <p className="text-xl text-blue-100">
                Mix and match any frames from our collection. Perfect for creating a gallery wall!
              </p>
              
              {/* Countdown Timer */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="bg-white text-blue-600 rounded-lg p-3 font-bold text-2xl min-w-[60px]">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-blue-100 mt-1">Hours</div>
                </div>
                <div className="text-white text-2xl">:</div>
                <div className="text-center">
                  <div className="bg-white text-blue-600 rounded-lg p-3 font-bold text-2xl min-w-[60px]">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-blue-100 mt-1">Minutes</div>
                </div>
                <div className="text-white text-2xl">:</div>
                <div className="text-center">
                  <div className="bg-white text-blue-600 rounded-lg p-3 font-bold text-2xl min-w-[60px]">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-blue-100 mt-1">Seconds</div>
                </div>
              </div>

              <button
                onClick={() => showCategoryProducts('All')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                Shop Now
                <ArrowRight size={20} className="ml-2" />
              </button>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg"
                alt="Special offer frames"
                className="w-full rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-lg transform rotate-12">
                FREE!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-lg font-semibold mb-4">
              <Star size={20} className="mr-2 fill-current" />
              Excellent - 4.9/5 on Google Reviews
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">Over 10,000 five-star reviews from happy customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                location: "Mumbai, Maharashtra",
                content: "Absolutely stunning quality! The frame perfectly captured our wedding day memories. The attention to detail is incredible and shipping was super fast.",
                rating: 5,
                image: "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg"
              },
              {
                name: "Rajesh Kumar",
                location: "Bangalore, Karnataka",
                content: "I've ordered multiple frames for our family photos. Each one is crafted with such care and precision. Highly recommend for anyone wanting premium quality.",
                rating: 5,
                image: "https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg"
              },
              {
                name: "Anita Menon",
                location: "Kochi, Kerala",
                content: "The customization options are amazing! I was able to create the perfect frame for my daughter's first birthday photos. Customer service was exceptional too.",
                rating: 5,
                image: "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{review.content}"</p>
                <div className="flex items-center">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={40} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Everything you need to know about our frames</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How long does it take to receive my custom frame?",
                answer: "Most orders are processed within 2-3 business days and shipped via express delivery. You'll receive tracking information once your order ships."
              },
              {
                question: "What materials do you use for your frames?",
                answer: "We use premium materials including solid oak, walnut wood, and high-grade aluminum. All frames come with UV-resistant glass and acid-free matting."
              },
              {
                question: "Can I customize the size of my frame?",
                answer: "Yes! We offer standard sizes from 4x6 to 16x20, plus custom sizing options. Our design tool will help you find the perfect fit for your photo."
              },
              {
                question: "What's your return policy?",
                answer: "We offer a 30-day satisfaction guarantee. If you're not completely happy with your frame, we'll provide a full refund or replacement."
              },
              {
                question: "Do you offer bulk discounts for large orders?",
                answer: "Yes! Contact our customer service team for special pricing on orders of 10 or more frames. Perfect for events, businesses, or gifts."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Integration */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h2>
            <p className="text-lg text-gray-600">See how our customers display their beautiful frames</p>
            <div className="flex justify-center space-x-4 mt-6">
              <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Instagram size={24} />
              </button>
              <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Facebook size={24} />
              </button>
              <button className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors">
                <Twitter size={24} />
              </button>
              <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Youtube size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="relative group cursor-pointer">
                <img
                  src={`https://images.pexels.com/photos/${1762851 + index}/pexels-photo-${1762851 + index}.jpeg`}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <Instagram size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Camera size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">FrameCraft Pro</h3>
                  <p className="text-sm text-blue-400">Crafting Memories Forever</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                We're passionate about helping you preserve and display your most precious memories. 
                With premium materials and expert craftsmanship, every frame tells your unique story.
              </p>
              <div className="flex space-x-4">
                <Instagram size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Facebook size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Youtube size={20} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['About Us', 'How It Works', 'Size Guide', 'Material Guide', 'Custom Orders', 'Bulk Orders'].map((link) => (
                  <li key={link}>
                    <button className="text-gray-300 hover:text-white transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                {['Contact Us', 'Track Your Order', 'Returns & Exchanges', 'Shipping Info', 'FAQ', 'Size Calculator'].map((link) => (
                  <li key={link}>
                    <button className="text-gray-300 hover:text-white transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
              <p className="text-gray-300 mb-4">Get exclusive offers and framing tips</p>
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                    <Mail size={20} />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Phone size={16} className="mr-2" />
                    +91-484-FRAMING (372-6464)
                  </div>
                  <div className="flex items-center">
                    <Mail size={16} className="mr-2" />
                    support@framecraftpro.com
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Ernakulam, Kerala, India
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods & Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Secure payments with:</span>
                <div className="flex space-x-2">
                  {['PayPal', 'Visa', 'Mastercard', 'RuPay', 'UPI'].map((payment) => (
                    <div key={payment} className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-300">
                      {payment}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                © 2025 FrameCraft Pro. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      {showLogin && (
        <UserLogin
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showRegister && (
        <UserRegister
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {showProfile && user && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}