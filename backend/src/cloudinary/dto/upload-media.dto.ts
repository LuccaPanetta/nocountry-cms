export class UploadMediaDto {
  folder?: string;
  transformation?: any;
  tags?: string[];
  resource_type?: 'auto' | 'image' | 'video' | 'raw';
  // Opciones específicas para video
  videoTransformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    duration?: string;
  };
}

export class UploadVideoDto {
  folder?: string;
  transformation?: any;
  tags?: string[];
  videoTransformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    duration?: string;
    audio_codec?: string;
    video_codec?: string;
    bit_rate?: number;
  };
}