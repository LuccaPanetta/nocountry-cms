// src/common/interceptors/file-validation.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FileValidationInterceptor.name);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  private readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo'
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const body = request.body;

    this.logger.log('🔍 Validando archivo y datos de entrada...', {
      hasFile: !!file,
      fileInfo: file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname
      } : null,
      bodyKeys: Object.keys(body),
      contentType: request.headers['content-type']
    });

    try {
      // 1. Validar archivo si existe
      if (file) {
        this.validateFile(file, body);
      }

      // 2. Validar campos de tipo si hay archivo
      if (file && body.tipo) {
        this.validateFileTypeConsistency(file, body.tipo);
      }

      // 3. Validar que si hay tipo, debe haber archivo
      if (body.tipo && !file) {
        throw new BadRequestException({
          field: 'tipo',
          error: 'CONFLICT_WITH_FILE',
          message: 'El campo "tipo" fue proporcionado pero no se envió ningún archivo'
        });
      }

      // 4. Validar tags formato
      if (body.tagIds) {
        this.validateTagIds(body.tagIds);
      }

      this.logger.log('✅ Validaciones de archivo exitosas');

    } catch (error) {
      this.logger.error('❌ Error en validación de archivo:', error.message);
      throw error;
    }

    return next.handle().pipe(
      tap(() => {
        this.logger.log('✅ Request procesada exitosamente');
      })
    );
  }

  private validateFile(file: Express.Multer.File, body: any): void {
    // Tamaño máximo
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException({
        field: 'file',
        error: 'FILE_TOO_LARGE',
        message: `El archivo excede el tamaño máximo permitido (${this.MAX_FILE_SIZE / 1024 / 1024}MB)`,
        maxSize: this.MAX_FILE_SIZE,
        actualSize: file.size,
        filename: file.originalname
      });
    }

    // Tipo MIME válido
    const allowedTypes = [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_VIDEO_TYPES];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        field: 'file',
        error: 'INVALID_FILE_TYPE',
        message: `Tipo de archivo no permitido: ${file.mimetype}`,
        allowedTypes: {
          images: this.ALLOWED_IMAGE_TYPES,
          videos: this.ALLOWED_VIDEO_TYPES
        },
        actualType: file.mimetype,
        filename: file.originalname
      });
    }

    // Validar extensión del nombre
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.avi'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExt)) {
      throw new BadRequestException({
        field: 'file',
        error: 'INVALID_FILE_EXTENSION',
        message: `Extensión de archivo no permitida: ${fileExt}`,
        allowedExtensions: validExtensions,
        filename: file.originalname
      });
    }
  }

  private validateFileTypeConsistency(file: Express.Multer.File, tipo: string): void {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if ((isImage && tipo !== 'IMAGEN') || (isVideo && tipo !== 'VIDEO')) {
      throw new BadRequestException({
        field: 'tipo',
        error: 'TYPE_MISMATCH',
        message: `El tipo especificado (${tipo}) no coincide con el tipo real del archivo (${isImage ? 'IMAGEN' : 'VIDEO'})`,
        specifiedType: tipo,
        detectedType: isImage ? 'IMAGEN' : 'VIDEO',
        mimetype: file.mimetype,
        filename: file.originalname
      });
    }
  }

  private validateTagIds(tagIds: string): void {
    try {
      if (tagIds.startsWith('[') && tagIds.endsWith(']')) {
        const parsed = JSON.parse(tagIds);
        if (!Array.isArray(parsed)) {
          throw new Error('No es un array válido');
        }
      } else if (tagIds.includes(',')) {
        const ids = tagIds.split(',');
        ids.forEach(id => {
          if (!id.trim()) {
            throw new Error('ID vacío encontrado');
          }
        });
      }
    } catch (error) {
      throw new BadRequestException({
        field: 'tagIds',
        error: 'INVALID_TAG_FORMAT',
        message: 'Formato inválido para tags. Use: "id1,id2" o ["id1","id2"]',
        example1: 'uuid1,uuid2',
        example2: '["uuid1","uuid2"]',
        received: tagIds
      });
    }
  }
}