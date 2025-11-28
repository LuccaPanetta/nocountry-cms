export interface CloudinaryResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: 'image' | 'video' | 'raw';
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
}

// Extender la interfaz base para upload response
export interface UploadApiResponse extends CloudinaryResponse {
  [key: string]: any;
}

export interface DeleteApiResponse {
  result: string;
}

// Interfaces específicas para video que extienden la base
export interface VideoUploadResponse extends UploadApiResponse {
  duration?: number;
  bit_rate?: number;
  frame_rate?: number;
  nb_frames?: number;
  audio?: {
    codec: string;
    bit_rate: string;
    frequency: number;
    channels: number;
    channel_layout: string;
  };
  video?: {
    pix_format: string;
    codec: string;
    level: number;
    bit_rate: string;
    time_base: string;
  };
  // Hacer las propiedades opcionales para mayor compatibilidad
  [key: string]: any;
}

export interface VideoTransformationOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
  duration?: string;
  start_offset?: string;
  end_offset?: string;
  audio_codec?: string;
  video_codec?: string;
  bit_rate?: number;
  fps?: number;
}