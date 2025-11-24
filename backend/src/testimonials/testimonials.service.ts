import { Injectable } from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async create(createTestimonialDto: CreateTestimonialDto, user: User) {
    // Creamos una nueva instancia del testimonio
    const testimonial = this.testimonialRepository.create({
      ...createTestimonialDto,
    });

    // Guardamos en la base de datos
    return this.testimonialRepository.save(testimonial);
  }

  async findAll() {
    return this.testimonialRepository.find();
  }
  
  findOne(id: number) {
    return `This action returns a #${id} testimonial`;
  }
  
  update(id: number, updateTestimonialDto: UpdateTestimonialDto) {
    return `This action updates a #${id} testimonial`;
  }

  remove(id: number) {
    return `This action removes a #${id} testimonial`;
  }
}
