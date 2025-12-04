// src/testimonials/services/query.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetTestimonialsDto } from '../dto/get-testimonials.dto';
import { Testimonial, TestimonialStatus } from '../entities/testimonial.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/interfaces/user-role.enum';

@Injectable()
export class TestimonialQueryService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  buildFindAllQuery(filterDto: GetTestimonialsDto, user?: User) {
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

    return queryBuilder;
  }

  buildPaginatedQuery(filterDto: GetTestimonialsDto & { page?: number; limit?: number }, user?: User) {
    const { page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.buildFindAllQuery(filterDto, user);
    
    return queryBuilder
      .skip(skip)
      .take(limit);
  }
}