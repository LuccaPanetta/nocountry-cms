// multimedia/multimedia.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Multimedia } from './entities/multimedia.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { CreateMultimediaDto } from './dto/create-multimedia.dto';
import { UpdateMultimediaDto } from './dto/update-multimedia.dto';
import { MultimediaType } from './enums/multimedia-type.enum';
import { CloudinarySimpleService } from '../cloudinary/cloudinary.service';

// Interface para el resultado de Cloudinary
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

@Injectable()
export class MultimediaService {
  constructor(
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private readonly cloudinaryService: CloudinarySimpleService,
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
    const testimonio = await this.verifyTestimonioExists(testimonioId);

    // ✅ INICIALIZAR uploadResult para evitar el error
    let uploadResult: CloudinaryUploadResult | null = null;
    const folder = `testimonios/${testimonioId}`;
    const tags = [`testimonio-${testimonioId}`, tipo.toLowerCase()];

    try {
      // Subir a Cloudinary según el tipo
      if (tipo === MultimediaType.IMAGE) {
        uploadResult = await this.cloudinaryService.uploadImage(
          file.buffer, 
          folder, 
          tags
        ) as CloudinaryUploadResult;
      } else if (tipo === MultimediaType.VIDEO) {
        uploadResult = await this.cloudinaryService.uploadVideo(
          file.buffer, 
          folder, 
          tags
        ) as CloudinaryUploadResult;
      } else {
        throw new BadRequestException(`Tipo de multimedia no soportado: ${tipo}`);
      }

      // ✅ CORREGIDO: Usar solo los campos que existen en tu entidad
      const multimediaData = {
        testimonioId,
        tipo,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        descripcion,
        nombreArchivo: file.originalname,
        // ❌ ELIMINADOS: tamaño, formato, duracion, resolucion (no existen en tu entidad)
      };

      const multimedia = this.multimediaRepository.create({
        ...multimediaData,
        testimonio: testimonio,
      });

      const savedMultimedia = await this.multimediaRepository.save(multimedia);

      return {
        multimedia: savedMultimedia,
        cloudinaryData: uploadResult
      };

    } catch (error) {
      // ✅ CORREGIDO: Ahora uploadResult puede ser null
      if (uploadResult?.public_id) {
        await this.cloudinaryService.deleteResource(
          uploadResult.public_id, 
          tipo === MultimediaType.VIDEO ? 'video' : 'image'
        );
      }
      throw new BadRequestException(`Error subiendo archivo: ${error.message}`);
    }
  }

  /**
   * Subir múltiples archivos
   */
  async uploadMultiple(
    testimonioId: string,
    files: Express.Multer.File[],
    tipo: MultimediaType,
  ): Promise<Array<{ multimedia: Multimedia; cloudinaryData: any }>> {
    // ✅ CORREGIDO: Especificar el tipo del array
    const results: Array<{ multimedia: Multimedia; cloudinaryData: any }> = [];
    
    for (const file of files) {
      try {
        const result = await this.createWithUpload(testimonioId, file, tipo);
        results.push(result);
      } catch (error) {
        // Continuar con los demás archivos si uno falla
        console.error(`Error subiendo archivo ${file.originalname}:`, error.message);
      }
    }

    return results;
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
    
    // ✅ CORREGIDO: Usar solo campos existentes
    const multimediaInfo = {
      id: multimedia.id,
      tipo: multimedia.tipo,
      url: multimedia.url,
      publicId: multimedia.publicId,
      nombreArchivo: multimedia.nombreArchivo,
      creadoEn: multimedia.creadoEn
    };
    
    // Eliminar de Cloudinary primero
    try {
      await this.cloudinaryService.deleteResource(
        multimedia.publicId, 
        multimedia.tipo === MultimediaType.VIDEO ? 'video' : 'image'
      );
    } catch (error) {
      console.warn(`No se pudo eliminar de Cloudinary: ${error.message}`);
    }

    // Eliminar de la base de datos
    await this.multimediaRepository.remove(multimedia);
    
    return { 
      message: 'Multimedia eliminado exitosamente',
      deletedMultimedia: multimediaInfo
    };
  }

  /**
   * Obtener URLs optimizadas para diferentes usos
   */
  /**
 * Obtener URLs optimizadas para diferentes usos
 */
async getOptimizedUrls(multimediaId: string): Promise<{ 
  original: string;
  optimized: string;
  thumbnail: string;
  preview?: string;
}> {
  const multimedia = await this.findOne(multimediaId);
  
  // Inicializar el objeto con todas las propiedades posibles
  const result: {
    original: string;
    optimized: string;
    thumbnail: string;
    preview?: string;
  } = {
    original: multimedia.url,
    optimized: multimedia.url,
    thumbnail: multimedia.url
    // preview se añadirá solo para videos
  };

  if (multimedia.tipo === MultimediaType.IMAGE) {
    // Para imágenes
    result.optimized = this.cloudinaryService.generateImageUrl(multimedia.publicId, 800, 600);
    result.thumbnail = this.cloudinaryService.generateImageUrl(multimedia.publicId, 300, 200);
  } else if (multimedia.tipo === MultimediaType.VIDEO) {
    // Para videos
    result.optimized = this.cloudinaryService.generateVideoUrl(multimedia.publicId, 1280, 720);
    result.thumbnail = this.cloudinaryService.generateVideoThumbnail(multimedia.publicId);
    result.preview = this.cloudinaryService.generateVideoUrl(multimedia.publicId, 640, 360);
  }

  return result;
}
  /**
   * Métodos de verificación privados
   */
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

  // ✅ AÑADIR: Métodos adicionales útiles
  async findByTestimonioId(testimonioId: string): Promise<Multimedia[]> {
    return await this.multimediaRepository.find({
      where: { testimonioId },
      relations: ['testimonio'],
      order: { creadoEn: 'DESC' }
    });
  }

  async countByTestimonioId(testimonioId: string): Promise<number> {
    return await this.multimediaRepository.count({
      where: { testimonioId }
    });
  }

  async findByType(testimonioId: string, tipo: MultimediaType): Promise<Multimedia[]> {
    return await this.multimediaRepository.find({
      where: { testimonioId, tipo },
      order: { creadoEn: 'DESC' }
    });
  }

  async findByPublicId(publicId: string): Promise<Multimedia> {
    const multimedia = await this.multimediaRepository.findOne({
      where: { publicId },
      relations: ['testimonio']
    });

    if (!multimedia) {
      throw new NotFoundException(`Multimedia con publicId ${publicId} no encontrado`);
    }

    return multimedia;
  }
}