// src/testimonials/testimonials.service.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { Testimonial, TestimonialStatus } from './entities/testimonial.entity';
import { User } from '../users/entities/user.entity'; 
import { UserRole } from '../users/interfaces/user-role.enum'; 
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTestimonialDto: CreateTestimonialDto, user: User) {
  // ✅ Verificar que la categoría existe
  const category = await this.categoryRepository.findOne({
    where: { id: createTestimonialDto.categoryId }
  });

  if (!category) {
    throw new BadRequestException('La categoría especificada no existe');
  }

  // ✅ Buscar los tags si se proporcionan
  let tags: Tag[] = [];
  if (createTestimonialDto.tagIds && createTestimonialDto.tagIds.length > 0) {
    tags = await this.tagRepository.find({
      where: { id: In(createTestimonialDto.tagIds) }
    });

    // ✅ DESCOMENTAR la validación de tags
    if (tags.length !== createTestimonialDto.tagIds.length) {
      throw new BadRequestException('Algunos tags no existen');
    }
  }

  // ✅ Crear el testimonio - ASIGNAR directamente el objeto category
  const testimonial = this.testimonialRepository.create({
    contenido: createTestimonialDto.contenido,
    autorNombre: createTestimonialDto.autorNombre,
    videoUrl: createTestimonialDto.videoUrl,
    imageUrl: createTestimonialDto.imageUrl,
    category: category, // ← Asignar el objeto completo, no solo el ID
    tags: tags,
    user: user,
    status: createTestimonialDto.status || TestimonialStatus.PENDING,
  });

  return await this.testimonialRepository.save(testimonial);
}

  async findAll(filterDto: GetTestimonialsDto, user?: User) {
    const { status, categoryId, tags } = filterDto;
    const isPublicRequest = !user || (user.rol !== UserRole.ADMIN && user.rol !== UserRole.EDITOR);
    
    const queryBuilder = this.testimonialRepository.createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.category', 'category')
      .leftJoinAndSelect('testimonial.tags', 'tag')
      .leftJoinAndSelect('testimonial.user', 'user');

    // ✅ Solo mostrar aprobados para requests públicos
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
    
    return await queryBuilder
      .orderBy('testimonial.creadoEn', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'user', 'multimedias']
    });

    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }
    return testimonial;
  }

 async update(id: string, updateTestimonialDto: UpdateTestimonialDto) {
  const testimonial = await this.findOne(id);
  
  // ✅ Manejar actualización de categoría si se proporciona
  if (updateTestimonialDto.categoryId) {
    const category = await this.categoryRepository.findOne({
      where: { id: updateTestimonialDto.categoryId }
    });

    if (!category) {
      throw new BadRequestException('La categoría especificada no existe');
    }
    testimonial.category = category; // ← Asignar el objeto category
  }

  // ✅ Manejar actualización de tags si se proporcionan
  if (updateTestimonialDto.tagIds) {
    const tags = await this.tagRepository.find({
      where: { id: In(updateTestimonialDto.tagIds) }
    });

    if (tags.length !== updateTestimonialDto.tagIds.length) {
      throw new BadRequestException('Algunos tags no existen');
    }
    testimonial.tags = tags;
  }

  // ✅ Actualizar otros campos
  Object.assign(testimonial, {
    contenido: updateTestimonialDto.contenido,
    autorNombre: updateTestimonialDto.autorNombre,
    videoUrl: updateTestimonialDto.videoUrl,
    imageUrl: updateTestimonialDto.imageUrl,
    status: updateTestimonialDto.status, // ← Agregar status si se actualiza
  });

  return await this.testimonialRepository.save(testimonial);
}

  async remove(id: string) {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);
    return { message: 'Testimonio eliminado con éxito' };
  }
  
  async updateStatus(id: string, newStatus: TestimonialStatus) {
    const testimonial = await this.findOne(id);
    testimonial.status = newStatus;
    
    return await this.testimonialRepository.save(testimonial);
  }
}