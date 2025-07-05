import React, { useState, useEffect } from 'react';
import { ArrowLeft, Palette, Ruler, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FrameService } from '../services/frameService';
import { FrameMaterial, FrameSize, FrameThickness } from '../lib/supabase';
import { borderColors, borderWidthOptions } from '../data/frameOptions';

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
        FrameService.getFrameThickness()
      ]);

      setMaterials(materialsData);
      setSizes(sizesData);
      setThickness(thicknessData);

      // Set default selections if not already set
      if (materialsData.length > 0 && !state.frameConfig.material.id) {
        const defaultMaterial = materialsData[0];
        const defaultColor = defaultMaterial.colors?.[0];
        if (defaultColor) {
          updateConfig({ 
            material: defaultMaterial, 
            color: defaultColor 
          });
        }
      }

      if (sizesData.length > 0 && !state.frameConfig.size.id) {
        const defaultSize = sizesData.find(s => s.is_popular) || sizesData[0];
        updateConfig({ size: defaultSize });
      }

      if (thicknessData.length > 0 && !state.frameConfig.thickness.id) {
        const defaultThickness = thicknessData.find(t => t.name === '1/2"') || thicknessData[0];
        updateConfig({ thickness: defaultThickness });
      }
    } catch (error) {
      console.error('Error loading frame data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: any) => {
    dispatch({ type: 'UPDATE_FRAME_CONFIG', payload: updates });
  };

  const goBack = () => {
    dispatch({ type: 'SET_STEP', payload: 'upload' });
  };

  const availableSizes = sizes.filter(size => {
    if (!state.photo || size.name === 'custom') return true;
    
    const photoRatio = state.photo.aspectRatio;
    const sizeRatio = size.width / size.height;
    
    // Allow sizes that are reasonably close to the photo's aspect ratio
    return Math.abs(photoRatio - sizeRatio) < 0.5 || Math.abs(photoRatio - (1/sizeRatio)) < 0.5;
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
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Customize Your Frame</h2>
            <p className="text-gray-600">Choose the perfect frame for your photo</p>
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
                  ${state.frameConfig.size?.id === size.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${size.is_popular ? 'ring-2 ring-amber-400 ring-opacity-50' : ''}
                `}
              >
                <div className="font-semibold">{size.display_name}</div>
                {size.is_popular && (
                  <div className="text-xs text-amber-600 font-medium mt-1">Popular</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Material */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Material</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {materials.map((material) => (
              <button
                key={material.id}
                onClick={() => updateConfig({ 
                  material, 
                  color: material.colors?.[0] || { id: '', name: 'Default', hex_code: '#8B4513', price_multiplier: 1.0 }
                })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md
                  ${state.frameConfig.material?.id === material.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  {material.photo_url ? (
                    <img
                      src={material.photo_url}
                      alt={material.name}
                      className="w-12 h-12 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <Settings size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{material.name}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {material.category} Frame
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Frame Color */}
        {state.frameConfig.material?.colors && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Color</h3>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {state.frameConfig.material.colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => updateConfig({ color })}
                  className={`
                    group relative p-3 rounded-lg border-2 transition-all duration-200
                    ${state.frameConfig.color?.id === color.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div
                    className="w-full h-12 rounded-md mb-2 shadow-sm"
                    style={{ backgroundColor: color.hex_code }}
                  />
                  <div className="text-xs font-medium text-gray-900 text-center">
                    {color.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
                  ${state.frameConfig.thickness?.id === thicknessOption.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-semibold">{thicknessOption.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Border Options */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 border-2 border-blue-600 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 border border-blue-400 rounded-sm"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Border (Matting)</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={state.frameConfig.border.enabled}
                onChange={(e) => updateConfig({
                  border: { ...state.frameConfig.border, enabled: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">Add border matting</span>
            </label>

            {state.frameConfig.border.enabled && (
              <div className="grid grid-cols-2 gap-6 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Width
                  </label>
                  <select
                    value={state.frameConfig.border.width}
                    onChange={(e) => updateConfig({
                      border: { ...state.frameConfig.border, width: parseFloat(e.target.value) }
                    })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {borderWidthOptions.map((width) => (
                      <option key={width} value={width}>
                        {width}"
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
                        onClick={() => updateConfig({
                          border: { ...state.frameConfig.border, color: color.hex }
                        })}
                        className={`
                          w-8 h-8 rounded-md border-2 transition-all duration-200
                          ${state.frameConfig.border.color === color.hex
                            ? 'border-blue-500 shadow-lg scale-110'
                            : 'border-gray-300 hover:border-gray-400'
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