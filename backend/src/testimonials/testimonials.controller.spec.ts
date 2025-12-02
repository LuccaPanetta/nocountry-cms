// src/testimonials/testimonials.controller.ts - VERSIÓN MEJORADA
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Request, Query, UseInterceptors, UploadedFile, 
  ParseUUIDPipe, BadRequestException, UseGuards,
  UsePipes, ValidationPipe, Logger 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialFormDto } from './dto/create-testimonial-form.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TransformFormDataInterceptor } from '../common/interceptors/transform-form-data.interceptor';
import { FileValidationInterceptor } from '../common/interceptors/file-validation.interceptor';
import { GlobalValidationPipe } from '../infra/validators/pipes/global-validation.pipe';
import {
  TestimonialsSwagger,
  CreateTestimonialSwagger,
  FindAllTestimonialsSwagger,
  FindOneTestimonialSwagger,
  UpdateTestimonialSwagger,
  DeleteTestimonialSwagger,
  UpdateStatusSwagger
} from './decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MultimediaType } from '../multimedia/enums/multimedia-type.enum';

@TestimonialsSwagger()
@Controller('testimonials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestimonialsController {
  private readonly logger = new Logger(TestimonialsController.name);

  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @CreateTestimonialSwagger()
  @Roles(UserRole.CONTRIBUTOR)
  @UseInterceptors(
    FileInterceptor('file'),
    TransformFormDataInterceptor,
    FileValidationInterceptor // ✅ Nuevo interceptor de validación de archivos
  )
  @UsePipes(new GlobalValidationPipe()) // ✅ Pipe mejorado
  async create(
    @Body() createTestimonialFormDto: CreateTestimonialFormDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    this.logRequest('CREATE_TESTIMONIAL', req, createTestimonialFormDto, file);

    try {
      // Validaciones adicionales del negocio
      this.validateBusinessRules(createTestimonialFormDto, file, req.user);

      // Procesar datos multimedia
      const multimediaData = this.processMultimediaData(createTestimonialFormDto, file);

      // Transformar DTO
      const createTestimonialDto = this.transformFormDto(createTestimonialFormDto);

      // Llamar al servicio
      const result = await this.testimonialsService.createWithMedia(
        createTestimonialDto,
        req.user,
        file,
        multimediaData
      );

      this.logSuccess('CREATE_TESTIMONIAL', req.user.id, result.testimonial.id);
      return result;

    } catch (error) {
      this.logError('CREATE_TESTIMONIAL', error, req);
      throw this.formatErrorForClient(error);
    }
  }

  private logRequest(
    operation: string, 
    req: any, 
    dto: any, 
    file?: Express.Multer.File
  ) {
    this.logger.log(`📥 ${operation} - Inicio`, {
      operation,
      userId: req.user?.id,
      userRole: req.user?.rol,
      bodyKeys: Object.keys(dto).filter(key => dto[key] !== undefined),
      hasFile: !!file,
      fileInfo: file ? {
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      } : null,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  }

  private validateBusinessRules(dto: CreateTestimonialFormDto, file: Express.Multer.File, user: any) {
  const errors: any[] = [];

  // 1. Validar conflicto de fuentes de video
  const hasVideoUrl = dto.videoUrl && dto.videoUrl.trim().length > 0;
  const hasVideoFile = file && file.mimetype && file.mimetype.startsWith('video/');
  
  if (hasVideoUrl && hasVideoFile) {
    errors.push({
      field: 'videoUrl',
      error: 'CONFLICT_VIDEO_SOURCES',
      message: 'No puede proporcionar tanto una URL de video como un archivo de video. Elija solo una opción.',
    });
  }

  // 2. Validar tipo de archivo requerido
  if (file && (!dto.tipo || !dto.tipo.trim())) {
    errors.push({
      field: 'tipo',
      error: 'MISSING_FILE_TYPE',
      message: 'Debe especificar el tipo de archivo (IMAGEN o VIDEO) cuando sube un archivo',
    });
  }

  // 3. Validar tags
  if (dto.tagIds) {
    try {
      const tagCount = this.countTags(dto.tagIds);
      
      if (tagCount > 5) {
        errors.push({
          field: 'tagIds',
          error: 'TOO_MANY_TAGS',
          message: 'No puede asignar más de 5 tags a un testimonio',
          maxTags: 5,
          currentTags: tagCount
        });
      }
    } catch (error) {
      errors.push({
        field: 'tagIds',
        error: 'INVALID_TAG_FORMAT',
        message: 'Formato inválido para tags. Use: "id1,id2" o ["id1","id2"]',
        received: dto.tagIds
      });
    }
  }

  // 4. Validar que el tipo sea válido si se especificó
  if (dto.tipo && dto.tipo.trim()) {
    const tipo = dto.tipo.trim().toUpperCase();
    if (![MultimediaType.IMAGE, MultimediaType.VIDEO].includes(tipo as MultimediaType)) {
      errors.push({
        field: 'tipo',
        error: 'INVALID_TYPE_VALUE',
        message: `Tipo no válido: ${dto.tipo}. Use: IMAGEN o VIDEO`,
        allowedValues: [MultimediaType.IMAGE, MultimediaType.VIDEO]
      });
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException({
      statusCode: 400,
      message: 'Errores de validación de reglas de negocio',
      errors,
      timestamp: new Date().toISOString()
    });
  }
}

private countTags(tagIds: any): number {
  // Si es array
  if (Array.isArray(tagIds)) {
    return tagIds.length;
  }
  
  // Si es string
  if (typeof tagIds === 'string') {
    const str = tagIds.trim();
    
    // Si está vacío
    if (!str) return 0;
    
    // Si es array JSON
    if (str.startsWith('[')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return parsed.length;
        }
      } catch {
        throw new Error('Invalid JSON array format');
      }
    }
    
    // Si es lista separada por comas
    if (str.includes(',')) {
      return str.split(',').filter(tag => tag.trim()).length;
    }
    
    // Un solo tag
    return 1;
  }
  
  // Otro tipo
  throw new Error(`Invalid tag format: ${typeof tagIds}`);
}

  private processMultimediaData(
    dto: CreateTestimonialFormDto, 
    file?: Express.Multer.File
  ): { tipo: MultimediaType; descripcion?: string } | undefined {
    if (!file) return undefined;

    const tipo = dto.tipo || (file.mimetype.startsWith('image/') 
      ? MultimediaType.IMAGE 
      : MultimediaType.VIDEO);

    if (![MultimediaType.IMAGE, MultimediaType.VIDEO].includes(tipo)) {
      throw new BadRequestException({
        field: 'tipo',
        error: 'INVALID_MEDIA_TYPE',
        message: `Tipo de archivo no válido: ${tipo}`,
        allowedTypes: [MultimediaType.IMAGE, MultimediaType.VIDEO],
        received: tipo
      });
    }

    return {
      tipo,
      descripcion: dto.descripcion || file.originalname
    };
  }

  private transformFormDto(dto: CreateTestimonialFormDto) {
    try {
      return dto.toCreateTestimonialDto();
    } catch (error) {
      throw new BadRequestException({
        field: 'tagIds',
        error: 'TAG_TRANSFORMATION_ERROR',
        message: error.message,
        received: dto.tagIds
      });
    }
  }

  private logSuccess(operation: string, userId: string, resourceId: string) {
    this.logger.log(`✅ ${operation} - Éxito`, {
      operation,
      userId,
      resourceId,
      timestamp: new Date().toISOString()
    });
  }

  private logError(operation: string, error: any, req: any) {
    this.logger.error(`❌ ${operation} - Error`, {
      operation,
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
      errorDetails: error.response || error,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });
  }

  private formatErrorForClient(error: any) {
    if (error instanceof BadRequestException) {
      return error;
    }

    // Si es error de base de datos o servicio, formatear
    return new BadRequestException({
      statusCode: 400,
      message: 'Error al procesar la solicitud',
      error: error.message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        details: error.stack?.split('\n').slice(0, 3)
      })
    });
  }

  // ... otros métodos permanecen con mejoras similares
}