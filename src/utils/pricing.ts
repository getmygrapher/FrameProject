import { FrameConfiguration, PhotoInfo } from "../types";

const BASE_PRICE = 25.99;
const SIZE_MULTIPLIERS: { [key: string]: number } = {
  "4x6": 1.0,
  "5x7": 1.2,
  "8x10": 1.5,
  "8x12": 1.7,
  "11x14": 2.0,
  "12x16": 2.3,
  "16x20": 2.8,
};

export function calculateFramePrice(config: FrameConfiguration): number {
  let price = BASE_PRICE;

  // Validate config object and its properties
  if (
    !config ||
    !config.size ||
    !config.material ||
    !config.color ||
    !config.thickness
  ) {
    console.error("Invalid frame configuration for pricing calculation");
    return BASE_PRICE;
  }

  // Size multiplier with validation
  const sizeMultiplier = SIZE_MULTIPLIERS[config.size.id] || 2.0;
  if (isNaN(sizeMultiplier)) {
    console.error("Invalid size multiplier");
    return BASE_PRICE;
  }
  price *= sizeMultiplier;

  // Material multiplier with validation
  const materialMultiplier = config.material.priceMultiplier || 1.0;
  if (isNaN(materialMultiplier)) {
    console.error("Invalid material multiplier");
    return BASE_PRICE;
  }
  price *= materialMultiplier;

  // Color multiplier with validation
  const colorMultiplier = config.color.priceMultiplier || 1.0;
  if (isNaN(colorMultiplier)) {
    console.error("Invalid color multiplier");
    return BASE_PRICE;
  }
  price *= colorMultiplier;

  // Thickness multiplier with validation
  const thicknessMultiplier = config.thickness.priceMultiplier || 1.0;
  if (isNaN(thicknessMultiplier)) {
    console.error("Invalid thickness multiplier");
    return BASE_PRICE;
  }
  price *= thicknessMultiplier;

  // Border cost (if enabled) with validation
  if (config.border && config.border.enabled) {
    const borderWidth = config.border.width || 0;
    if (!isNaN(borderWidth)) {
      const borderCost = borderWidth * 5; // ₹5 per inch of border width
      price += borderCost;
    }
  }

  // Final validation
  if (isNaN(price) || price < 0) {
    console.error("Invalid final price calculation, returning base price");
    return BASE_PRICE;
  }

  return Math.round(price * 100) / 100; // Round to 2 decimal places
}

export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}

export function getPhotoSpecs(photo: PhotoInfo): string {
  return `${photo.width} × ${photo.height} px (${photo.orientation.charAt(0).toUpperCase() + photo.orientation.slice(1)})`;
}
