// src/testimonials/testimonials.service.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Inject, 
  forwardRef, 
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { Multimedia } from '../multimedia/entities/multimedia.entity';
import { 
  TestimonialDataDto,
  TestimonialResponseDto,
  CreateTestimonialResponseDto,
  TestimonialsListResponseDto
} from './dto/testimonial-response.dto';
import { Testimonial, TestimonialStatus } from './entities/testimonial.entity';
import { User } from '../users/entities/user.entity'; 
import { UserRole } from '../users/interfaces/user-role.enum'; 
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { MultimediaService } from '../multimedia/multimedia.service';
import { MultimediaType } from '../multimedia/enums/multimedia-type.enum';
import { TestimonialMapper } from './mappers/testimonial.mapper';

@Injectable()
export class TestimonialsService {
  private readonly logger = new Logger(TestimonialsService.name);

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @Inject(forwardRef(() => MultimediaService))
    private readonly multimediaService: MultimediaService,
    private readonly dataSource: DataSource,
  ) {}

  async createWithMedia(
  createTestimonialDto: CreateTestimonialDto,
  user: User,
  file?: Express.Multer.File,
  multimediaData?: { tipo: MultimediaType; descripcion?: string }
): Promise<CreateTestimonialResponseDto> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Validar categoría
    const category = await this.categoryRepository.findOne({
      where: { id: createTestimonialDto.categoryId }
    });

    if (!category) {
      throw new BadRequestException('La categoría especificada no existe');
    }

    // Validar tags
    let tags: Tag[] = [];
    if (createTestimonialDto.tagIds && createTestimonialDto.tagIds.length > 0) {
      tags = await this.tagRepository.find({
        where: { id: In(createTestimonialDto.tagIds) }
      });

      if (tags.length !== createTestimonialDto.tagIds.length) {
        throw new BadRequestException('Algunos tags no existen');
      }
    }

    // Crear testimonio - usar multimediaUrl como videoUrl para compatibilidad
    const testimonial = this.testimonialRepository.create({
      contenido: createTestimonialDto.contenido,
      titulo: createTestimonialDto.titulo,
      autorNombre: createTestimonialDto.autorNombre,
      empresa: createTestimonialDto.empresa,
      cargo: createTestimonialDto.cargo, // Asignar multimediaUrl a videoUrl
      category: category,
      tags: tags,
      user: user,
      status: TestimonialStatus.PENDING,
    });

    const savedTestimonial = await this.testimonialRepository.save(testimonial);

    // Procesar archivo si existe
    let multimedia: Multimedia | undefined;
    if (file && multimediaData) {
      const { tipo, descripcion } = multimediaData;
      
      const multimediaResult = await this.multimediaService.createWithUpload(
        savedTestimonial.id,
        file,
        tipo,
        descripcion
      );

      savedTestimonial.multimedia = multimediaResult.multimedia;
      await this.testimonialRepository.save(savedTestimonial);
      multimedia = multimediaResult.multimedia;
    }

    await queryRunner.commitTransaction();

    // Cargar relaciones
    const testimonialCompleto = await this.testimonialRepository.findOne({
      where: { id: savedTestimonial.id },
      relations: ['category', 'tags', 'multimedia']
    });

    if (!testimonialCompleto) {
      throw new NotFoundException('Testimonio no encontrado después de la creación');
    }

    return TestimonialMapper.toCreateResponseDto(testimonialCompleto, multimedia);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    this.logger.error(`Error creando testimonio: ${error.message}`);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

  async create(
    createTestimonialDto: CreateTestimonialDto, 
    user: User
  ): Promise<CreateTestimonialResponseDto> {
    return this.createWithMedia(createTestimonialDto, user);
  }

 async updateWithMedia(
  id: string,
  updateTestimonialDto: UpdateTestimonialDto,
  file?: Express.Multer.File,
  multimediaData?: { tipo: MultimediaType; descripcion?: string }
): Promise<CreateTestimonialResponseDto> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Obtener testimonio con relaciones
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'multimedia']
    });

    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }

    // 1. Actualizar categoría si se proporciona
    if (updateTestimonialDto.categoryId !== undefined) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateTestimonialDto.categoryId }
      });

      if (!category) {
        throw new BadRequestException('La categoría especificada no existe');
      }
      testimonial.category = category;
    }

    // 2. Actualizar tags si se proporcionan
    if (updateTestimonialDto.tagIds !== undefined) {
      // Si es un array vacío, limpiar todos los tags
      if (updateTestimonialDto.tagIds.length === 0) {
        testimonial.tags = [];
      } else {
        const tags = await this.tagRepository.find({
          where: { id: In(updateTestimonialDto.tagIds) }
        });

        if (tags.length !== updateTestimonialDto.tagIds.length) {
          throw new BadRequestException('Algunos tags no existen');
        }
        testimonial.tags = tags;
      }
    }

    // 3. Actualizar campos básicos (solo si se proporcionan)
    if (updateTestimonialDto.contenido !== undefined) {
      testimonial.contenido = updateTestimonialDto.contenido;
    }
    if (updateTestimonialDto.titulo !== undefined) {
      testimonial.titulo = updateTestimonialDto.titulo;
    }
    if (updateTestimonialDto.autorNombre !== undefined) {
      testimonial.autorNombre = updateTestimonialDto.autorNombre;
    }
    if (updateTestimonialDto.empresa !== undefined) {
      testimonial.empresa = updateTestimonialDto.empresa;
    }
    if (updateTestimonialDto.cargo !== undefined) {
      testimonial.cargo = updateTestimonialDto.cargo;
    }

    // 4. Manejar multimedia
    let nuevaMultimedia: Multimedia | null = null;

    // 4.1. Si se envía un archivo (subir nuevo archivo)
    if (file && multimediaData) {
      const { tipo, descripcion } = multimediaData;

      // Validar que el tipo esté presente
      if (!tipo) {
        throw new BadRequestException('El tipo de multimedia es requerido al subir un archivo');
      }

      // Si ya existe multimedia, eliminarla
      if (testimonial.multimedia) {
        await this.multimediaService.remove(testimonial.multimedia.id);
      }

      // Crear nueva multimedia
      const multimediaResult = await this.multimediaService.createWithUpload(
        id,
        file,
        tipo,
        descripcion
      );

      // Asociar nueva multimedia al testimonio
      testimonial.multimedia = multimediaResult.multimedia;
      nuevaMultimedia = multimediaResult.multimedia;
    } 
    // 4.2. Si se envía multimediaUrl (URL externa)
    else if (updateTestimonialDto.multimediaUrl !== undefined) {
      
      // Si la URL viene vacía o null, eliminar multimedia existente
      if (!updateTestimonialDto.multimediaUrl || updateTestimonialDto.multimediaUrl.trim() === '') {
        // Limpiar multimedia (eliminar archivo si existe)
        if (testimonial.multimedia) {
          await this.multimediaService.remove(testimonial.multimedia.id);
          testimonial.multimedia = undefined;
        }
      } 
      // Si se envía una URL válida, crear un registro de Multimedia para la URL externa
      else {
        // Validar URL
        try {
          new URL(updateTestimonialDto.multimediaUrl);
        } catch {
          throw new BadRequestException('La URL proporcionada no es válida');
        }

        // Si ya existe multimedia, eliminarla primero
        if (testimonial.multimedia) {
          await this.multimediaService.remove(testimonial.multimedia.id);
        }

        // Determinar tipo basado en la URL o usar el proporcionado
        const tipo = multimediaData?.tipo || this.determinarTipoPorUrl(updateTestimonialDto.multimediaUrl);
        
        // Crear registro de Multimedia para la URL externa
        const multimediaResult = await this.multimediaService.createWithUrl(
          id,
          updateTestimonialDto.multimediaUrl,
          tipo,
          multimediaData?.descripcion || 'URL externa de multimedia'
        );

        testimonial.multimedia = multimediaResult;
        nuevaMultimedia = multimediaResult;
      }
    }
    // 4.3. Si no se envía ni file ni multimediaUrl → mantener lo existente

    // Guardar cambios en el testimonio
    const updatedTestimonial = await this.testimonialRepository.save(testimonial);
    await queryRunner.commitTransaction();

    // Cargar relaciones actualizadas
    const testimonialCompleto = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'multimedia']
    });

    if (!testimonialCompleto) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado después de la actualización`);
    }

    // Transformar a DTO de respuesta
    return TestimonialMapper.toCreateResponseDto(
      testimonialCompleto,
      nuevaMultimedia || testimonialCompleto.multimedia || undefined
    );

  } catch (error) {
    await queryRunner.rollbackTransaction();
    this.logger.error(`Error actualizando testimonio: ${error.message}`);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// Método auxiliar para determinar tipo por URL
private determinarTipoPorUrl(url: string): MultimediaType {
  const urlLower = url.toLowerCase();
  
  // Detectar si es video (YouTube, Vimeo, etc.)
  if (urlLower.includes('youtube.com') || 
      urlLower.includes('youtu.be') || 
      urlLower.includes('vimeo.com') ||
      urlLower.includes('video') ||
      urlLower.endsWith('.mp4') || 
      urlLower.endsWith('.mov') || 
      urlLower.endsWith('.avi')) {
    return MultimediaType.VIDEO;
  }
  
  // Por defecto asumir imagen
  return MultimediaType.IMAGE;
}

// Método auxiliar para determinar tipo de multimedia basado en URL
private determinarTipoMultimedia(url: string): MultimediaType {
  // Detectar si es video (YouTube, Vimeo, etc.)
  const videoPatterns = [
    /youtube\.com|youtu\.be/i,
    /vimeo\.com/i,
    /\.mp4$|\.webm$|\.ogv$/i
  ];
  
  // Detectar si es imagen
  const imagePatterns = [
    /\.jpg$|\.jpeg$|\.png$|\.gif$|\.webp$|\.svg$/i,
    /imgur\.com/i,
    /unsplash\.com/i
  ];
  
  if (videoPatterns.some(pattern => pattern.test(url))) {
    return MultimediaType.VIDEO;
  } else if (imagePatterns.some(pattern => pattern.test(url))) {
    return MultimediaType.IMAGE;
  }
  
  // Por defecto, asumir que es imagen
  return MultimediaType.IMAGE;
}

  async update(
    id: string, 
    updateTestimonialDto: UpdateTestimonialDto
  ): Promise<CreateTestimonialResponseDto> {
    return this.updateWithMedia(id, updateTestimonialDto);
  }

  async findAll(
    filterDto: GetTestimonialsDto, 
    user?: User
  ): Promise<TestimonialResponseDto[]> {
    const { status, categoryId, tags } = filterDto;
    const isPublicRequest = !user || (user.rol !== UserRole.ADMIN && user.rol !== UserRole.EDITOR);
    
    const queryBuilder = this.testimonialRepository.createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.category', 'category')
      .leftJoinAndSelect('testimonial.tags', 'tag')
      .leftJoinAndSelect('testimonial.multimedia', 'multimedia')
      .orderBy('testimonial.creadoEn', 'DESC');

    if (isPublicRequest) {
      queryBuilder.andWhere('testimonial.status = :approvedStatus', { 
        approvedStatus: TestimonialStatus.APPROVED 
      });
    } else if (status) {
      queryBuilder.andWhere('testimonial.status = :status', { status });
    }

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('tag.name IN (:...tags)', { tags });
    }
    
    const testimonials = await queryBuilder.getMany();
    
    // Usar el método del mapper para arrays
    return testimonials.map(testimonial => 
      TestimonialMapper.toResponseDto(testimonial)
    );
  }

  async findOne(id: string): Promise<TestimonialResponseDto> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'multimedia']
    });

    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }
    
    // Transformar a DTO de respuesta
    return TestimonialMapper.toResponseDto(testimonial);
  }

  async remove(id: string) {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['multimedia']
    });

    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }
    
    // Eliminar multimedia asociada si existe
    if (testimonial.multimedia) {
      await this.multimediaService.remove(testimonial.multimedia.id);
    }
    
    await this.testimonialRepository.remove(testimonial);
    return { message: 'Testimonio eliminado con éxito' };
  }
  
  async updateStatus(
    id: string, 
    newStatus: TestimonialStatus
  ): Promise<TestimonialResponseDto> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'multimedia']
    });
    
    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }
    
    testimonial.status = newStatus;
    const updatedTestimonial = await this.testimonialRepository.save(testimonial);
    
    // Transformar a DTO
    return TestimonialMapper.toResponseDto(updatedTestimonial);
  }

  // Opcional: Método para obtener lista paginada
  async findAllPaginated(
    filterDto: GetTestimonialsDto & { page?: number; limit?: number },
    user?: User
  ): Promise<TestimonialsListResponseDto> {
    const { page = 1, limit = 10, status, categoryId, tags } = filterDto;
    const skip = (page - 1) * limit;
    const isPublicRequest = !user || (user.rol !== UserRole.ADMIN && user.rol !== UserRole.EDITOR);
    
    const queryBuilder = this.testimonialRepository.createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.category', 'category')
      .leftJoinAndSelect('testimonial.tags', 'tag')
      .leftJoinAndSelect('testimonial.multimedia', 'multimedia')
      .orderBy('testimonial.creadoEn', 'DESC');

    if (isPublicRequest) {
      queryBuilder.andWhere('testimonial.status = :approvedStatus', { 
        approvedStatus: TestimonialStatus.APPROVED 
      });
    } else if (status) {
      queryBuilder.andWhere('testimonial.status = :status', { status });
    }

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('tag.name IN (:...tags)', { tags });
    }
    
    const [testimonials, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    return TestimonialMapper.toListResponseDto(testimonials, total, page, limit);
  }

  // Método interno para obtener la entidad completa (usado internamente)
  async findOneEntity(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'user', 'multimedia']
    });

    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }
    return testimonial;
  }
}