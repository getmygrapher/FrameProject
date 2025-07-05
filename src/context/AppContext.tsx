import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PhotoInfo, FrameConfiguration, CartItem, CheckoutForm, AppStep } from '../types';
import { frameSizes, frameMaterials, frameThickness } from '../data/frameOptions';

interface AppState {
  currentStep: AppStep;
  photo: PhotoInfo | null;
  frameConfig: FrameConfiguration;
  cart: CartItem[];
  checkoutForm: CheckoutForm;
  orderId: string | null;
}

type AppAction =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_PHOTO'; payload: PhotoInfo | null }
  | { type: 'UPDATE_FRAME_CONFIG'; payload: Partial<FrameConfiguration> }
  | { type: 'ADD_TO_CART'; payload: { photo: PhotoInfo; frame: FrameConfiguration; price: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_CHECKOUT_FORM'; payload: Partial<CheckoutForm> }
  | { type: 'COMPLETE_ORDER'; payload: string }
  | { type: 'RESET_APP' };

const initialState: AppState = {
  currentStep: 'home', // Start with home/landing page
  photo: null,
  frameConfig: {
    size: frameSizes[2], // 8x10 default
    material: frameMaterials[0], // Oak default
    color: frameMaterials[0].colors[0], // Natural Oak
    thickness: frameThickness[1], // 1/2" default
    border: { enabled: false, width: 1, color: '#FFFFFF' }
  },
  cart: [],
  checkoutForm: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  },
  orderId: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_PHOTO':
      return { ...state, photo: action.payload };
    
    case 'UPDATE_FRAME_CONFIG':
      return {
        ...state,
        frameConfig: { ...state.frameConfig, ...action.payload }
      };
    
    case 'ADD_TO_CART':
      const newItem: CartItem = {
        id: Date.now().toString(),
        photo: action.payload.photo,
        frame: action.payload.frame,
        price: action.payload.price,
        quantity: 1
      };
      return { ...state, cart: [...state.cart, newItem] };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'UPDATE_CHECKOUT_FORM':
      return {
        ...state,
        checkoutForm: { ...state.checkoutForm, ...action.payload }
      };
    
    case 'COMPLETE_ORDER':
      return {
        ...state,
        orderId: action.payload,
        currentStep: 'confirmation'
      };
    
    case 'RESET_APP':
      return { ...initialState, currentStep: 'home' }; // Reset to home instead of upload
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}