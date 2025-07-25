import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Palette,
  Ruler,
  Settings,
  ZoomIn,
  RotateCw,
  Move,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { FrameService } from "../services/frameService";
import { FrameMaterial, FrameSize, FrameThickness } from "../lib/supabase";
import { borderColors, borderWidthOptions } from "../data/frameOptions";

export default function FrameCustomizer() {
  const { state, dispatch } = useApp();
  const [materials, setMaterials] = useState<FrameMaterial[]>([]);
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [thickness, setThickness] = useState<FrameThickness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFrameData();
  }, []);

  const loadFrameData = async () => {
    try {
      const [materialsData, sizesData, thicknessData] = await Promise.all([
        FrameService.getFrameMaterials(),
        FrameService.getFrameSizes(),
        FrameService.getFrameThickness(),
      ]);

      setMaterials(materialsData);
      setSizes(sizesData);
      setThickness(thicknessData);

      // Use product selections if available, otherwise set defaults
      if (state.productSelections.material && state.productSelections.color) {
        updateConfig({
          material: state.productSelections.material,
          color: state.productSelections.color,
        });
      } else if (materialsData.length > 0 && !state.frameConfig.material.id) {
        const defaultMaterial = materialsData[0];
        const defaultColor = defaultMaterial.colors?.[0];
        if (defaultColor) {
          updateConfig({
            material: defaultMaterial,
            color: defaultColor,
          });
        }
      }

      if (state.productSelections.size) {
        updateConfig({ size: state.productSelections.size });
      } else if (sizesData.length > 0 && !state.frameConfig.size.id) {
        const defaultSize = sizesData.find((s) => s.is_popular) || sizesData[0];
        updateConfig({ size: defaultSize });
      }

      if (thicknessData.length > 0 && !state.frameConfig.thickness.id) {
        const defaultThickness =
          thicknessData.find((t) => t.name === '1/2"') || thicknessData[0];
        updateConfig({ thickness: defaultThickness });
      }
    } catch (error) {
      console.error("Error loading frame data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: any) => {
    dispatch({ type: "UPDATE_FRAME_CONFIG", payload: updates });
  };

  const goBack = () => {
    dispatch({ type: "SET_STEP", payload: "upload" });
  };

  const availableSizes = sizes.filter((size) => {
    if (!state.photo || size.name === "custom") return true;

    const photoRatio = state.photo.aspectRatio;
    const sizeRatio = size.width / size.height;

    // Allow sizes that are reasonably close to the photo's aspect ratio
    return (
      Math.abs(photoRatio - sizeRatio) < 0.5 ||
      Math.abs(photoRatio - 1 / sizeRatio) < 0.5
    );
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
      <div className="border-b border-gray-200 p-6 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Customize Your Frame
            </h2>
            <p className="text-gray-600">
              Choose the perfect frame for your photo
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Frame Size */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Ruler size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Frame Size</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => updateConfig({ size })}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all duration-200 hover:shadow-md
                  ${
                    state.frameConfig.size?.id === size.id
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }
                  ${size.is_popular ? "ring-2 ring-amber-400 ring-opacity-50" : ""}
                `}
              >
                <div className="font-semibold">{size.display_name}</div>
                {size.is_popular && (
                  <div className="text-xs text-amber-600 font-medium mt-1">
                    Popular
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Thickness */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thickness</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {thickness.map((thicknessOption) => (
              <button
                key={thicknessOption.id}
                onClick={() => updateConfig({ thickness: thicknessOption })}
                className={`
                  p-3 rounded-lg border-2 text-center transition-all duration-200
                  ${
                    state.frameConfig.thickness?.id === thicknessOption.id
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="font-semibold">{thicknessOption.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Orientation */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RotateCw size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Orientation</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "auto",
                label: "Auto",
                description: "Match photo orientation",
              },
              {
                value: "landscape",
                label: "Landscape",
                description: "Force horizontal",
              },
              {
                value: "portrait",
                label: "Portrait",
                description: "Force vertical",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateConfig({ orientation: option.value })}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all duration-200 hover:shadow-md
                  ${
                    state.frameConfig.orientation === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Zoom & Position */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <ZoomIn size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Photo Adjustment
            </h3>
          </div>

          {/* Zoom Control */}
          <div className="space-y-4 mb-6">
            <h4 className="text-md font-medium text-gray-800">Zoom Level</h4>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 min-w-[60px]">
                Zoom Out
              </span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={state.frameConfig.zoom}
                onChange={(e) =>
                  updateConfig({ zoom: parseFloat(e.target.value) })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-600 min-w-[60px]">
                Zoom In
              </span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700">
                {Math.round(state.frameConfig.zoom * 100)}% zoom
              </span>
            </div>
          </div>

          {/* Position Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Move size={18} className="text-blue-600" />
              <h4 className="text-md font-medium text-gray-800">
                Photo Position
              </h4>
            </div>

            {/* Horizontal Position */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Horizontal Position
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 min-w-[40px]">Left</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="5"
                  value={state.frameConfig.offsetX}
                  onChange={(e) =>
                    updateConfig({ offsetX: parseFloat(e.target.value) })
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-600 min-w-[40px]">
                  Right
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-600">
                  {state.frameConfig.offsetX > 0 ? "+" : ""}
                  {state.frameConfig.offsetX}%
                </span>
              </div>
            </div>

            {/* Vertical Position */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Vertical Position
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 min-w-[40px]">Up</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="5"
                  value={state.frameConfig.offsetY}
                  onChange={(e) =>
                    updateConfig({ offsetY: parseFloat(e.target.value) })
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-600 min-w-[40px]">Down</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-600">
                  {state.frameConfig.offsetY > 0 ? "+" : ""}
                  {state.frameConfig.offsetY}%
                </span>
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center pt-2">
              <button
                onClick={() =>
                  updateConfig({ offsetX: 0, offsetY: 0, zoom: 1.0 })
                }
                className="text-sm bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Reset Position & Zoom
              </button>
            </div>
          </div>
        </div>

        {/* Border Options */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 border-2 border-blue-600 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 border border-blue-400 rounded-sm"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Border (Matting)
            </h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={state.frameConfig.border.enabled}
                onChange={(e) =>
                  updateConfig({
                    border: {
                      ...state.frameConfig.border,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">
                Add border matting (applied equally on all sides)
              </span>
            </label>

            {state.frameConfig.border.enabled && (
              <div className="grid grid-cols-2 gap-6 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Width (all sides)
                  </label>
                  <select
                    value={state.frameConfig.border.width}
                    onChange={(e) =>
                      updateConfig({
                        border: {
                          ...state.frameConfig.border,
                          width: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {borderWidthOptions.map((width) => (
                      <option key={width} value={width}>
                        {width}" on all sides
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {borderColors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() =>
                          updateConfig({
                            border: {
                              ...state.frameConfig.border,
                              color: color.hex,
                            },
                          })
                        }
                        className={`
                          w-8 h-8 rounded-md border-2 transition-all duration-200
                          ${
                            state.frameConfig.border.color === color.hex
                              ? "border-blue-500 shadow-lg scale-110"
                              : "border-gray-300 hover:border-gray-400"
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
