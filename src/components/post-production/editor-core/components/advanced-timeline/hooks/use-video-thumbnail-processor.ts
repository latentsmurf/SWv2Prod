import { useState, useEffect } from 'react';

interface ThumbnailData {
  thumbnails: string[];
  timestamps: number[];
  duration: number;
  width: number;
  height: number;
}

interface ThumbnailResult {
  data: ThumbnailData | null;
  isLoading: boolean;
  error: string | null;
}

interface ThumbnailOptions {
  thumbnailCount?: number;
  thumbnailSize?: number;
  fps?: number;
}

export function useVideoThumbnailProcessor(
  src: string | File | undefined,
  start: number = 0,
  end: number = 0,
  options: ThumbnailOptions = {}
): ThumbnailResult {
  const [data, setData] = useState<ThumbnailData | null>(null);

  useEffect(() => {
    if (!src) {
      setData(null);
      return;
    }
    // Mock data
    setData({
      thumbnails: [],
      timestamps: [],
      duration: 10,
      width: 120,
      height: 67
    });
  }, [src]);

  return {
    data,
    isLoading: false,
    error: null
  };
}

export function clearThumbnailCache(): void {
  // no-op
}