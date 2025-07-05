import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/pricing';

export default function Cart() {
  const { state, dispatch } = useApp();

  const goBack = () => {
    dispatch({ type: 'SET_STEP', payload: 'customize' });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, quantity } });
    }
  };

  const proceedToCheckout = () => {
    dispatch({ type: 'SET_STEP', payload: 'checkout' });
  };

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (state.cart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
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
            <h2 className="text-2xl font-semibold text-gray-900">Shopping Cart</h2>
            <p className="text-gray-600">{state.cart.length} item{state.cart.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6 mb-8">
          {state.cart.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
              <img
                src={item.photo.url}
                alt="Cart item"
                className="w-20 h-20 object-cover rounded-lg shadow-md"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.frame.size.displayName} {item.frame.material.name} Frame
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.frame.color.name} • {item.frame.thickness.name} thick
                      {item.frame.border.enabled && ` • ${item.frame.border.width}" border`}
                    </p>
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
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-sm text-gray-500">
                        {formatPrice(item.price)} each
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
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