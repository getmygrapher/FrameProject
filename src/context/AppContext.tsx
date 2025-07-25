import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  PhotoInfo,
  FrameConfiguration,
  CartItem,
  CheckoutForm,
  AppStep,
} from "../types";
import {
  frameSizes,
  frameMaterials,
  frameThickness,
} from "../data/frameOptions";

interface AppState {
  currentStep: AppStep;
  photo: PhotoInfo | null;
  frameConfig: FrameConfiguration;
  cart: CartItem[];
  checkoutForm: CheckoutForm;
  orderId: string | null;
  selectedProduct: any | null;
  productSelections: {
    size: FrameSize | null;
    material: FrameMaterial | null;
    color: FrameColor | null;
  };
  isGuestCheckout: boolean;
  selectedPaymentMethod: string;
  shippingAddresses: ShippingAddress[];
  selectedShippingAddress: ShippingAddress | null;
  promoCode: string;
  promoDiscount: number;
  cartPersisted: boolean;
}

interface ShippingAddress {
  id?: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

type AppAction =
  | { type: "SET_STEP"; payload: AppStep }
  | { type: "SET_PHOTO"; payload: PhotoInfo | null }
  | { type: "UPDATE_FRAME_CONFIG"; payload: Partial<FrameConfiguration> }
  | {
      type: "ADD_TO_CART";
      payload: { photo: PhotoInfo; frame: FrameConfiguration; price: number };
    }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "UPDATE_CHECKOUT_FORM"; payload: Partial<CheckoutForm> }
  | { type: "COMPLETE_ORDER"; payload: string }
  | { type: "SET_SELECTED_PRODUCT"; payload: any }
  | {
      type: "UPDATE_PRODUCT_SELECTIONS";
      payload: Partial<{
        size: FrameSize;
        material: FrameMaterial;
        color: FrameColor;
      }>;
    }
  | { type: "SET_GUEST_CHECKOUT"; payload: boolean }
  | { type: "SET_PAYMENT_METHOD"; payload: string }
  | { type: "SET_SHIPPING_ADDRESSES"; payload: ShippingAddress[] }
  | { type: "SET_SELECTED_SHIPPING_ADDRESS"; payload: ShippingAddress | null }
  | { type: "ADD_SHIPPING_ADDRESS"; payload: ShippingAddress }
  | {
      type: "UPDATE_SHIPPING_ADDRESS";
      payload: { id: string; address: Partial<ShippingAddress> };
    }
  | { type: "REMOVE_SHIPPING_ADDRESS"; payload: string }
  | { type: "SET_PROMO_CODE"; payload: string }
  | { type: "SET_PROMO_DISCOUNT"; payload: number }
  | { type: "PERSIST_CART" }
  | { type: "LOAD_PERSISTED_CART"; payload: CartItem[] }
  | { type: "CLEAR_CART" }
  | { type: "RESET_APP" };

const initialState: AppState = {
  currentStep: "home", // Start with home/landing page
  photo: null,
  frameConfig: {
    size: frameSizes[2], // 8x10 default
    material: frameMaterials[0], // Oak default
    color: frameMaterials[0].colors[0], // Natural Oak
    thickness: frameThickness[1], // 1/2" default
    border: { enabled: false, width: 1, color: "#FFFFFF" },
    zoom: 1.0, // Default zoom level
    orientation: "auto", // Auto-detect orientation
    offsetX: 0, // Default X position (centered)
    offsetY: 0, // Default Y position (centered)
  },
  cart: [],
  checkoutForm: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  },
  orderId: null,
  selectedProduct: null,
  productSelections: {
    size: null,
    material: null,
    color: null,
  },
  isGuestCheckout: false,
  selectedPaymentMethod: "razorpay_card",
  shippingAddresses: [],
  selectedShippingAddress: null,
  promoCode: "",
  promoDiscount: 0,
  cartPersisted: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "SET_PHOTO":
      return { ...state, photo: action.payload };

    case "UPDATE_FRAME_CONFIG":
      return {
        ...state,
        frameConfig: { ...state.frameConfig, ...action.payload },
      };

    case "ADD_TO_CART":
      const newItem: CartItem = {
        id: Date.now().toString(),
        photo: action.payload.photo,
        frame: action.payload.frame,
        price: action.payload.price,
        quantity: 1,
      };
      return { ...state, cart: [...state.cart, newItem] };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item,
        ),
      };

    case "UPDATE_CHECKOUT_FORM":
      return {
        ...state,
        checkoutForm: { ...state.checkoutForm, ...action.payload },
      };

    case "COMPLETE_ORDER":
      return {
        ...state,
        orderId: action.payload,
        currentStep: "confirmation",
      };

    case "SET_SELECTED_PRODUCT":
      return {
        ...state,
        selectedProduct: action.payload,
      };

    case "UPDATE_PRODUCT_SELECTIONS":
      return {
        ...state,
        productSelections: { ...state.productSelections, ...action.payload },
        // Also update frameConfig when selections are made
        frameConfig: {
          ...state.frameConfig,
          ...(action.payload.size && { size: action.payload.size }),
          ...(action.payload.material && { material: action.payload.material }),
          ...(action.payload.color && { color: action.payload.color }),
        },
      };

    case "SET_GUEST_CHECKOUT":
      return { ...state, isGuestCheckout: action.payload };

    case "SET_PAYMENT_METHOD":
      return { ...state, selectedPaymentMethod: action.payload };

    case "SET_SHIPPING_ADDRESSES":
      return { ...state, shippingAddresses: action.payload };

    case "SET_SELECTED_SHIPPING_ADDRESS":
      return { ...state, selectedShippingAddress: action.payload };

    case "ADD_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddresses: [...state.shippingAddresses, action.payload],
      };

    case "UPDATE_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddresses: state.shippingAddresses.map((addr) =>
          addr.id === action.payload.id
            ? { ...addr, ...action.payload.address }
            : addr,
        ),
      };

    case "REMOVE_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddresses: state.shippingAddresses.filter(
          (addr) => addr.id !== action.payload,
        ),
      };

    case "SET_PROMO_CODE":
      return { ...state, promoCode: action.payload };

    case "SET_PROMO_DISCOUNT":
      return { ...state, promoDiscount: action.payload };

    case "PERSIST_CART":
      if (typeof window !== "undefined") {
        localStorage.setItem("framecraft_cart", JSON.stringify(state.cart));
      }
      return { ...state, cartPersisted: true };

    case "LOAD_PERSISTED_CART":
      return { ...state, cart: action.payload, cartPersisted: true };

    case "CLEAR_CART":
      if (typeof window !== "undefined") {
        localStorage.removeItem("framecraft_cart");
      }
      return { ...state, cart: [], cartPersisted: false };

    case "RESET_APP":
      if (typeof window !== "undefined") {
        localStorage.removeItem("framecraft_cart");
      }
      return { ...initialState, currentStep: "home" }; // Reset to home instead of upload

    default:
      return state;
  }
}

const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted cart on mount
  React.useEffect(() => {
    if (typeof window !== "undefined" && !state.cartPersisted) {
      const persistedCart = localStorage.getItem("framecraft_cart");
      if (persistedCart) {
        try {
          const cart = JSON.parse(persistedCart);
          dispatch({ type: "LOAD_PERSISTED_CART", payload: cart });
        } catch (error) {
          console.error("Error loading persisted cart:", error);
          localStorage.removeItem("framecraft_cart");
        }
      }
    }
  }, [state.cartPersisted]);

  // Auto-persist cart when it changes
  React.useEffect(() => {
    if (state.cart.length > 0 && state.cartPersisted) {
      dispatch({ type: "PERSIST_CART" });
    }
  }, [state.cart, state.cartPersisted]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
