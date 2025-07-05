import { PhotoInfo, FrameConfiguration } from '../types';

export function drawFramePreview(
  canvas: HTMLCanvasElement,
  photo: PhotoInfo,
  config: FrameConfiguration
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Calculate frame dimensions
  const frameRatio = config.size.width / config.size.height;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let frameWidth, frameHeight;
  if (frameRatio > canvasRatio) {
    frameWidth = canvasWidth * 0.8;
    frameHeight = frameWidth / frameRatio;
  } else {
    frameHeight = canvasHeight * 0.8;
    frameWidth = frameHeight * frameRatio;
  }
  
  const frameX = (canvasWidth - frameWidth) / 2;
  const frameY = (canvasHeight - frameHeight) / 2;
  
  // Draw frame shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  
  // Check if we have a frame photo to use as texture
  if (config.material.photo_url) {
    drawFrameWithPhoto(ctx, frameX, frameY, frameWidth, frameHeight, config);
  } else {
    // Fallback to solid color
    ctx.fillStyle = config.color.hex;
    ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
  }
  ctx.restore();
  
  // Calculate inner dimensions (accounting for frame thickness and border)
  const thicknessPx = config.thickness.inches * 20; // Convert inches to pixels for display
  const borderPx = config.border.enabled ? config.border.width * 20 : 0;
  
  const innerX = frameX + thicknessPx;
  const innerY = frameY + thicknessPx;
  const innerWidth = frameWidth - (thicknessPx * 2);
  const innerHeight = frameHeight - (thicknessPx * 2);
  
  // Draw border if enabled
  if (config.border.enabled) {
    ctx.fillStyle = config.border.color;
    ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
  }
  
  // Calculate photo area
  const photoX = innerX + borderPx;
  const photoY = innerY + borderPx;
  const photoWidth = innerWidth - (borderPx * 2);
  const photoHeight = innerHeight - (borderPx * 2);
  
  // Draw photo
  const img = new Image();
  img.onload = () => {
    ctx.save();
    ctx.rect(photoX, photoY, photoWidth, photoHeight);
    ctx.clip();
    
    // Calculate photo scaling to fill the area
    const photoRatio = img.width / img.height;
    const areaRatio = photoWidth / photoHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    if (photoRatio > areaRatio) {
      drawHeight = photoHeight;
      drawWidth = drawHeight * photoRatio;
      drawX = photoX - (drawWidth - photoWidth) / 2;
      drawY = photoY;
    } else {
      drawWidth = photoWidth;
      drawHeight = drawWidth / photoRatio;
      drawX = photoX;
      drawY = photoY - (drawHeight - photoHeight) / 2;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  };
  img.crossOrigin = 'anonymous';
  img.src = photo.url;
}

function drawFrameWithPhoto(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  config: FrameConfiguration
): void {
  const frameImg = new Image();
  frameImg.onload = () => {
    // Create a pattern from the frame photo
    const pattern = ctx.createPattern(frameImg, 'repeat');
    if (pattern) {
      // Apply color tint if needed
      ctx.fillStyle = pattern;
      ctx.fillRect(x, y, width, height);
      
      // Apply color overlay for tinting
      if (config.color.hex !== '#FFFFFF') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = config.color.hex;
        ctx.fillRect(x, y, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    
    // Add material-specific texture effects
    if (config.material.category === 'wood') {
      addWoodGrainTexture(ctx, x, y, width, height, config.thickness.inches * 20);
    } else {
      addMetalTexture(ctx, x, y, width, height, config.thickness.inches * 20);
    }
  };
  frameImg.crossOrigin = 'anonymous';
  frameImg.src = config.material.photo_url!;
}

function addWoodGrainTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = 'rgba(139, 69, 19, 0.5)';
  ctx.lineWidth = 1;
  
  // Add wood grain lines
  for (let i = 0; i < width; i += 3) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + Math.random() * 2, y + height);
    ctx.stroke();
  }
  ctx.restore();
}

function addMetalTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.2;
  
  // Add brushed metal effect
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}