// src/multimedia/multimedia.service.ts
import { Injectable, NotFoundException, ConflictException, 
  BadRequestException, Logger, Inject, forwardRef 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Multimedia } from './entities/multimedia.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { CreateMultimediaDto } from './dto/create-multimedia.dto';
import { MultimediaType } from './enums/multimedia-type.enum';
import { MultimediaResponseDto } from './dto/multimedia-response.dto';
import { CloudinaryMediaService } from '../cloudinary/cloudinary-media.service';
import { TestimonialsService } from '../testimonials/testimonials.service';

@Injectable()
export class MultimediaService {
  private readonly logger = new Logger(MultimediaService.name);

  constructor(
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private readonly cloudinaryMediaService: CloudinaryMediaService,
    @Inject(forwardRef(() => TestimonialsService))
    private readonly testimonialsService: TestimonialsService,
  ) {}

  /**
   * Crear registro de multimedia (sin subir archivo)
   */
  async create(createMultimediaDto: CreateMultimediaDto): Promise<Multimedia> {
    const testimonio = await this.verifyTestimonioExists(createMultimediaDto.testimonioId);
    
    if (createMultimediaDto.publicId) {
      await this.verifyPublicIdUnique(createMultimediaDto.publicId);
    }

    const multimedia = this.multimediaRepository.create({
      ...createMultimediaDto,
      testimonio: testimonio,
    });

    return await this.multimediaRepository.save(multimedia);
  }

  /**
   * Crear multimedia subiendo archivo a Cloudinary (MÉTODO PRINCIPAL)
   */
  async createWithUpload(
    testimonioId: string,
    file: Express.Multer.File,
    tipo: MultimediaType,
    descripcion?: string,
  ): Promise<{ multimedia: Multimedia; cloudinaryData: any }> {
    this.logger.log(`Subiendo ${tipo} para testimonio: ${testimonioId}`);

    const testimonio = await this.verifyTestimonioExists(testimonioId);

    try {
      // Subir a Cloudinary
      const cloudinaryResult = await this.cloudinaryMediaService.uploadMedia(
        file.buffer,
        testimonioId,
        tipo,
        descripcion
      );

      // Crear registro en DB
      const multimedia = this.multimediaRepository.create({
        tipo,
        url: cloudinaryResult.media.secure_url,
        publicId: cloudinaryResult.media.public_id,
        descripcion,
        nombreArchivo: file.originalname,
        testimonio: testimonio,
      });

      const savedMultimedia = await this.multimediaRepository.save(multimedia);

      return {
        multimedia: savedMultimedia,
        cloudinaryData: cloudinaryResult
      };

    } catch (error) {
      this.logger.error(`Error subiendo multimedia: ${error.message}`);
      throw new BadRequestException(`Error subiendo archivo: ${error.message}`);
    }
  }

  /**
   * Obtener multimedia de un testimonio con filtro opcional por tipo
   */
  async findByTestimonioIdWithFilter(testimonioId: string, tipo?: MultimediaType): Promise<MultimediaResponseDto[]> {
    // Verificar que el testimonio existe
    await this.verifyTestimonioExists(testimonioId);

    let multimedias: Multimedia[];

    if (tipo) {
      // Filtrar por tipo específico
      multimedias = await this.findByType(testimonioId, tipo);
    } else {
      // Obtener todos los multimedia del testimonio
      multimedias = await this.findByTestimonioId(testimonioId);
    }

    // Mapear a DTO de response
    return multimedias.map(multimedia => this.toResponseDto(multimedia));
  }

  // En src/multimedia/multimedia.service.ts
async createWithUrl(
  testimonialId: string,
  url: string,
  tipo: MultimediaType,
  descripcion?: string
): Promise<Multimedia> {
  const testimonial = await this.testimonialRepository.findOne({
    where: { id: testimonialId }
  });

  if (!testimonial) {
    throw new NotFoundException(`Testimonio con ID ${testimonialId} no encontrado`);
  }

  // Crear registro de multimedia para URL externa
  const multimedia = this.multimediaRepository.create({
    url: url,
    tipo: tipo,
    descripcion: descripcion,
    testimonio: testimonial,
    // No hay publicId porque no es de Cloudinary
    // No hay nombreArchivo porque es URL externa
  });

  return await this.multimediaRepository.save(multimedia);
}

  /**
   * Convertir entidad Multimedia a DTO de response (HACER PÚBLICO)
   */
  toResponseDto(multimedia: Multimedia): MultimediaResponseDto {
    return {
      id: multimedia.id,
      tipo: multimedia.tipo,
      url: multimedia.url,
      descripcion: multimedia.descripcion,
      publicId: multimedia.publicId,
      creadoEn: multimedia.creadoEn,
      nombreArchivo: multimedia.nombreArchivo,
      actualizadoEn: multimedia.actualizadoEn
    };
  }

  /**
   * Health check combinado
   */
  async healthCheck() {
    try {
      // Verificar base de datos
      await this.multimediaRepository.query('SELECT 1');
      
      // Verificar Cloudinary
      const cloudinaryHealth = await this.cloudinaryMediaService.healthCheck();
      
      return {
        status: 'healthy',
        services: {
          database: 'healthy',
          cloudinary: cloudinaryHealth.status
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: {
          database: 'unhealthy',
          cloudinary: 'unknown'
        },
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async findAll(testimonioId?: string, tipo?: MultimediaType): Promise<Multimedia[]> {
    const query = this.multimediaRepository
      .createQueryBuilder('multimedia')
      .leftJoinAndSelect('multimedia.testimonio', 'testimonio');

    if (testimonioId) {
      query.where('multimedia.testimonio_id = :testimonioId', { testimonioId });
    }

    if (tipo) {
      query.andWhere('multimedia.tipo = :tipo', { tipo });
    }

    return await query.orderBy('multimedia.creadoEn', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Multimedia> {
    const multimedia = await this.multimediaRepository.findOne({
      where: { id },
      relations: ['testimonio']
    });

    if (!multimedia) {
      throw new NotFoundException(`Multimedia con ID ${id} no encontrado`);
    }

    return multimedia;
  }

  async remove(id: string): Promise<{ message: string; deletedMultimedia: any }> {
    const multimedia = await this.findOne(id);
    
    const multimediaInfo = {
      id: multimedia.id,
      tipo: multimedia.tipo,
      url: multimedia.url,
      publicId: multimedia.publicId,
      nombreArchivo: multimedia.nombreArchivo,
      creadoEn: multimedia.creadoEn
    };
    
    try {
      // Usar CloudinaryMediaService para eliminar
      await this.cloudinaryMediaService.deleteMedia(
        multimedia.publicId, 
        multimedia.tipo
      );
    } catch (error) {
      this.logger.warn(`No se pudo eliminar de Cloudinary: ${error.message}`);
    }

    await this.multimediaRepository.remove(multimedia);
    
    return { 
      message: 'Multimedia eliminado exitosamente',
      deletedMultimedia: multimediaInfo
    };
  }

  async getOptimizedUrls(multimediaId: string): Promise<{ 
    original: string;
    optimized: string;
    thumbnail: string;
    preview?: string;
  }> {
    const multimedia = await this.findOne(multimediaId);
    
    // Usar CloudinaryMediaService para generar URLs
    const urls = this.cloudinaryMediaService.getMediaUrls(multimedia.publicId, multimedia.tipo);
    
    return {
      original: multimedia.url,
      optimized: urls.optimized,
      thumbnail: urls.thumbnail || multimedia.url,
      preview: urls.preview
    };
  }

  // CORREGIDO: Usar la relación testimonio en lugar de testimonioId
  async findByTestimonioId(testimonioId: string): Promise<Multimedia[]> {
    return await this.multimediaRepository.find({
      where: { testimonio: { id: testimonioId } }, // Usar la relación
      relations: ['testimonio'],
      order: { creadoEn: 'DESC' }
    });
  }

  // CORREGIDO: Usar la relación testimonio en lugar de testimonioId
  async findByType(testimonioId: string, tipo: MultimediaType): Promise<Multimedia[]> {
    return await this.multimediaRepository.find({
      where: { 
        testimonio: { id: testimonioId }, // Usar la relación
        tipo: tipo 
      },
      relations: ['testimonio'],
      order: { creadoEn: 'DESC' }
    });
  }

  // CORREGIDO: Buscar por la relación
  async countByTestimonioId(testimonioId: string): Promise<number> {
    return await this.multimediaRepository.count({
      where: { testimonio: { id: testimonioId } } // Usar la relación
    });
  }

  // CORREGIDO: Buscar por la relación
  async findByPublicId(publicId: string): Promise<Multimedia | null> {
    return await this.multimediaRepository.findOne({
      where: { publicId },
      relations: ['testimonio']
    });
  }

  private async verifyTestimonioExists(testimonioId: string): Promise<Testimonial> {
    const testimonio = await this.testimonialRepository.findOne({
      where: { id: testimonioId }
    });

    if (!testimonio) {
      throw new NotFoundException(`Testimonio con ID ${testimonioId} no encontrado`);
    }

    return testimonio;
  }

  private async verifyPublicIdUnique(publicId: string): Promise<void> {
    const existingMultimedia = await this.multimediaRepository.findOne({
      where: { publicId }
    });

    if (existingMultimedia) {
      throw new ConflictException(`Ya existe un multimedia con el publicId: ${publicId}`);
    }
  }

  // Método para actualizar CreateMultimediaDto si es necesario
  async uploadMultiple(testimonioId: string, files: Express.Multer.File[], tipo: MultimediaType, descripcion?: string) {
    // Implementación según sea necesario
  }
}