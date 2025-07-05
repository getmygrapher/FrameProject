import { FrameConfiguration, PhotoInfo } from '../types';

const BASE_PRICE = 25.99;
const SIZE_MULTIPLIERS: { [key: string]: number } = {
  '4x6': 1.0,
  '5x7': 1.2,
  '8x10': 1.5,
  '8x12': 1.7,
  '11x14': 2.0,
  '12x16': 2.3,
  '16x20': 2.8
};

export function calculateFramePrice(config: FrameConfiguration): number {
  let price = BASE_PRICE;
  
  // Size multiplier
  const sizeMultiplier = SIZE_MULTIPLIERS[config.size.id] || 2.0;
  price *= sizeMultiplier;
  
  // Material multiplier
  price *= config.material.priceMultiplier;
  
  // Color multiplier
  price *= config.color.priceMultiplier;
  
  // Thickness multiplier
  price *= config.thickness.priceMultiplier;
  
  // Border cost (if enabled)
  if (config.border.enabled) {
    const borderCost = config.border.width * 5; // ₹5 per inch of border width
    price += borderCost;
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
}

export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}

export function getPhotoSpecs(photo: PhotoInfo): string {
  return `${photo.width} × ${photo.height} px (${photo.orientation.charAt(0).toUpperCase() + photo.orientation.slice(1)})`;
}