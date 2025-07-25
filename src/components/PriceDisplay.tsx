import React from "react";
import { ShoppingCart, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { calculateFramePrice, formatPrice } from "../utils/pricing";

export default function PriceDisplay() {
  const { state, dispatch } = useApp();

  if (!state.photo) return null;

  const price = calculateFramePrice(state.frameConfig);

  // Handle NaN or invalid price
  const isValidPrice = !isNaN(price) && isFinite(price) && price > 0;
  const displayPrice = isValidPrice ? price : 25.99; // Fallback to base price

  const addToCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: {
        photo: state.photo!,
        frame: state.frameConfig,
        price: displayPrice,
      },
    });

    // Show success feedback or navigate to cart
    setTimeout(() => {
      dispatch({ type: "SET_STEP", payload: "cart" });
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
      <div className="text-center space-y-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Price</div>
          <div className="text-4xl font-bold text-gray-900">
            {formatPrice(displayPrice)}
            {!isValidPrice && (
              <div className="text-xs text-red-500 mt-1">
                Price calculation error - showing base price
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Base Frame ({state.frameConfig.size.displayName})</span>
            <span>{formatPrice(25.99)}</span>
          </div>
          <div className="flex justify-between">
            <span>{state.frameConfig.material.name}</span>
            <span>
              +
              {Math.round(
                (state.frameConfig.material.priceMultiplier - 1) * 100,
              )}
              %
            </span>
          </div>
          <div className="flex justify-between">
            <span>{state.frameConfig.color.name}</span>
            <span>
              +{Math.round((state.frameConfig.color.priceMultiplier - 1) * 100)}
              %
            </span>
          </div>
          <div className="flex justify-between">
            <span>Thickness ({state.frameConfig.thickness.name})</span>
            <span>
              +
              {Math.round(
                (state.frameConfig.thickness.priceMultiplier - 1) * 100,
              )}
              %
            </span>
          </div>
          {state.frameConfig.border.enabled && (
            <div className="flex justify-between">
              <span>Border ({state.frameConfig.border.width}" matting)</span>
              <span>+{formatPrice(state.frameConfig.border.width * 5)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 border-gray-200">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(displayPrice)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={addToCart}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Add to Cart
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <div>✓ Premium archival printing</div>
          <div>✓ UV-resistant museum-quality inks</div>
          <div>✓ Acid-free matting (if selected)</div>
          <div>✓ Free shipping on orders over ₹75</div>
        </div>
      </div>
    </div>
  );
}
