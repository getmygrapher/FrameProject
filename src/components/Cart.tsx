import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  Percent,
  Gift,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../utils/pricing";
import { PaymentService } from "../services/paymentService";

export default function Cart() {
  const { state, dispatch } = useApp();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeError, setPromoCodeError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const goBack = () => {
    dispatch({ type: "SET_STEP", payload: "customize" });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id, quantity } });
    }
  };

  const proceedToCheckout = () => {
    dispatch({ type: "SET_STEP", payload: "checkout" });
  };

  // Calculate volume discounts for each item
  const cartWithDiscounts = state.cart.map((item) => {
    const { discount, finalPrice } = PaymentService.calculateVolumeDiscount(
      item.quantity,
      item.price,
    );
    return {
      ...item,
      originalPrice: item.price,
      discountAmount: discount * item.quantity,
      finalPrice: finalPrice * item.quantity,
    };
  });

  const subtotal = cartWithDiscounts.reduce(
    (sum, item) => sum + item.finalPrice,
    0,
  );
  const totalVolumeDiscount = cartWithDiscounts.reduce(
    (sum, item) => sum + item.discountAmount,
    0,
  );
  const promoDiscount = (subtotal * state.promoDiscount) / 100;
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal - promoDiscount + shipping;

  const applyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;

    setIsApplyingPromo(true);
    setPromoCodeError("");

    // Simulate promo code validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const validPromoCodes: { [key: string]: number } = {
      WELCOME10: 10,
      SAVE15: 15,
      FIRST20: 20,
      BULK25: 25,
    };

    const discount = validPromoCodes[promoCodeInput.toUpperCase()];

    if (discount) {
      dispatch({
        type: "SET_PROMO_CODE",
        payload: promoCodeInput.toUpperCase(),
      });
      dispatch({ type: "SET_PROMO_DISCOUNT", payload: discount });
      setPromoCodeInput("");
    } else {
      setPromoCodeError("Invalid promo code");
    }

    setIsApplyingPromo(false);
  };

  const removePromoCode = () => {
    dispatch({ type: "SET_PROMO_CODE", payload: "" });
    dispatch({ type: "SET_PROMO_DISCOUNT", payload: 0 });
  };

  if (state.cart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some beautiful frames to get started
          </p>
          <button
            onClick={goBack}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Shopping Cart
            </h2>
            <p className="text-gray-600">
              {state.cart.length} item{state.cart.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6 mb-8">
          {cartWithDiscounts.map((item) => {
            const hasVolumeDiscount = item.discountAmount > 0;
            const discountPercentage = hasVolumeDiscount
              ? Math.round(
                  (item.discountAmount / (item.originalPrice * item.quantity)) *
                    100,
                )
              : 0;

            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 border border-gray-200 rounded-lg relative"
              >
                {hasVolumeDiscount && (
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {discountPercentage}% OFF
                  </div>
                )}

                <img
                  src={item.photo.url}
                  alt="Cart item"
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.frame.size.displayName} {item.frame.material.name}{" "}
                        Frame
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.frame.color.name} • {item.frame.thickness.name}{" "}
                        thick
                        {item.frame.border.enabled &&
                          ` • ${item.frame.border.width}" border`}
                      </p>
                      {hasVolumeDiscount && (
                        <p className="text-sm text-green-600 font-medium">
                          Volume discount applied!
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(item.finalPrice)}
                      </div>
                      {hasVolumeDiscount && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <div className="text-sm text-gray-500">
                          {formatPrice(item.finalPrice / item.quantity)} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promo Code Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag size={18} className="text-blue-600" />
            Promo Code
          </h3>

          {state.promoCode ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-green-600" />
                <span className="font-medium text-green-800">
                  {state.promoCode}
                </span>
                <span className="text-sm text-green-600">
                  ({state.promoDiscount}% off)
                </span>
              </div>
              <button
                onClick={removePromoCode}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCodeInput}
                onChange={(e) => {
                  setPromoCodeInput(e.target.value);
                  setPromoCodeError("");
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={applyPromoCode}
                disabled={isApplyingPromo || !promoCodeInput.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplyingPromo ? "Applying..." : "Apply"}
              </button>
            </div>
          )}

          {promoCodeError && (
            <p className="text-red-600 text-sm mt-2">{promoCodeError}</p>
          )}

          <div className="mt-3 text-sm text-gray-600">
            <p className="font-medium mb-1">Available codes:</p>
            <div className="flex flex-wrap gap-2">
              {["WELCOME10", "SAVE15", "FIRST20"].map((code) => (
                <button
                  key={code}
                  onClick={() => setPromoCodeInput(code)}
                  className="bg-white border border-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>

            {totalVolumeDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Percent size={14} />
                  Volume Discount
                </span>
                <span className="font-medium">
                  -{formatPrice(totalVolumeDiscount)}
                </span>
              </div>
            )}

            {state.promoCode && promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Tag size={14} />
                  Promo ({state.promoCode})
                </span>
                <span className="font-medium">
                  -{formatPrice(promoDiscount)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>

            {subtotal < 75 && (
              <div className="text-sm text-gray-500">
                Add {formatPrice(75 - subtotal)} for free shipping
              </div>
            )}

            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {(totalVolumeDiscount > 0 || promoDiscount > 0) && (
              <div className="text-sm text-green-600 font-medium">
                You saved {formatPrice(totalVolumeDiscount + promoDiscount)}!
              </div>
            )}
          </div>

          <button
            onClick={proceedToCheckout}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
