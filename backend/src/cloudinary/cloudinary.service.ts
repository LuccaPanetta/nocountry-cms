import { Injectable, BadRequestException } from '@nestjs/common';
import { 
  UploadApiResponse, 
  UploadApiOptions, 
  DeleteApiResponse, 
  v2 as cloudinary
} from 'cloudinary';
import { UploadMediaDto, UploadVideoDto } from './dto/upload-media.dto';
import { VideoUploadResponse, VideoTransformationOptions } from './interfaces/cloudinary-response.interface';
import * as stream from 'stream';

@Injectable()
export class CloudinaryService {
  
  // ========== MÉTODOS PARA IMÁGENES (EXISTENTES) ==========
  
  async uploadImage(
    fileBuffer: Buffer,
    options: UploadMediaDto = {},
  ): Promise<UploadApiResponse> {
    return this.uploadMedia(fileBuffer, {
      ...options,
      resource_type: 'image',
    });
  }

  async uploadImageFromUrl(
    imageUrl: string,
    options: UploadMediaDto = {},
  ): Promise<UploadApiResponse> {
    return this.uploadMediaFromUrl(imageUrl, {
      ...options,
      resource_type: 'image',
    });
  }

  // ========== MÉTODOS PARA VIDEOS (NUEVOS) ==========

  /**
   * Subir video desde buffer
   */
  async uploadVideo(
    fileBuffer: Buffer,
    options: UploadVideoDto = {},
  ): Promise<VideoUploadResponse> {
    const uploadOptions: UploadApiOptions = {
      resource_type: 'video',
      folder: options.folder || 'videos',
      tags: options.tags,
    };

    // Aplicar transformaciones específicas de video si existen
    if (options.videoTransformation) {
      uploadOptions.transformation = [
        {
          ...options.videoTransformation,
        },
      ];
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new BadRequestException(`Error uploading video: ${error.message}`));
          } else if (!result) {
            reject(new BadRequestException('No result from Cloudinary upload'));
          } else {
            // ✅ CORRECCIÓN: Cast a VideoUploadResponse
            resolve(result as unknown as VideoUploadResponse);
          }
        },
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Subir video desde URL
   */
  async uploadVideoFromUrl(
    videoUrl: string,
    options: UploadVideoDto = {},
  ): Promise<VideoUploadResponse> {
    try {
      const uploadOptions: UploadApiOptions = {
        resource_type: 'video',
        folder: options.folder || 'videos',
        tags: options.tags,
      };

      if (options.videoTransformation) {
        uploadOptions.transformation = [
          {
            ...options.videoTransformation,
          },
        ];
      }

      // ✅ CORRECCIÓN: Cast a VideoUploadResponse
      const result = await cloudinary.uploader.upload(videoUrl, uploadOptions);
      return result as unknown as VideoUploadResponse;
    } catch (error) {
      throw new BadRequestException(`Error uploading video from URL: ${error.message}`);
    }
  }

  /**
   * Método genérico para subir cualquier tipo de medio
   */
  async uploadMedia(
    fileBuffer: Buffer,
    options: UploadMediaDto = {},
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        resource_type: options.resource_type || 'auto',
        folder: options.folder || 'media',
        transformation: options.transformation,
        tags: options.tags,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new BadRequestException(`Error uploading media: ${error.message}`));
          } else if (!result) {
            reject(new BadRequestException('No result from Cloudinary upload'));
          } else {
            resolve(result);
          }
        },
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Método genérico para subir desde URL
   */
  async uploadMediaFromUrl(
    mediaUrl: string,
    options: UploadMediaDto = {},
  ): Promise<UploadApiResponse> {
    try {
      const uploadOptions: UploadApiOptions = {
        resource_type: options.resource_type || 'auto',
        folder: options.folder || 'media',
        transformation: options.transformation,
        tags: options.tags,
      };

      return await cloudinary.uploader.upload(mediaUrl, uploadOptions);
    } catch (error) {
      throw new BadRequestException(`Error uploading media from URL: ${error.message}`);
    }
  }

  // ========== MÉTODOS DE ELIMINACIÓN ==========

  async deleteImage(publicId: string): Promise<DeleteApiResponse> {
    return this.deleteMedia(publicId, 'image');
  }

  async deleteVideo(publicId: string): Promise<DeleteApiResponse> {
    return this.deleteMedia(publicId, 'video');
  }

  /**
   * Eliminar cualquier tipo de medio
   */
  async deleteMedia(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<DeleteApiResponse> {
    try {
      return await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      throw new BadRequestException(`Error deleting media: ${error.message}`);
    }
  }

  async deleteMultipleImages(publicIds: string[]): Promise<any> {
    return this.deleteMultipleMedia(publicIds, 'image');
  }

  async deleteMultipleVideos(publicIds: string[]): Promise<any> {
    return this.deleteMultipleMedia(publicIds, 'video');
  }

  async deleteMultipleMedia(publicIds: string[], resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<any> {
    try {
      return await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });
    } catch (error) {
      throw new BadRequestException(`Error deleting multiple media: ${error.message}`);
    }
  }

  // ========== MÉTODOS DE LISTADO Y CONSULTA ==========

  async listImages(folder: string = 'images', maxResults: number = 10) {
    return this.listResources(folder, maxResults, 'image');
  }

  async listVideos(folder: string = 'videos', maxResults: number = 10) {
    return this.listResources(folder, maxResults, 'video');
  }

  async listResources(folder: string = 'media', maxResults: number = 10, resourceType: 'image' | 'video' | 'raw' = 'image') {
    try {
      return await cloudinary.api.resources({
        type: 'upload',
        resource_type: resourceType,
        prefix: folder,
        max_results: maxResults,
      });
    } catch (error) {
      throw new BadRequestException(`Error listing resources: ${error.message}`);
    }
  }

  async getImageInfo(publicId: string) {
    return this.getResourceInfo(publicId, 'image');
  }

  async getVideoInfo(publicId: string) {
    return this.getResourceInfo(publicId, 'video');
  }

  async getResourceInfo(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
    try {
      return await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      throw new BadRequestException(`Error getting resource info: ${error.message}`);
    }
  }

  // ========== MÉTODOS DE TRANSFORMACIÓN ==========

  generateImageUrl(publicId: string, transformations: any = {}) {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    });
  }

  /**
   * Generar URL de video con transformaciones
   */
  generateVideoUrl(publicId: string, transformations: VideoTransformationOptions = {}) {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      ...transformations,
      secure: true,
    });
  }

  /**
   * Generar thumbnail desde video
   */
  generateVideoThumbnail(publicId: string, timeOffset: string = '00:00:01') {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        {
          start_offset: timeOffset,
        },
        {
          format: 'jpg',
        },
      ],
      secure: true,
    });
  }

  /**
   * Generar URL de video optimizado para streaming
   */
  generateStreamingUrl(publicId: string, quality: string = 'auto') {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        {
          quality: quality,
          format: 'mp4',
        },
      ],
      secure: true,
    });
  }

  // ========== MÉTODOS DE GESTIÓN ==========

  async purgeImageFolder(folder: string): Promise<any> {
    return this.purgeFolder(folder, 'image');
  }

  async purgeVideoFolder(folder: string): Promise<any> {
    return this.purgeFolder(folder, 'video');
  }

  async purgeFolder(folder: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<any> {
    try {
      const resources = await cloudinary.api.resources({
        type: 'upload',
        resource_type: resourceType,
        prefix: folder,
        max_results: 100,
      });

      if (resources.resources.length === 0) {
        return { message: 'Folder is already empty' };
      }

      const publicIds = resources.resources.map(resource => resource.public_id);
      const deleteResult = await this.deleteMultipleMedia(publicIds, resourceType);
      
      return {
        message: `Folder ${folder} purged successfully`,
        deleted: publicIds.length,
        resource_type: resourceType,
        details: deleteResult,
      };
    } catch (error) {
      throw new BadRequestException(`Error purging folder: ${error.message}`);
    }
  }

  // ========== MÉTODOS DE FIRMAS Y UPLOAD DIRECTO ==========

  generateImageUploadSignature(folder: string = 'images') {
    return this.generateUploadSignature(folder, 'image');
  }

  generateVideoUploadSignature(folder: string = 'videos') {
    return this.generateUploadSignature(folder, 'video');
  }

  generateUploadSignature(folder: string = 'media', resourceType: 'image' | 'video' = 'image') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // ✅ CORRECCIÓN: Verificar que la API_SECRET existe
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      throw new BadRequestException('CLOUDINARY_API_SECRET is not configured');
    }
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: resourceType,
      },
      apiSecret, // ✅ Ahora es string, no string | undefined
    );

    return {
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
      resource_type: resourceType,
    };
  }

  // ========== MÉTODOS ADICIONALES PARA VIDEO ==========

  /**
 * Generar sprite de video (thumbnails grid)
 * Cloudinary genera sprites automáticamente al subir videos
 * Este método obtiene la URL del sprite ya generado
 */
async createVideoSprite(publicId: string, options: any = {}): Promise<string> {
  try {
    // Cloudinary genera automáticamente sprites para videos
    // Solo necesitamos construir la URL del sprite
    const spriteUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        {
          format: 'jpg',
          variables: [
            ['$gs', '!'], // Force sprite generation
          ],
        },
      ],
      ...options,
      secure: true,
    });

    return spriteUrl;
  } catch (error) {
    throw new BadRequestException(`Error generating video sprite: ${error.message}`);
  }
}

/**
 * Generar URL de video con overlay de thumbnail
 */
generateVideoWithThumbnailOverlay(publicId: string, timeOffset: string = '00:00:01'): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      {
        overlay: {
          resource_type: 'video',
          public_id: publicId,
          format: 'jpg',
          start_offset: timeOffset,
        },
      },
      { flags: 'splice' },
    ],
    secure: true,
  });
}

/**
 * Obtener información extendida del video incluyendo sprites
 */
async getVideoDetailedInfo(publicId: string): Promise<any> {
  try {
    const resourceInfo = await cloudinary.api.resource(publicId, {
      resource_type: 'video',
      image_metadata: true,
      colors: true,
      faces: true,
      quality_analysis: true,
    });

    // Generar URL del sprite automáticamente
    const spriteUrl = await this.createVideoSprite(publicId);

    return {
      ...resourceInfo,
      sprite_url: spriteUrl,
      thumbnail_url: this.generateVideoThumbnail(publicId),
      streaming_url: this.generateStreamingUrl(publicId),
    };
  } catch (error) {
    throw new BadRequestException(`Error getting video detailed info: ${error.message}`);
  }
}

/**
 * Extraer audio de un video
 */
generateAudioExtractUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      {
        flags: 'waveform',
      },
    ],
    secure: true,
  });
}
}