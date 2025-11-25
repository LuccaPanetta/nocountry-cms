import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Testimonial } from './entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { TestimonialStatus } from './entities/testimonial.entity'; 
import { ListTestimonialFilterDto } from './dto/list-testimonial.filter.dto';

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

  async findAll(filterDto: ListTestimonialFilterDto) {
    const { status, category, tags } = filterDto;
    const statusFilter = status || TestimonialStatus.APPROVED;
    const query = this.testimonialRepository.createQueryBuilder('testimonial');
    
    query.where('testimonial.status = :status', { status: statusFilter });
    return query.getMany();
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOneBy({ id });

    if (!testimonial) {
      throw new NotFoundException(`Testimonio con ID ${id} no encontrado`);
    }
    return testimonial;
  }

  async update(id: string, updateTestimonialDto: UpdateTestimonialDto) {
    const testimonial = await this.findOne(id); 
    
    Object.assign(testimonial, updateTestimonialDto); 

    return this.testimonialRepository.save(testimonial);
  }

  async remove(id: string) {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);
    return { message: 'Testimonio eliminado con éxito' };
  }
}
