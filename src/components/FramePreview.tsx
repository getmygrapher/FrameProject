import React, { useRef, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { drawFramePreview } from "../utils/canvas";

export default function FramePreview() {
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced drawing function to prevent blinking
  const debouncedDraw = useCallback(() => {
    if (drawTimeoutRef.current) {
      clearTimeout(drawTimeoutRef.current);
    }

    drawTimeoutRef.current = setTimeout(() => {
      if (canvasRef.current && state.photo) {
        drawFramePreview(canvasRef.current, state.photo, state.frameConfig);
      }
    }, 50); // 50ms debounce to prevent excessive redraws
  }, [state.photo, state.frameConfig]);

  useEffect(() => {
    debouncedDraw();

    // Cleanup timeout on unmount
    return () => {
      if (drawTimeoutRef.current) {
        clearTimeout(drawTimeoutRef.current);
      }
    };
  }, [debouncedDraw]);

  if (!state.photo) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Live Preview
        </h3>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full max-w-md mx-auto rounded-lg shadow-md bg-gray-50"
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
            {state.frameConfig.size.displayName}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600">Material</div>
            <div className="font-semibold text-gray-900">
              {state.frameConfig.material.name}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600">Color</div>
            <div className="font-semibold text-gray-900">
              {state.frameConfig.color.name}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600">Zoom</div>
            <div className="font-semibold text-gray-900">
              {Math.round(state.frameConfig.zoom * 100)}%
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600">Position</div>
            <div className="font-semibold text-gray-900 text-xs">
              X: {state.frameConfig.offsetX > 0 ? "+" : ""}
              {state.frameConfig.offsetX}%<br />
              Y: {state.frameConfig.offsetY > 0 ? "+" : ""}
              {state.frameConfig.offsetY}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
