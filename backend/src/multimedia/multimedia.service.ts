import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Multimedia } from './entities/multimedia.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { CreateMultimediaDto } from './dto/create-multimedia.dto';
import { UpdateMultimediaDto } from './dto/update-multimedia.dto';
import { MultimediaType } from './enums/multimedia-type.enum';
import { CloudinarySimpleService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MultimediaService {
  constructor(
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private readonly cloudinaryService: CloudinarySimpleService,
  ) {}

  async create(createMultimediaDto: CreateMultimediaDto): Promise<Multimedia> {
    // Verificar que el testimonio existe
    const testimonio = await this.testimonialRepository.findOne({
      where: { id: createMultimediaDto.testimonioId }
    });

    if (!testimonio) {
      throw new NotFoundException(`Testimonio con ID ${createMultimediaDto.testimonioId} no encontrado`);
    }

    // Verificar que no exista un multimedia con el mismo publicId
    const existingMultimedia = await this.multimediaRepository.findOne({
      where: { publicId: createMultimediaDto.publicId }
    });

    if (existingMultimedia) {
      throw new ConflictException(`Ya existe un multimedia con el publicId: ${createMultimediaDto.publicId}`);
    }

    const multimedia = this.multimediaRepository.create({
      ...createMultimediaDto,
      testimonio: testimonio,
    });

    return await this.multimediaRepository.save(multimedia);
  }

  /**
   * Crear multimedia subiendo archivo a Cloudinary
   */
  async createWithUpload(
    testimonioId: string,
    fileBuffer: Buffer,
    tipo: MultimediaType,
    descripcion?: string,
  ): Promise<Multimedia> {
    // Verificar que el testimonio existe
    const testimonio = await this.testimonialRepository.findOne({
      where: { id: testimonioId }
    });

    if (!testimonio) {
      throw new NotFoundException(`Testimonio con ID ${testimonioId} no encontrado`);
    }

    let uploadResult;
    const folder = `testimonios/${testimonioId}`;
    const tags = [`testimonio-${testimonioId}`, tipo.toLowerCase()];

    try {
      if (tipo === MultimediaType.IMAGE) {
        uploadResult = await this.cloudinaryService.uploadImage(fileBuffer, folder, tags);
      } else if (tipo === MultimediaType.VIDEO) {
        uploadResult = await this.cloudinaryService.uploadVideo(fileBuffer, folder, tags);
      } else {
        throw new BadRequestException(`Tipo de multimedia no soportado: ${tipo}`);
      }

      // Crear registro en la base de datos
      const multimedia = this.multimediaRepository.create({
        testimonioId,
        tipo,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        descripcion,
      });

      return await this.multimediaRepository.save(multimedia);
    } catch (error) {
      // Si falla la subida, limpiar cualquier recurso subido
      if (uploadResult?.public_id) {
        await this.cloudinaryService.deleteResource(uploadResult.public_id, tipo === MultimediaType.VIDEO ? 'video' : 'image');
      }
      throw new BadRequestException(`Error subiendo archivo: ${error.message}`);
    }
  }

  async findAll(testimonioId?: string): Promise<Multimedia[]> {
    const query = this.multimediaRepository
      .createQueryBuilder('multimedia')
      .leftJoinAndSelect('multimedia.testimonio', 'testimonio');

    if (testimonioId) {
      query.where('multimedia.testimonio_id = :testimonioId', { testimonioId });
    }

    return await query.orderBy('multimedia.creadoEn', 'DESC').getMany();
  }

  async findByTestimonioId(testimonioId: string): Promise<Multimedia[]> {
    return await this.multimediaRepository.find({
      where: { testimonioId },
      relations: ['testimonio'],
      order: { creadoEn: 'DESC' }
    });
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

  async update(id: string, updateMultimediaDto: UpdateMultimediaDto): Promise<Multimedia> {
    const multimedia = await this.findOne(id);

    // Si se actualiza el testimonioId, verificar que exista
    if (updateMultimediaDto.testimonioId && updateMultimediaDto.testimonioId !== multimedia.testimonioId) {
      const testimonio = await this.testimonialRepository.findOne({
        where: { id: updateMultimediaDto.testimonioId }
      });

      if (!testimonio) {
        throw new NotFoundException(`Testimonio con ID ${updateMultimediaDto.testimonioId} no encontrado`);
      }
      multimedia.testimonio = testimonio;
    }

    // Si se actualiza el publicId, verificar que no exista otro
    if (updateMultimediaDto.publicId && updateMultimediaDto.publicId !== multimedia.publicId) {
      const existingMultimedia = await this.multimediaRepository.findOne({
        where: { publicId: updateMultimediaDto.publicId }
      });

      if (existingMultimedia && existingMultimedia.id !== id) {
        throw new ConflictException(`Ya existe un multimedia con el publicId: ${updateMultimediaDto.publicId}`);
      }
    }

    Object.assign(multimedia, updateMultimediaDto);
    return await this.multimediaRepository.save(multimedia);
  }

  async remove(id: string): Promise<{ message: string }> {
    const multimedia = await this.findOne(id);
    
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
    return { message: 'Multimedia eliminado exitosamente' };
  }

  async removeByPublicId(publicId: string): Promise<{ message: string }> {
    const multimedia = await this.findByPublicId(publicId);
    
    // Eliminar de Cloudinary primero
    try {
      await this.cloudinaryService.deleteResource(
        multimedia.publicId, 
        multimedia.tipo === MultimediaType.VIDEO ? 'video' : 'image'
      );
    } catch (error) {
      console.warn(`No se pudo eliminar de Cloudinary: ${error.message}`);
    }

    await this.multimediaRepository.remove(multimedia);
    return { message: 'Multimedia eliminado exitosamente' };
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

  /**
   * Obtener URLs optimizadas para frontend
   */
  async getOptimizedUrls(multimediaId: string): Promise<{ 
    original: string; 
    optimized: string; 
    thumbnail?: string 
  }> {
    const multimedia = await this.findOne(multimediaId);
    
    const result: any = {
      original: multimedia.url,
    };

    if (multimedia.tipo === MultimediaType.IMAGE) {
      result.optimized = this.cloudinaryService.generateImageUrl(multimedia.publicId, 800, 600);
    } else if (multimedia.tipo === MultimediaType.VIDEO) {
      result.optimized = this.cloudinaryService.generateVideoUrl(multimedia.publicId, 640, 360);
      result.thumbnail = this.cloudinaryService.generateVideoThumbnail(multimedia.publicId);
    } else {
      result.optimized = multimedia.url;
    }

    return result;
  }
}