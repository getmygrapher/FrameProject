import { supabase, FrameMaterial, FrameColor, FrameSize, FrameThickness } from '../lib/supabase';

export class FrameService {
  // Fetch all frame materials with their colors
  static async getFrameMaterials(): Promise<FrameMaterial[]> {
    const { data, error } = await supabase
      .from('frame_materials')
      .select(`
        *,
        colors:frame_colors(*)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching frame materials:', error);
      throw error;
    }

    return data || [];
  }

  // Fetch all frame sizes
  static async getFrameSizes(): Promise<FrameSize[]> {
    const { data, error } = await supabase
      .from('frame_sizes')
      .select('*')
      .order('price_multiplier');

    if (error) {
      console.error('Error fetching frame sizes:', error);
      throw error;
    }

    return data || [];
  }

  // Fetch all frame thickness options
  static async getFrameThickness(): Promise<FrameThickness[]> {
    const { data, error } = await supabase
      .from('frame_thickness')
      .select('*')
      .order('inches');

    if (error) {
      console.error('Error fetching frame thickness:', error);
      throw error;
    }

    return data || [];
  }

  // Upload frame photo to storage
  static async uploadFramePhoto(file: File, materialId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${materialId}-${Date.now()}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('frame-photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading frame photo:', uploadError);
      throw new Error('Failed to upload frame photo');
    }

    // Get public URL
    const { data } = supabase.storage
      .from('frame-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Create frame material with photo
  static async createFrameMaterialWithPhoto(
    materialData: {
      name: string;
      category: 'wood' | 'metal';
      texture: string;
      price_multiplier: number;
      colors: Array<{
        name: string;
        hex_code: string;
        price_multiplier: number;
      }>;
    },
    photoFile: File
  ): Promise<FrameMaterial> {
    try {
      // First create the material record
      const { data: material, error: materialError } = await supabase
        .from('frame_materials')
        .insert({
          name: materialData.name,
          category: materialData.category,
          texture: materialData.texture,
          price_multiplier: materialData.price_multiplier
        })
        .select()
        .single();

      if (materialError) {
        console.error('Error creating frame material:', materialError);
        throw new Error('Failed to create frame material');
      }

      // Upload the photo
      const photoUrl = await this.uploadFramePhoto(photoFile, material.id);

      // Update material with photo URL
      const { data: updatedMaterial, error: updateError } = await supabase
        .from('frame_materials')
        .update({ photo_url: photoUrl })
        .eq('id', material.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating material with photo:', updateError);
        throw new Error('Failed to update material with photo');
      }

      // Create colors
      const colorsWithMaterialId = materialData.colors.map(color => ({
        ...color,
        material_id: material.id
      }));

      const { error: colorsError } = await supabase
        .from('frame_colors')
        .insert(colorsWithMaterialId);

      if (colorsError) {
        console.error('Error creating frame colors:', colorsError);
        throw new Error('Failed to create frame colors');
      }

      return updatedMaterial;
    } catch (error) {
      console.error('Error in createFrameMaterialWithPhoto:', error);
      throw error;
    }
  }

  // Admin functions for managing frame materials
  static async createFrameMaterial(material: Omit<FrameMaterial, 'id' | 'created_at' | 'updated_at'>): Promise<FrameMaterial> {
    const { data, error } = await supabase
      .from('frame_materials')
      .insert(material)
      .select()
      .single();

    if (error) {
      console.error('Error creating frame material:', error);
      throw error;
    }

    return data;
  }

  static async updateFrameMaterial(id: string, updates: Partial<FrameMaterial>): Promise<FrameMaterial> {
    const { data, error } = await supabase
      .from('frame_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating frame material:', error);
      throw error;
    }

    return data;
  }

  static async deleteFrameMaterial(id: string): Promise<void> {
    const { error } = await supabase
      .from('frame_materials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting frame material:', error);
      throw error;
    }
  }

  // Admin functions for managing frame colors
  static async createFrameColor(color: Omit<FrameColor, 'id' | 'created_at'>): Promise<FrameColor> {
    const { data, error } = await supabase
      .from('frame_colors')
      .insert(color)
      .select()
      .single();

    if (error) {
      console.error('Error creating frame color:', error);
      throw error;
    }

    return data;
  }

  static async updateFrameColor(id: string, updates: Partial<FrameColor>): Promise<FrameColor> {
    const { data, error } = await supabase
      .from('frame_colors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating frame color:', error);
      throw error;
    }

    return data;
  }

  static async deleteFrameColor(id: string): Promise<void> {
    const { error } = await supabase
      .from('frame_colors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting frame color:', error);
      throw error;
    }
  }

  // Admin functions for managing frame sizes
  static async createFrameSize(size: Omit<FrameSize, 'id' | 'created_at'>): Promise<FrameSize> {
    const { data, error } = await supabase
      .from('frame_sizes')
      .insert(size)
      .select()
      .single();

    if (error) {
      console.error('Error creating frame size:', error);
      throw error;
    }

    return data;
  }

  static async updateFrameSize(id: string, updates: Partial<FrameSize>): Promise<FrameSize> {
    const { data, error } = await supabase
      .from('frame_sizes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating frame size:', error);
      throw error;
    }

    return data;
  }

  static async deleteFrameSize(id: string): Promise<void> {
    const { error } = await supabase
      .from('frame_sizes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting frame size:', error);
      throw error;
    }
  }

  // Admin functions for managing frame thickness
  static async createFrameThickness(thickness: Omit<FrameThickness, 'id' | 'created_at'>): Promise<FrameThickness> {
    const { data, error } = await supabase
      .from('frame_thickness')
      .insert(thickness)
      .select()
      .single();

    if (error) {
      console.error('Error creating frame thickness:', error);
      throw error;
    }

    return data;
  }

  static async updateFrameThickness(id: string, updates: Partial<FrameThickness>): Promise<FrameThickness> {
    const { data, error } = await supabase
      .from('frame_thickness')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating frame thickness:', error);
      throw error;
    }

    return data;
  }

  static async deleteFrameThickness(id: string): Promise<void> {
    const { error } = await supabase
      .from('frame_thickness')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting frame thickness:', error);
      throw error;
    }
  }
}