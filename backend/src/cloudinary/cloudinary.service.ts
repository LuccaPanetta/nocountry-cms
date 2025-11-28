import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { 
  UploadApiResponse, 
  UploadApiOptions, 
  DeleteApiResponse, 
  v2 as cloudinary
} from 'cloudinary';
import * as stream from 'stream';

@Injectable()
export class CloudinarySimpleService {
  private readonly logger = new Logger(CloudinarySimpleService.name);

  constructor() {
    // Verificar configuración al inicializar
    this.verifyConfiguration();
  }

  /**
   * Verificar que la configuración de Cloudinary esté presente
   */
  private verifyConfiguration(): void {
    const requiredEnvVars = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY', 
      'CLOUDINARY_API_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      this.logger.warn(`Variables de Cloudinary faltantes: ${missingVars.join(', ')}`);
    } else {
      this.logger.log('✅ Cloudinary configurado correctamente');
    }
  }

  /**
   * Subir imagen desde buffer
   */
  async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'images',
    tags: string[] = [],
  ): Promise<UploadApiResponse> {
    this.logger.log(`Subiendo imagen a carpeta: ${folder}`);

    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        resource_type: 'image',
        folder,
        tags,
        transformation: {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          format: 'webp',
        },
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            this.logger.error(`Error subiendo imagen: ${error.message}`);
            reject(new BadRequestException(`Error subiendo imagen: ${error.message}`));
          } else if (!result) {
            this.logger.error('No se obtuvo resultado de Cloudinary');
            reject(new BadRequestException('No se obtuvo resultado de Cloudinary'));
          } else {
            this.logger.log(`✅ Imagen subida: ${result.public_id}`);
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
   * Subir video desde buffer
   */
  async uploadVideo(
    fileBuffer: Buffer,
    folder: string = 'videos',
    tags: string[] = [],
  ): Promise<UploadApiResponse> {
    this.logger.log(`Subiendo video a carpeta: ${folder}`);

    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        resource_type: 'video',
        folder,
        tags,
        transformation: {
          width: 1280,
          height: 720,
          crop: 'limit',
          quality: 'auto',
          format: 'mp4',
        },
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            this.logger.error(`Error subiendo video: ${error.message}`);
            reject(new BadRequestException(`Error subiendo video: ${error.message}`));
          } else if (!result) {
            this.logger.error('No se obtuvo resultado de Cloudinary');
            reject(new BadRequestException('No se obtuvo resultado de Cloudinary'));
          } else {
            this.logger.log(`✅ Video subido: ${result.public_id} (${result.bytes} bytes)`);
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
   * Subir archivo genérico (detecta automáticamente el tipo)
   */
  async uploadFile(
    fileBuffer: Buffer,
    folder: string = 'files',
    tags: string[] = [],
    mimeType?: string,
  ): Promise<UploadApiResponse> {
    // Determinar resource_type basado en el mimeType
    let resourceType: 'image' | 'video' | 'auto' = 'auto';
    
    if (mimeType) {
      if (mimeType.startsWith('image/')) {
        resourceType = 'image';
      } else if (mimeType.startsWith('video/')) {
        resourceType = 'video';
      }
    }

    this.logger.log(`Subiendo archivo (${resourceType}) a carpeta: ${folder}`);

    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        resource_type: resourceType,
        folder,
        tags,
      };

      // Aplicar transformaciones específicas según el tipo
      if (resourceType === 'image') {
        uploadOptions.transformation = {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          format: 'webp',
        };
      } else if (resourceType === 'video') {
        uploadOptions.transformation = {
          width: 1280,
          height: 720,
          crop: 'limit',
          quality: 'auto',
          format: 'mp4',
        };
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            this.logger.error(`Error subiendo archivo: ${error.message}`);
            reject(new BadRequestException(`Error subiendo archivo: ${error.message}`));
          } else if (!result) {
            this.logger.error('No se obtuvo resultado de Cloudinary');
            reject(new BadRequestException('No se obtuvo resultado de Cloudinary'));
          } else {
            this.logger.log(`✅ Archivo subido: ${result.public_id} (${result.resource_type})`);
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
   * Eliminar recurso por publicId
   */
  async deleteResource(
    publicId: string, 
    resourceType: 'image' | 'video' | 'auto' = 'auto'
  ): Promise<DeleteApiResponse> {
    this.logger.log(`Eliminando recurso: ${publicId} (${resourceType})`);

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result === 'ok') {
        this.logger.log(`✅ Recurso eliminado: ${publicId}`);
      } else {
        this.logger.warn(`Resultado inesperado al eliminar ${publicId}: ${result.result}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error eliminando recurso ${publicId}: ${error.message}`);
      throw new BadRequestException(`Error eliminando recurso: ${error.message}`);
    }
  }

  /**
   * Eliminar múltiples recursos
   */
  async deleteMultipleResources(
    publicIds: string[], 
    resourceType: 'image' | 'video' | 'auto' = 'auto'
  ): Promise<any> {
    this.logger.log(`Eliminando ${publicIds.length} recursos`);

    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });

      this.logger.log(`✅ ${Object.keys(result.deleted || {}).length} recursos eliminados`);
      return result;
    } catch (error) {
      this.logger.error(`Error eliminando múltiples recursos: ${error.message}`);
      throw new BadRequestException(`Error eliminando múltiples recursos: ${error.message}`);
    }
  }

  /**
   * Generar URL optimizada para imagen
   */
  generateImageUrl(
    publicId: string, 
    width: number = 800, 
    height: number = 600,
    format: string = 'webp'
  ): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format,
      secure: true,
    });
  }

  /**
   * Generar thumbnail para video
   */
  generateVideoThumbnail(
    publicId: string, 
    timeOffset: string = '00:00:01',
    width: number = 400,
    height: number = 300
  ): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        {
          start_offset: timeOffset,
        },
        {
          width,
          height,
          crop: 'fill',
        },
        {
          format: 'jpg',
        },
      ],
      secure: true,
    });
  }

  /**
   * Generar URL de video optimizada
   */
  generateVideoUrl(
    publicId: string, 
    width: number = 640, 
    height: number = 360,
    format: string = 'mp4'
  ): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      width,
      height,
      crop: 'scale',
      quality: 'auto',
      format,
      secure: true,
    });
  }

  /**
   * Generar URL con transformaciones personalizadas
   */
  generateCustomUrl(
    publicId: string,
    transformations: any = {},
    resourceType: 'image' | 'video' | 'auto' = 'image'
  ): string {
    return cloudinary.url(publicId, {
      ...transformations,
      resource_type: resourceType,
      secure: true,
    });
  }

  /**
   * Verificar conexión con Cloudinary
   */
  async healthCheck(): Promise<{ 
    status: string; 
    cloudName: string;
    details: any;
  }> {
    try {
      // Intentar listar recursos para verificar conexión
      const resources = await cloudinary.api.resources({ 
        max_results: 1,
        type: 'upload'
      });

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'unknown';
      
      this.logger.log(`✅ Health check exitoso - Cloud: ${cloudName}`);
      
      return {
        status: 'healthy',
        cloudName,
        details: {
          total_resources: resources.total_count,
          api_available: true,
          cloud_name: cloudName,
        }
      };
    } catch (error) {
      this.logger.error(`❌ Health check falló: ${error.message}`);
      throw new BadRequestException(`Cloudinary no responde: ${error.message}`);
    }
  }

  /**
   * Obtener información de un recurso
   */
  async getResourceInfo(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    try {
      const resource = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      this.logger.log(`✅ Información obtenida para: ${publicId}`);
      return resource;
    } catch (error) {
      this.logger.error(`Error obteniendo información de ${publicId}: ${error.message}`);
      throw new BadRequestException(`Error obteniendo información del recurso: ${error.message}`);
    }
  }

  /**
   * Listar recursos en una carpeta
   */
  async listResources(
    folder: string = '', 
    resourceType: 'image' | 'video' | 'all' = 'all',
    maxResults: number = 20
  ): Promise<any> {
    try {
      const options: any = {
        type: 'upload',
        max_results: maxResults,
      };

      if (folder) {
        options.prefix = folder;
      }

      if (resourceType !== 'all') {
        options.resource_type = resourceType;
      }

      const result = await cloudinary.api.resources(options);

      this.logger.log(`✅ Listados ${result.resources.length} recursos de: ${folder || 'root'}`);
      return result;
    } catch (error) {
      this.logger.error(`Error listando recursos: ${error.message}`);
      throw new BadRequestException(`Error listando recursos: ${error.message}`);
    }
  }

  /**
   * Crear carpeta en Cloudinary
   */
  async createFolder(folderPath: string): Promise<any> {
    try {
      const result = await cloudinary.api.create_folder(folderPath);
      this.logger.log(`✅ Carpeta creada: ${folderPath}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creando carpeta ${folderPath}: ${error.message}`);
      throw new BadRequestException(`Error creando carpeta: ${error.message}`);
    }
  }

  /**
   * Validar si un publicId existe
   */
  async resourceExists(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<boolean> {
    try {
      await this.getResourceInfo(publicId, resourceType);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener uso y estadísticas
   */
  async getUsage(): Promise<any> {
    try {
      const usage = await cloudinary.api.usage();
      this.logger.log('✅ Estadísticas de uso obtenidas');
      return usage;
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error.message}`);
      throw new BadRequestException(`Error obteniendo estadísticas: ${error.message}`);
    }
  }
}