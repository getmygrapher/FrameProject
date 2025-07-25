import { PhotoInfo, FrameConfiguration } from "../types";

export function drawFramePreview(
  canvas: HTMLCanvasElement,
  photo: PhotoInfo,
  config: FrameConfiguration,
): void {
  // Add canvas reference for error handling
  const canvasRef = { current: canvas };
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Determine effective frame ratio based on orientation setting
  let effectiveFrameRatio = config.size.width / config.size.height;

  if (config.orientation === "landscape") {
    effectiveFrameRatio = Math.max(
      config.size.width / config.size.height,
      config.size.height / config.size.width,
    );
  } else if (config.orientation === "portrait") {
    effectiveFrameRatio = Math.min(
      config.size.width / config.size.height,
      config.size.height / config.size.width,
    );
  } else if (config.orientation === "auto" && photo) {
    // Use photo's orientation to determine frame orientation
    if (photo.orientation === "landscape") {
      effectiveFrameRatio = Math.max(
        config.size.width / config.size.height,
        config.size.height / config.size.width,
      );
    } else if (photo.orientation === "portrait") {
      effectiveFrameRatio = Math.min(
        config.size.width / config.size.height,
        config.size.height / config.size.width,
      );
    }
  }

  // Calculate frame dimensions
  const canvasRatio = canvasWidth / canvasHeight;

  let frameWidth, frameHeight;
  if (effectiveFrameRatio > canvasRatio) {
    frameWidth = canvasWidth * 0.8;
    frameHeight = frameWidth / effectiveFrameRatio;
  } else {
    frameHeight = canvasHeight * 0.8;
    frameWidth = frameHeight * effectiveFrameRatio;
  }

  const frameX = (canvasWidth - frameWidth) / 2;
  const frameY = (canvasHeight - frameHeight) / 2;

  // Draw frame shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
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

  // Calculate inner dimensions (accounting for frame thickness)
  const thicknessPx = config.thickness.inches * 20; // Convert inches to pixels for display

  const innerX = frameX + thicknessPx;
  const innerY = frameY + thicknessPx;
  const innerWidth = frameWidth - thicknessPx * 2;
  const innerHeight = frameHeight - thicknessPx * 2;

  // Calculate border (matting) dimensions - applied equally on all sides
  const borderPx = config.border.enabled ? config.border.width * 20 : 0;

  // Draw border if enabled - this creates the matting area
  if (config.border.enabled) {
    ctx.fillStyle = config.border.color;
    ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
  }

  // Calculate photo area - border is applied equally on all 4 sides
  const photoX = innerX + borderPx;
  const photoY = innerY + borderPx;
  const photoWidth = innerWidth - borderPx * 2; // Remove border from both left and right
  const photoHeight = innerHeight - borderPx * 2; // Remove border from both top and bottom

  // Draw photo with improved loading and error handling
  const img = new Image();
  img.onload = () => {
    // Ensure canvas context is still valid
    if (!ctx || !canvasRef.current) return;

    ctx.save();
    ctx.rect(photoX, photoY, photoWidth, photoHeight);
    ctx.clip();

    // Get the actual photo dimensions and orientation
    const actualPhotoRatio = img.width / img.height;
    const actualPhotoOrientation =
      actualPhotoRatio > 1 ? "landscape" : "portrait";

    // Determine if we need to rotate the photo based on orientation setting
    let useRotatedDimensions = false;
    if (
      config.orientation === "landscape" &&
      actualPhotoOrientation === "portrait"
    ) {
      useRotatedDimensions = true;
    } else if (
      config.orientation === "portrait" &&
      actualPhotoOrientation === "landscape"
    ) {
      useRotatedDimensions = true;
    }

    // Calculate effective photo ratio for scaling
    const effectivePhotoRatio = useRotatedDimensions
      ? 1 / actualPhotoRatio
      : actualPhotoRatio;
    const areaRatio = photoWidth / photoHeight;

    let baseWidth, baseHeight;
    if (effectivePhotoRatio > areaRatio) {
      baseHeight = photoHeight;
      baseWidth = baseHeight * effectivePhotoRatio;
    } else {
      baseWidth = photoWidth;
      baseHeight = baseWidth / effectivePhotoRatio;
    }

    // Apply zoom factor
    const drawWidth = baseWidth * config.zoom;
    const drawHeight = baseHeight * config.zoom;

    // Apply position offsets (convert percentage to pixels)
    const maxOffsetX = Math.max(0, (drawWidth - photoWidth) / 2);
    const maxOffsetY = Math.max(0, (drawHeight - photoHeight) / 2);
    const offsetX = (config.offsetX / 100) * maxOffsetX;
    const offsetY = (config.offsetY / 100) * maxOffsetY;

    // Calculate final position with offsets
    const drawX = photoX + (photoWidth - drawWidth) / 2 + offsetX;
    const drawY = photoY + (photoHeight - drawHeight) / 2 + offsetY;

    // Apply rotation if needed
    if (useRotatedDimensions) {
      ctx.save();
      const centerX = photoX + photoWidth / 2;
      const centerY = photoY + photoHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(Math.PI / 2); // 90 degrees
      ctx.translate(-centerX, -centerY);

      // Adjust draw position for rotation
      const rotatedDrawX = drawX + (drawWidth - drawHeight) / 2;
      const rotatedDrawY = drawY + (drawHeight - drawWidth) / 2;
      ctx.drawImage(img, rotatedDrawX, rotatedDrawY, drawHeight, drawWidth);
      ctx.restore();
    } else {
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }

    ctx.restore();
  };

  img.onerror = () => {
    console.error("Failed to load image for preview");
  };

  img.crossOrigin = "anonymous";
  img.src = photo.url;
}

function drawFrameWithPhoto(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  config: FrameConfiguration,
): void {
  const frameImg = new Image();
  frameImg.onload = () => {
    // Create a pattern from the frame photo
    const pattern = ctx.createPattern(frameImg, "repeat");
    if (pattern) {
      // Apply color tint if needed
      ctx.fillStyle = pattern;
      ctx.fillRect(x, y, width, height);

      // Apply color overlay for tinting
      if (config.color.hex !== "#FFFFFF") {
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = config.color.hex;
        ctx.fillRect(x, y, width, height);
        ctx.globalCompositeOperation = "source-over";
      }
    }

    // Add material-specific texture effects
    if (config.material.category === "wood") {
      addWoodGrainTexture(
        ctx,
        x,
        y,
        width,
        height,
        config.thickness.inches * 20,
      );
    } else {
      addMetalTexture(ctx, x, y, width, height, config.thickness.inches * 20);
    }
  };
  frameImg.crossOrigin = "anonymous";
  frameImg.src = config.material.photo_url!;
}

function addWoodGrainTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "rgba(139, 69, 19, 0.5)";
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
  thickness: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.2;

  // Add brushed metal effect
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}
