import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Testimonial } from './entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async create(createTestimonialDto: CreateTestimonialDto, user: User) {
    const testimonial = this.testimonialRepository.create({
      ...createTestimonialDto,
    });

    return this.testimonialRepository.save(testimonial);
  }

  async findAll(filterDto: GetTestimonialsDto) {
    const { status, categoryId, tags } = filterDto;

    const queryBuilder = this.testimonialRepository.createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.category', 'category')
      .leftJoinAndSelect('testimonial.tags', 'tag'); 

    if (status) {
      queryBuilder.andWhere('testimonial.status = :status', { status });
    }

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('tag.name IN (:...tags)', { tags });
    }
    
    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOneBy({ id });

    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }
    return testimonial;
  }

  async update(id: string, updateTestimonialDto: UpdateTestimonialDto) {
    const testimonial = await this.findOne(id); // Verifica si existe
    
    Object.assign(testimonial, updateTestimonialDto); 

    return this.testimonialRepository.save(testimonial);
  }

  async remove(id: string) {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);
    return { message: 'Testimonio eliminado con éxito' };
  }
}
