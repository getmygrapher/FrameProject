import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/pricing';

export default function Checkout() {
  const { state, dispatch } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const goBack = () => {
    dispatch({ type: 'SET_STEP', payload: 'cart' });
  };

  const updateForm = (field: string, value: string) => {
    dispatch({
      type: 'UPDATE_CHECKOUT_FORM',
      payload: { [field]: value }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const orderId = `FCF-${Date.now().toString().slice(-6)}`;
    dispatch({ type: 'COMPLETE_ORDER', payload: orderId });
    setIsProcessing(false);
  };

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
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
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
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
            {/* Shipping Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={state.checkoutForm.firstName}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={state.checkoutForm.lastName}
                  onChange={(e) => updateForm('lastName', e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={state.checkoutForm.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="col-span-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={state.checkoutForm.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="col-span-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={state.checkoutForm.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  className="col-span-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={state.checkoutForm.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state.checkoutForm.state}
                  onChange={(e) => updateForm('state', e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={state.checkoutForm.zipCode}
                  onChange={(e) => updateForm('zipCode', e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={state.checkoutForm.cardNumber}
                    onChange={(e) => updateForm('cardNumber', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-12"
                    required
                  />
                  <CreditCard size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={state.checkoutForm.expiryDate}
                    onChange={(e) => updateForm('expiryDate', e.target.value)}
                    className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={state.checkoutForm.cvv}
                    onChange={(e) => updateForm('cvv', e.target.value)}
                    className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`
                w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2
                ${isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
                transition-colors
              `}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Complete Order - {formatPrice(total)}
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