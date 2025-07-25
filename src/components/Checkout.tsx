import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Plus,
  MapPin,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../utils/pricing";
import { PaymentService, paymentMethods } from "../services/paymentService";
import { OrderTrackingService } from "../services/orderTrackingService";
import type { ShippingAddress } from "../services/orderTrackingService";

export default function Checkout() {
  const { state, dispatch } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<ShippingAddress>>({
    name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: "",
    is_default: false,
  });
  const [paymentError, setPaymentError] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(state.isGuestCheckout);

  const goBack = () => {
    dispatch({ type: "SET_STEP", payload: "cart" });
  };

  const updateForm = (field: string, value: string) => {
    dispatch({
      type: "UPDATE_CHECKOUT_FORM",
      payload: { [field]: value },
    });
  };

  useEffect(() => {
    // Load shipping addresses if user is logged in
    if (!state.isGuestCheckout) {
      // In a real app, you would load user's saved addresses
      // For demo, we'll use mock data
      const mockAddresses: ShippingAddress[] = [
        {
          id: "1",
          name: "Home",
          address_line_1: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          postal_code: "400001",
          country: "India",
          phone: "+91 9876543210",
          is_default: true,
        },
        {
          id: "2",
          name: "Office",
          address_line_1: "456 Business Park",
          city: "Bangalore",
          state: "Karnataka",
          postal_code: "560001",
          country: "India",
          phone: "+91 9876543211",
          is_default: false,
        },
      ];
      dispatch({ type: "SET_SHIPPING_ADDRESSES", payload: mockAddresses });
      if (!state.selectedShippingAddress && mockAddresses.length > 0) {
        dispatch({
          type: "SET_SELECTED_SHIPPING_ADDRESS",
          payload: mockAddresses[0],
        });
      }
    }
  }, [state.isGuestCheckout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError("");

    try {
      const paymentData = {
        orderId: `FCF-${Date.now().toString().slice(-6)}`,
        amount: total,
        currency: "INR",
        customerEmail: state.checkoutForm.email,
        customerName: `${state.checkoutForm.firstName} ${state.checkoutForm.lastName}`,
        customerPhone: state.checkoutForm.phone,
      };

      // Process payment
      const paymentResult = await PaymentService.processPayment(
        paymentData,
        state.selectedPaymentMethod,
      );

      if (paymentResult.success) {
        // Verify payment (in real app, this would be done on backend)
        const isVerified = await PaymentService.verifyPayment(
          paymentResult.paymentId!,
          paymentResult.orderId!,
          paymentResult.signature!,
        );

        if (isVerified) {
          // Create order tracking
          await OrderTrackingService.updateOrderStatus(
            paymentData.orderId,
            "pending",
            "Order placed successfully and payment confirmed",
          );

          dispatch({ type: "COMPLETE_ORDER", payload: paymentData.orderId });
          dispatch({ type: "CLEAR_CART" });
        } else {
          setPaymentError(
            "Payment verification failed. Please contact support.",
          );
        }
      } else {
        setPaymentError(
          paymentResult.error || "Payment failed. Please try again.",
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setPaymentError("An error occurred during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const addNewAddress = () => {
    if (
      newAddress.name &&
      newAddress.address_line_1 &&
      newAddress.city &&
      newAddress.state &&
      newAddress.postal_code
    ) {
      const address: ShippingAddress = {
        id: Date.now().toString(),
        name: newAddress.name!,
        address_line_1: newAddress.address_line_1!,
        address_line_2: newAddress.address_line_2,
        city: newAddress.city!,
        state: newAddress.state!,
        postal_code: newAddress.postal_code!,
        country: newAddress.country || "India",
        phone: newAddress.phone,
        is_default: newAddress.is_default || false,
      };

      dispatch({ type: "ADD_SHIPPING_ADDRESS", payload: address });
      dispatch({ type: "SET_SELECTED_SHIPPING_ADDRESS", payload: address });
      setShowAddressForm(false);
      setNewAddress({
        name: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        phone: "",
        is_default: false,
      });
    }
  };

  // Calculate totals with discounts
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
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal - promoDiscount + shipping + tax;

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
            <h2 className="text-2xl font-semibold text-gray-900">Checkout</h2>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="lg:order-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {state.cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.photo.url}
                    alt="Order item"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {item.frame.size.displayName} {item.frame.material.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {totalVolumeDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Volume Discount</span>
                    <span>-{formatPrice(totalVolumeDiscount)}</span>
                  </div>
                )}

                {state.promoCode && promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo ({state.promoCode})</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (GST 18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:order-1 space-y-6">
            {/* Guest/User Toggle */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Checkout Options
                </h3>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isGuestMode}
                    onChange={() => {
                      setIsGuestMode(false);
                      dispatch({ type: "SET_GUEST_CHECKOUT", payload: false });
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    Login/Register for faster checkout
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isGuestMode}
                    onChange={() => {
                      setIsGuestMode(true);
                      dispatch({ type: "SET_GUEST_CHECKOUT", payload: true });
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">Continue as guest</span>
                </label>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={state.checkoutForm.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={state.checkoutForm.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={state.checkoutForm.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={state.checkoutForm.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className="w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Shipping Address
                </h3>
                {!isGuestMode && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add New Address
                  </button>
                )}
              </div>

              {!isGuestMode && state.shippingAddresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="font-medium text-gray-700">Saved Addresses</h4>
                  {state.shippingAddresses.map((address) => (
                    <label
                      key={address.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={
                          state.selectedShippingAddress?.id === address.id
                        }
                        onChange={() =>
                          dispatch({
                            type: "SET_SELECTED_SHIPPING_ADDRESS",
                            payload: address,
                          })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {address.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.address_line_1}
                          {address.address_line_2 &&
                            `, ${address.address_line_2}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.postal_code}
                        </div>
                        {address.phone && (
                          <div className="text-sm text-gray-600">
                            {address.phone}
                          </div>
                        )}
                        {address.is_default && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                            Default
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {(isGuestMode ||
                showAddressForm ||
                state.shippingAddresses.length === 0) && (
                <div className="space-y-4">
                  {showAddressForm && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Add New Address
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Address Name (e.g., Home, Office)"
                          value={newAddress.name || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              name: e.target.value,
                            })
                          }
                          className="col-span-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 1"
                          value={newAddress.address_line_1 || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address_line_1: e.target.value,
                            })
                          }
                          className="col-span-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 2 (Optional)"
                          value={newAddress.address_line_2 || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address_line_2: e.target.value,
                            })
                          }
                          className="col-span-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              city: e.target.value,
                            })
                          }
                          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              state: e.target.value,
                            })
                          }
                          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="PIN Code"
                          value={newAddress.postal_code || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              postal_code: e.target.value,
                            })
                          }
                          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="tel"
                          placeholder="Phone (Optional)"
                          value={newAddress.phone || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              phone: e.target.value,
                            })
                          }
                          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newAddress.is_default || false}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                is_default: e.target.checked,
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Set as default address
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={addNewAddress}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add Address
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {(isGuestMode || state.shippingAddresses.length === 0) &&
                    !showAddressForm && (
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={state.checkoutForm.address}
                          onChange={(e) =>
                            updateForm("address", e.target.value)
                          }
                          className="col-span-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={state.checkoutForm.city}
                          onChange={(e) => updateForm("city", e.target.value)}
                          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={state.checkoutForm.state}
                          onChange={(e) => updateForm("state", e.target.value)}
                          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="PIN Code"
                          value={state.checkoutForm.zipCode}
                          onChange={(e) =>
                            updateForm("zipCode", e.target.value)
                          }
                          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" />
                Payment Method
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {paymentMethods
                  .filter((method) => method.enabled)
                  .map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        state.selectedPaymentMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={state.selectedPaymentMethod === method.id}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_PAYMENT_METHOD",
                            payload: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {method.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {method.type}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Secure Payment
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and secure. We support
                  all major payment methods including UPI, cards, and digital
                  wallets.
                </p>
              </div>
            </div>

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{paymentError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className={`
                w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2
                ${
                  isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
                transition-colors
              `}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Pay {formatPrice(total)} - Complete Order
                </>
              )}
            </button>

            <div className="text-xs text-gray-500 text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Lock size={12} />
                Your payment information is secure and encrypted
              </div>
              <div>Orders typically ship within 2-3 business days</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
