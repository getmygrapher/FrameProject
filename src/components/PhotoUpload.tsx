import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PhotoInfo } from '../types';

// Minimum resolution requirements for printing
const MIN_RESOLUTION = {
  width: 1500,
  height: 1500,
  dpi: 300
};

export default function PhotoUpload() {
  const { state, dispatch } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageLoadError('Please select a valid image file.');
      return;
    }

    setIsProcessing(true);
    setResolutionError(null);
    
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const orientation = height > width ? 'portrait' : width > height ? 'landscape' : 'square';
      const aspectRatio = width / height;

      // Check minimum resolution requirements
      const longestSide = Math.max(width, height);
      if (longestSide < MIN_RESOLUTION.width) {
        setResolutionError(
          `Image resolution too low for quality printing. Your image is ${width} × ${height} pixels. ` +
          `For best results, please upload an image with at least ${MIN_RESOLUTION.width} pixels on the longest side.`
        );
        setIsProcessing(false);
        URL.revokeObjectURL(url);
        return;
      }

      const photoInfo: PhotoInfo = {
        file,
        url,
        width,
        height,
        orientation,
        aspectRatio
      };

      dispatch({ type: 'SET_PHOTO', payload: photoInfo });
      dispatch({ type: 'SET_STEP', payload: 'customize' });
      setIsProcessing(false);
    };
    
    img.onerror = () => {
      setImageLoadError('Error loading image. Please try a different file.');
      setIsProcessing(false);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const removePhoto = () => {
    if (state.photo) {
      URL.revokeObjectURL(state.photo.url);
      dispatch({ type: 'SET_PHOTO', payload: null });
    }
    setResolutionError(null);
    setImageLoadError(null);
  };

  const getQualityIndicator = (width: number, height: number) => {
    const longestSide = Math.max(width, height);
    if (longestSide >= 3000) {
      return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-50', text: 'Excellent Quality' };
    } else if (longestSide >= 2000) {
      return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-50', text: 'Good Quality' };
    } else if (longestSide >= MIN_RESOLUTION.width) {
      return { level: 'acceptable', color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Acceptable Quality' };
    } else {
      return { level: 'poor', color: 'text-red-600', bg: 'bg-red-50', text: 'Too Low for Printing' };
    }
  };

  if (state.photo) {
    const quality = getQualityIndicator(state.photo.width, state.photo.height);
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Photo</h2>
          <button
            onClick={removePhoto}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <img
              src={state.photo.url}
              alt="Uploaded photo"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600">Dimensions</div>
              <div className="font-semibold text-gray-900">
                {state.photo.width} × {state.photo.height} px
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600">Orientation</div>
              <div className="font-semibold text-gray-900 capitalize">
                {state.photo.orientation}
              </div>
            </div>
          </div>

          {/* Quality Indicator */}
          <div className={`p-4 rounded-lg ${quality.bg} border border-opacity-20`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${quality.color.replace('text-', 'bg-')}`}></div>
              <span className={`font-semibold ${quality.color}`}>{quality.text}</span>
            </div>
            <div className="text-sm text-gray-600">
              {quality.level === 'excellent' && 'Perfect for large prints and professional framing.'}
              {quality.level === 'good' && 'Great for most frame sizes with crisp, clear results.'}
              {quality.level === 'acceptable' && 'Suitable for smaller to medium frame sizes.'}
              {quality.level === 'poor' && 'Resolution too low for quality printing. Please upload a higher resolution image.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photo</h2>
        <p className="text-gray-600">
          Drag and drop your image or click to browse
        </p>
      </div>

      {/* Error Banner for Image Load Errors */}
      {imageLoadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Image Load Error</h3>
              <p className="text-sm text-red-800">{imageLoadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Requirements Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Photo Quality Requirements</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• <strong>Minimum:</strong> {MIN_RESOLUTION.width} pixels on the longest side</div>
              <div>• <strong>Recommended:</strong> 2000+ pixels for best quality</div>
              <div>• <strong>Optimal:</strong> 3000+ pixels for professional results</div>
              <div>• <strong>Format:</strong> JPG, PNG, or other common image formats</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Error */}
      {resolutionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Resolution Too Low</h3>
              <p className="text-sm text-red-800">{resolutionError}</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className={`mx-auto p-4 rounded-full ${
                isDragOver ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {isDragOver ? (
                  <Upload size={32} className="text-blue-600" />
                ) : (
                  <ImageIcon size={32} className="text-gray-600" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {isDragOver ? 'Drop your photo here' : 'Choose a photo to frame'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, and other image formats
                </p>
              </div>
              
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <Upload size={20} className="mr-2" />
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="text-center">
          <div className="font-medium text-gray-900">High Resolution Required</div>
          <div>Minimum {MIN_RESOLUTION.width}px for quality printing</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">Any Orientation</div>
          <div>Portrait, landscape, or square - we'll help you find the perfect frame</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">Premium Quality</div>
          <div>Professional printing on archival paper with UV-resistant inks</div>
        </div>
      </div>
    </div>
  );
}