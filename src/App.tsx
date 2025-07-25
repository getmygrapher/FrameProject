import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import { AppProvider, useApp } from "./context/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import StepIndicator from "./components/StepIndicator";
import PhotoUpload from "./components/PhotoUpload";
import FrameCustomizer from "./components/FrameCustomizer";
import FramePreview from "./components/FramePreview";
import PriceDisplay from "./components/PriceDisplay";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import LandingPage from "./components/LandingPage";
import ProductPage from "./components/ProductPage";

function AppContent() {
  const { state } = useApp();

  const renderContent = () => {
    switch (state.currentStep) {
      case "home":
        return <LandingPage />;

      case "product":
        return <ProductPage />;

      case "upload":
        return <PhotoUpload />;

      case "customize":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FrameCustomizer />
            </div>
            <div className="space-y-6">
              <div className="sticky top-4 space-y-6">
                <FramePreview />
                <PriceDisplay />
              </div>
            </div>
          </div>
        );

      case "cart":
        return <Cart />;

      case "checkout":
        return <Checkout />;

      case "confirmation":
        return <OrderConfirmation />;

      default:
        return <LandingPage />;
    }
  };

  // Don't show header on landing page and product page for cleaner design
  const showHeader =
    state.currentStep !== "home" && state.currentStep !== "product";
  const showStepIndicator =
    state.currentStep !== "home" &&
    state.currentStep !== "product" &&
    state.currentStep !== "confirmation" &&
    state.photo;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tempo routes */}
      {import.meta.env.VITE_TEMPO && useRoutes(routes)}

      {showHeader && <Header />}

      <main
        className={`${showHeader ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}`}
      >
        {showStepIndicator && <StepIndicator />}
        {renderContent()}
      </main>

      {/* Simple footer for non-home pages */}
      {showHeader && (
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <div className="text-sm">
                © 2025 FrameCraft Pro. Premium photo framing for your precious
                memories.
              </div>
              <div className="text-xs mt-2 space-x-4">
                <span>Quality Guarantee</span>
                <span>•</span>
                <span>Free Shipping Over $75</span>
                <span>•</span>
                <span>Expert Craftsmanship</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
