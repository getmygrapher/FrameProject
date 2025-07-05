import { useState, useEffect } from 'react';
import { FrameService } from '../services/frameService';
import { FrameMaterial, FrameSize, FrameThickness } from '../lib/supabase';

export function useFrameData() {
  const [materials, setMaterials] = useState<FrameMaterial[]>([]);
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [thickness, setThickness] = useState<FrameThickness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFrameData() {
      try {
        setLoading(true);
        setError(null);

        const [materialsData, sizesData, thicknessData] = await Promise.all([
          FrameService.getFrameMaterials(),
          FrameService.getFrameSizes(),
          FrameService.getFrameThickness()
        ]);

        setMaterials(materialsData);
        setSizes(sizesData);
        setThickness(thicknessData);
      } catch (err) {
        console.error('Error fetching frame data:', err);
        setError('Failed to load frame options. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchFrameData();
  }, []);

  const refetch = async () => {
    await fetchFrameData();
  };

  return {
    materials,
    sizes,
    thickness,
    loading,
    error,
    refetch
  };

  async function fetchFrameData() {
    try {
      setLoading(true);
      setError(null);

      const [materialsData, sizesData, thicknessData] = await Promise.all([
        FrameService.getFrameMaterials(),
        FrameService.getFrameSizes(),
        FrameService.getFrameThickness()
      ]);

      setMaterials(materialsData);
      setSizes(sizesData);
      setThickness(thicknessData);
    } catch (err) {
      console.error('Error fetching frame data:', err);
      setError('Failed to load frame options. Please try again.');
    } finally {
      setLoading(false);
    }
  }
}