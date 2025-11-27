
export interface ThumbnailOptions {
  width?: number;
  height?: number;
  timestampSeconds?: number;
  quality?: number;
}

export class MediaBunnyThumbnailService {
  static async generateThumbnail(
    file: File,
    options: ThumbnailOptions = {}
  ): Promise<string> {
    console.warn("MediaBunnyThumbnailService is mocked. Returning placeholder.");
    return "";
  }

  static async generateMultipleThumbnails(
    file: File,
    timestamps: number[],
    options: ThumbnailOptions = {}
  ): Promise<string[]> {
    console.warn("MediaBunnyThumbnailService is mocked. Returning placeholders.");
    return timestamps.map(() => "");
  }

  static async getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    codec: string | null;
    canDecode: boolean;
  }> {
    console.warn("MediaBunnyThumbnailService is mocked. Returning dummy metadata.");
    return {
      duration: 10,
      width: 1920,
      height: 1080,
      codec: "h264",
      canDecode: true,
    };
  }

  static async canProcessFile(file: File): Promise<boolean> {
    return true;
  }
}