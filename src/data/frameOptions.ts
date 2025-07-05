import { FrameSize, FrameMaterial, FrameThickness } from '../types';

export const frameSizes: FrameSize[] = [
  { id: '4x6', name: '4" × 6"', width: 4, height: 6, displayName: '4" × 6"', popular: true },
  { id: '5x7', name: '5" × 7"', width: 5, height: 7, displayName: '5" × 7"', popular: true },
  { id: '8x10', name: '8" × 10"', width: 8, height: 10, displayName: '8" × 10"', popular: true },
  { id: '8x12', name: '8" × 12"', width: 8, height: 12, displayName: '8" × 12"' },
  { id: '11x14', name: '11" × 14"', width: 11, height: 14, displayName: '11" × 14"' },
  { id: '12x16', name: '12" × 16"', width: 12, height: 16, displayName: '12" × 16"' },
  { id: '16x20', name: '16" × 20"', width: 16, height: 20, displayName: '16" × 20"' },
  { id: 'custom', name: 'Custom Size', width: 0, height: 0, displayName: 'Custom Size' }
];

export const frameMaterials: FrameMaterial[] = [
  {
    id: 'oak',
    name: 'Oak Wood',
    category: 'wood',
    texture: 'wood-grain-light',
    priceMultiplier: 1.0,
    colors: [
      { id: 'natural-oak', name: 'Natural Oak', hex: '#D4A574', priceMultiplier: 1.0 },
      { id: 'dark-oak', name: 'Dark Oak', hex: '#8B4513', priceMultiplier: 1.1 },
      { id: 'white-oak', name: 'White Oak', hex: '#F5F5DC', priceMultiplier: 1.05 }
    ]
  },
  {
    id: 'walnut',
    name: 'Walnut Wood',
    category: 'wood',
    texture: 'wood-grain-dark',
    priceMultiplier: 1.3,
    colors: [
      { id: 'natural-walnut', name: 'Natural Walnut', hex: '#8B4513', priceMultiplier: 1.0 },
      { id: 'dark-walnut', name: 'Dark Walnut', hex: '#654321', priceMultiplier: 1.1 },
      { id: 'ebony-walnut', name: 'Ebony Walnut', hex: '#2F1B14', priceMultiplier: 1.2 }
    ]
  },
  {
    id: 'aluminum',
    name: 'Aluminum',
    category: 'metal',
    texture: 'brushed-metal',
    priceMultiplier: 0.8,
    colors: [
      { id: 'silver', name: 'Silver', hex: '#C0C0C0', priceMultiplier: 1.0 },
      { id: 'black-metal', name: 'Black', hex: '#2C2C2C', priceMultiplier: 1.0 },
      { id: 'gold-metal', name: 'Gold', hex: '#FFD700', priceMultiplier: 1.2 }
    ]
  }
];

export const frameThickness: FrameThickness[] = [
  { id: 'quarter', name: '1/4"', inches: 0.25, priceMultiplier: 0.8 },
  { id: 'half', name: '1/2"', inches: 0.5, priceMultiplier: 1.0 },
  { id: 'three-quarter', name: '3/4"', inches: 0.75, priceMultiplier: 1.2 },
  { id: 'one', name: '1"', inches: 1.0, priceMultiplier: 1.4 },
  { id: 'one-half', name: '1 1/2"', inches: 1.5, priceMultiplier: 1.6 },
  { id: 'two', name: '2"', inches: 2.0, priceMultiplier: 1.8 }
];

export const borderWidthOptions = [0.5, 1, 1.5, 2, 2.5, 3];

export const borderColors = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Cream', hex: '#F5F5DC' },
  { name: 'Light Gray', hex: '#D3D3D3' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Black', hex: '#000000' }
];