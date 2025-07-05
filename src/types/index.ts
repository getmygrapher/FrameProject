export interface PhotoInfo {
  file: File;
  url: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
  aspectRatio: number;
}

export interface FrameSize {
  id: string;
  name: string;
  width: number;
  height: number;
  displayName: string;
  popular?: boolean;
}

export interface FrameMaterial {
  id: string;
  name: string;
  category: 'wood' | 'metal';
  texture: string;
  priceMultiplier: number;
  colors: FrameColor[];
}

export interface FrameColor {
  id: string;
  name: string;
  hex: string;
  priceMultiplier: number;
}

export interface FrameThickness {
  id: string;
  name: string;
  inches: number;
  priceMultiplier: number;
}

export interface BorderOption {
  enabled: boolean;
  width: number; // in inches
  color: string;
}

export interface FrameConfiguration {
  size: FrameSize;
  material: FrameMaterial;
  color: FrameColor;
  thickness: FrameThickness;
  border: BorderOption;
}

export interface CartItem {
  id: string;
  photo: PhotoInfo;
  frame: FrameConfiguration;
  price: number;
  quantity: number;
}

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export type AppStep = 'home' | 'upload' | 'customize' | 'cart' | 'checkout' | 'confirmation';