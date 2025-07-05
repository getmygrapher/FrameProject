import React from 'react';
import { CheckCircle, Download, Mail, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/pricing';

export default function OrderConfirmation() {
  const { state, dispatch } = useApp();

  const startOver = () => {
    dispatch({ type: 'RESET_APP' });
  };

  const goHome = () => {
    dispatch({ type: 'SET_STEP', payload: 'home' });
  };

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
      <div className="mb-6">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <div className="text-sm text-gray-600">Order Number</div>
            <div className="font-semibold text-gray-900">{state.orderId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="font-semibold text-gray-900">{formatPrice(total)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-semibold text-gray-900">{state.checkoutForm.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Estimated Delivery</div>
            <div className="font-semibold text-gray-900">5-7 business days</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <Mail size={24} className="text-blue-600 mb-2" />
            <div className="font-medium text-blue-900">Confirmation Email</div>
            <div className="text-blue-700 text-center">Check your inbox for order details</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="font-medium text-blue-900">Production</div>
            <div className="text-blue-700 text-center">Your frame will be crafted with care</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <Home size={24} className="text-blue-600 mb-2" />
            <div className="font-medium text-blue-900">Delivery</div>
            <div className="text-blue-700 text-center">Carefully packaged and shipped</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={startOver}
            className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Frame Another Photo
          </button>
          <button
            onClick={goHome}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:border-gray-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>Questions? Contact us at support@framecraftpro.com</div>
          <div>or call +91-484-FRAMING (+91-484-372-6464)</div>
        </div>
      </div>
    </div>
  );
}