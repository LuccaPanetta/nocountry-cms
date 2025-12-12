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
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { GetTestimonialsDto } from '../dto/get-testimonials.dto';
import { Multimedia } from '../../multimedia/entities/multimedia.entity';
import { 
  TestimonialDataDto,
  TestimonialResponseDto,
  CreateTestimonialResponseDto,
  TestimonialsListResponseDto
} from '../dto/testimonial-response.dto';
import { Testimonial, TestimonialStatus } from '../entities/testimonial.entity';
import { User } from '../../users/entities/user.entity'; 
import { UserRole } from '../../users/interfaces/user-role.enum'; 
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { MultimediaService } from '../../multimedia/multimedia.service';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';
import { TestimonialMapper } from '../mappers/testimonial.mapper';

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

    // Crear testimonio
    const testimonial = this.testimonialRepository.create({
      contenido: createTestimonialDto.contenido,
      titulo: createTestimonialDto.titulo,
      autorNombre: createTestimonialDto.autorNombre,
      empresa: createTestimonialDto.empresa,
      cargo: createTestimonialDto.cargo,
      category: category,
      tags: tags,
      user: user,
      status: TestimonialStatus.PENDING,
    });

    const savedTestimonial = await this.testimonialRepository.save(testimonial);

    // 1. Procesar archivo si existe
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
    // 2. Procesar URL externa si existe (YouTube, Vimeo, etc.)
    else if (createTestimonialDto.multimediaUrl && multimediaData) {
      const { tipo, descripcion } = multimediaData;
      
      // Determinar el tipo si no se proporcionó (basado en la URL)
      const tipoFinal = tipo || this.determinarTipoPorUrl(createTestimonialDto.multimediaUrl);
      
      // Crear multimedia para URL externa
      const multimediaResult = await this.multimediaService.createWithUrl(
        savedTestimonial.id,
        createTestimonialDto.multimediaUrl,
        tipoFinal,
        descripcion
      );

      savedTestimonial.multimedia = multimediaResult;
      await this.testimonialRepository.save(savedTestimonial);
      multimedia = multimediaResult;
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

    // ⚠️ IMPORTANTE: Remover campos de multimedia del DTO
    // Esto evita que se procesen
    delete (updateTestimonialDto as any).tipo;
    delete (updateTestimonialDto as any).descripcion;
    delete (updateTestimonialDto as any).multimediaUrl;

    // 1. Actualizar categoría si se proporciona
    if (updateTestimonialDto.categoryId !== undefined) {
      // ... (código existente) ...
    }

    // 2. Actualizar tags si se proporcionan
    if (updateTestimonialDto.tagIds !== undefined) {
      // ... (código existente) ...
    }

    // 3. Actualizar campos básicos
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

    // ⚠️ 4. IGNORAR COMPLETAMENTE file y multimediaData
    // No hacer nada con ellos
    // El multimedia existente se mantiene automáticamente
    
    // Guardar cambios
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

    // Transformar a DTO
    return TestimonialMapper.toCreateResponseDto(
      testimonialCompleto,
      testimonialCompleto.multimedia || undefined
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
  
  // En TestimonialsService, reemplaza el método updateStatus:
async updateStatus(
  id: string, 
  newStatus: TestimonialStatus,
  user?: User // Agrega el parámetro user
): Promise<TestimonialResponseDto> {
  const testimonial = await this.testimonialRepository.findOne({
    where: { id },
    relations: ['category', 'tags', 'multimedia']
  });
  
  if (!testimonial) {
    throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
  }

  // Validar transición de estado según el rol del usuario
  this.validateStatusTransition(testimonial.status, newStatus, user?.rol);

  // Actualizar estado
  testimonial.status = newStatus;
  const updatedTestimonial = await this.testimonialRepository.save(testimonial);
  
  // Transformar a DTO
  return TestimonialMapper.toResponseDto(updatedTestimonial);
}

private validateStatusTransition(
  currentStatus: TestimonialStatus,
  newStatus: TestimonialStatus,
  userRole?: UserRole
): void {
  // Si no hay usuario (público), no puede cambiar estados
  if (!userRole) {
    throw new BadRequestException('Se requiere autenticación para cambiar el estado');
  }

  if (currentStatus === newStatus) {
    return;
  }

  const allowedTransitions = {
    [UserRole.EDITOR]: {
      from: [TestimonialStatus.PENDING],
      to: [TestimonialStatus.IN_REVIEW, TestimonialStatus.REJECTED]
    },
    [UserRole.ADMIN]: {
      from: [TestimonialStatus.PENDING, TestimonialStatus.IN_REVIEW],
      to: [TestimonialStatus.IN_REVIEW, TestimonialStatus.APPROVED, TestimonialStatus.REJECTED]
    }
  };

  const userTransitions = allowedTransitions[userRole];
  if (!userTransitions) {
    throw new BadRequestException(`El rol ${userRole} no tiene permisos para cambiar estados`);
  }

  if (!userTransitions.from.includes(currentStatus)) {
    throw new BadRequestException(
      `El rol ${userRole} no puede cambiar estados desde ${currentStatus}. ` +
      `Estados permitidos: ${userTransitions.from.join(', ')}`
    );
  }

  if (!userTransitions.to.includes(newStatus)) {
    throw new BadRequestException(
      `El rol ${userRole} no puede cambiar estados a ${newStatus}. ` +
      `Estados permitidos: ${userTransitions.to.join(', ')}`
    );
  }

  const statusOrder = [
    TestimonialStatus.PENDING,
    TestimonialStatus.IN_REVIEW,
    TestimonialStatus.APPROVED,
    TestimonialStatus.REJECTED
  ];
  
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);

  if (newStatus !== TestimonialStatus.REJECTED && newIndex < currentIndex) {
    throw new BadRequestException('No se puede retroceder en el flujo de estados');
  }

  const finalStates = [TestimonialStatus.APPROVED, TestimonialStatus.REJECTED];
  if (finalStates.includes(currentStatus) && userRole !== UserRole.ADMIN) {
    throw new BadRequestException(
      `No se puede cambiar el estado desde ${currentStatus}. Estados finales no pueden ser modificados.`
    );
  }

  if (finalStates.includes(currentStatus) && userRole === UserRole.ADMIN) {
    if (![TestimonialStatus.APPROVED, TestimonialStatus.REJECTED].includes(newStatus)) {
      throw new BadRequestException(
        'Como administrador, solo puedes cambiar entre APPROVED y REJECTED para testimonios finalizados'
      );
    }
  }
}

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