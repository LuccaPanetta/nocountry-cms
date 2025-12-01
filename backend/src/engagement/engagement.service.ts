import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EngagementMetric } from './entities/engagement.entity';

@Injectable()
export class EngagementService {
  constructor(
    @InjectRepository(EngagementMetric)
    private readonly engagementRepository: Repository<EngagementMetric>,
  ) {}

  async registerView(testimonialId: string) {
    
    let metric = await this.engagementRepository.findOne({
      where: { testimonial: { id: testimonialId } as any },
      relations: ['testimonial'],
    });

    if (!metric) {
      metric = this.engagementRepository.create({
        testimonial: { id: testimonialId } as any,
        views: 1,
        embeds: 0,
      });
    } else {
      metric.views += 1;
    }

    return this.engagementRepository.save(metric);
  }
}