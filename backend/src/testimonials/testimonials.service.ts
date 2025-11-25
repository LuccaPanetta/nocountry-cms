import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Testimonial } from './entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { TestimonialStatus } from './entities/testimonial.entity'; 

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

  async findAll() {
    return this.testimonialRepository.find();
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

  async updateStatus(id: string, newStatus: TestimonialStatus) {
    const testimonial = await this.findOne(id); 

    testimonial.status = newStatus; 
    
    return this.testimonialRepository.save(testimonial);
  }

  async remove(id: string) {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);
    return { message: 'Testimonio eliminado con éxito' };
  }
}
