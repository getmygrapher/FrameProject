import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Palette, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { FrameService } from '../../services/frameService';
import { FrameMaterial, FrameSize, FrameThickness } from '../../lib/supabase';

type TabType = 'materials' | 'sizes' | 'thickness';

export default function FrameManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  const [materials, setMaterials] = useState<FrameMaterial[]>([]);
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [thickness, setThickness] = useState<FrameThickness[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsData, sizesData, thicknessData] = await Promise.all([
        FrameService.getFrameMaterials(),
        FrameService.getFrameSizes(),
        FrameService.getFrameThickness()
      ]);
      
      setMaterials(materialsData);
      setSizes(sizesData);
      setThickness(thicknessData);
    } catch (error) {
      console.error('Error loading frame data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'materials', label: 'Materials', count: materials.length },
    { id: 'sizes', label: 'Sizes', count: sizes.length },
    { id: 'thickness', label: 'Thickness', count: thickness.length }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add New {activeTab.slice(0, -1)}
        </button>
      </div>

      {activeTab === 'materials' && (
        <MaterialsTab 
          materials={materials} 
          onEdit={setEditingItem}
          onRefresh={loadData}
        />
      )}
      
      {activeTab === 'sizes' && (
        <SizesTab 
          sizes={sizes} 
          onEdit={setEditingItem}
          onRefresh={loadData}
        />
      )}
      
      {activeTab === 'thickness' && (
        <ThicknessTab 
          thickness={thickness} 
          onEdit={setEditingItem}
          onRefresh={loadData}
        />
      )}

      {/* Add/Edit Modal */}
      {showAddForm && activeTab === 'materials' && (
        <AddMaterialModal
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function MaterialsTab({ materials, onEdit, onRefresh }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Multiplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Colors</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {materials.map((material) => (
            <tr key={material.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {material.photo_url ? (
                  <img
                    src={material.photo_url}
                    alt={material.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <ImageIcon size={20} className="text-gray-400" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {material.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">
                {material.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {material.price_multiplier}x
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-1">
                  {material.colors?.slice(0, 3).map((color) => (
                    <div
                      key={color.id}
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex_code }}
                      title={color.name}
                    />
                  ))}
                  {material.colors && material.colors.length > 3 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{material.colors.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(material)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SizesTab({ sizes, onEdit, onRefresh }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popular</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Multiplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sizes.map((size) => (
            <tr key={size.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {size.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {size.width}" × {size.height}"
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {size.display_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {size.is_popular ? (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Popular
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {size.price_multiplier}x
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(size)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThicknessTab({ thickness, onEdit, onRefresh }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inches</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Multiplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {thickness.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {item.inches}"
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {item.price_multiplier}x
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddMaterialModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'wood' as 'wood' | 'metal',
    texture: '',
    price_multiplier: 1.0,
    colors: [{ name: '', hex_code: '#000000', price_multiplier: 1.0 }]
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setPhotoFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (index: number, field: string, value: string | number) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', hex_code: '#000000', price_multiplier: 1.0 }]
    }));
  };

  const removeColor = (index: number) => {
    if (formData.colors.length > 1) {
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.texture) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.colors.some(color => !color.name || !color.hex_code)) {
        throw new Error('Please complete all color information');
      }

      if (!photoFile) {
        throw new Error('Please upload a frame photo');
      }

      // Create the material with photo
      await FrameService.createFrameMaterialWithPhoto(formData, photoFile);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating material:', error);
      setError(error.message || 'Failed to create material');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add New Frame Material</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3" role="alert">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frame Photo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {photoPreview ? (
                <div className="text-center">
                  <img
                    src={photoPreview}
                    alt="Frame preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                  <div className="text-sm text-gray-600 mb-4">
                    Upload a high-quality photo of the frame material
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose Photo
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: High-resolution image (min 800x600px), max 5MB
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Premium Oak"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'wood' | 'metal' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="wood">Wood</option>
                <option value="metal">Metal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texture *
              </label>
              <input
                type="text"
                value={formData.texture}
                onChange={(e) => setFormData(prev => ({ ...prev, texture: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., wood-grain-light"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Multiplier *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={formData.price_multiplier}
                onChange={(e) => setFormData(prev => ({ ...prev, price_multiplier: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Available Colors *
              </label>
              <button
                type="button"
                onClick={addColor}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Color
              </button>
            </div>

            <div className="space-y-3">
              {formData.colors.map((color, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    placeholder="Color name"
                    value={color.name}
                    onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex_code}
                      onChange={(e) => handleColorChange(index, 'hex_code', e.target.value)}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color.hex_code}
                      onChange={(e) => handleColorChange(index, 'hex_code', e.target.value)}
                      className="w-20 px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#000000"
                    />
                  </div>

                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={color.price_multiplier}
                    onChange={(e) => handleColorChange(index, 'price_multiplier', parseFloat(e.target.value))}
                    className="w-20 px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1.0"
                  />

                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}