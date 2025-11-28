import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { 
  UploadApiResponse, 
  DeleteApiResponse, 
  v2 as cloudinary
} from 'cloudinary';
import * as stream from 'stream';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

@Injectable()
export class CloudinaryMediaService {
  private readonly logger = new Logger(CloudinaryMediaService.name);

  /**
   * Subir archivo multimedia
   */
  async uploadMedia(
    fileBuffer: Buffer,
    testimonioId: string,
    tipo: MediaType,
    descripcion?: string
  ): Promise<{
    media: UploadApiResponse;
    urls: {
      original: string;
      optimized: string;
      thumbnail?: string;
    };
  }> {
    const folder = `testimonios/${testimonioId}/${tipo.toLowerCase()}s`;
    const tags = ['testimonio', `testimonio-${testimonioId}`, tipo.toLowerCase()];

    try {
      let result: UploadApiResponse;

      if (tipo === MediaType.IMAGE) {
        result = await this.uploadImage(fileBuffer, folder, tags);
      } else {
        result = await this.uploadVideo(fileBuffer, folder, tags);
      }

      const urls = this.generateMediaUrls(result.public_id, tipo);

      return {
        media: result,
        urls
      };

    } catch (error) {
      this.logger.error(`Error subiendo ${tipo.toLowerCase()} para testimonio ${testimonioId}: ${error.message}`);
      throw new BadRequestException(`Error subiendo archivo: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo multimedia
   */
  async deleteMedia(publicId: string, tipo: MediaType): Promise<DeleteApiResponse> {
    try {
      const resourceType = tipo === MediaType.VIDEO ? 'video' : 'image';
      return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      this.logger.error(`Error eliminando ${publicId}: ${error.message}`);
      throw new BadRequestException(`Error eliminando archivo: ${error.message}`);
    }
  }

  /**
   * Obtener URLs optimizadas
   */
  getMediaUrls(publicId: string, tipo: MediaType) {
    return this.generateMediaUrls(publicId, tipo);
  }

  /**
   * Listar archivos de un testimonio
   */
  async listTestimonioMedia(testimonioId: string, tipo?: MediaType) {
    try {
      let resourceType: 'image' | 'video' | 'all' = 'all';
      let folder = `testimonios/${testimonioId}`;

      if (tipo) {
        resourceType = tipo === MediaType.VIDEO ? 'video' : 'image';
        folder += `/${tipo.toLowerCase()}s`;
      }

      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: resourceType,
        prefix: folder,
        max_results: 100
      });

      return result.resources.map(resource => ({
        ...resource,
        urls: this.generateMediaUrls(resource.public_id, 
          resource.resource_type === 'video' ? MediaType.VIDEO : MediaType.IMAGE)
      }));

    } catch (error) {
      this.logger.error(`Error listando media: ${error.message}`);
      throw new BadRequestException(`Error listando archivos: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await cloudinary.api.resources({ max_results: 1 });
      return { status: 'healthy', service: 'Cloudinary' };
    } catch (error) {
      return { status: 'unhealthy', service: 'Cloudinary', error: error.message };
    }
  }

  // ========== MÉTODOS PRIVADOS ==========

  private uploadImage(fileBuffer: Buffer, folder: string, tags: string[]): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder,
          tags,
          transformation: { width: 1200, height: 800, crop: 'limit', quality: 'auto', format: 'webp' }
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error('No response from Cloudinary'));
          else {
            this.logger.log(`✅ Imagen subida: ${result.public_id}`);
            resolve(result);
          }
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  }

  private uploadVideo(fileBuffer: Buffer, folder: string, tags: string[]): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder,
          tags,
          transformation: { width: 1280, height: 720, crop: 'limit', quality: 'auto', format: 'mp4' }
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error('No response from Cloudinary'));
          else {
            this.logger.log(`✅ Video subido: ${result.public_id}`);
            resolve(result);
          }
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  }

  private generateMediaUrls(publicId: string, tipo: MediaType) {
    const urls: any = {
      original: cloudinary.url(publicId, { secure: true })
    };

    if (tipo === MediaType.IMAGE) {
      urls.optimized = cloudinary.url(publicId, {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
        secure: true
      });
    } else {
      urls.optimized = cloudinary.url(publicId, {
        resource_type: 'video',
        width: 640,
        height: 360,
        crop: 'scale',
        quality: 'auto',
        format: 'mp4',
        secure: true
      });
      urls.thumbnail = cloudinary.url(publicId, {
        resource_type: 'video',
        transformation: [
          { start_offset: '00:00:01' },
          { width: 400, height: 300, crop: 'fill' },
          { format: 'jpg' }
        ],
        secure: true
      });
    }

    return urls;
  }
}