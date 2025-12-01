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

  private async findOrCreateMetric(testimonialId: string) {
    let metric = await this.engagementRepository.findOne({
      where: { testimonial: { id: testimonialId } as any },
    });

    if (!metric) {
      metric = this.engagementRepository.create({
        testimonial: { id: testimonialId } as any,
        views: 0,
        embeds: 0,
      });
    }
    return metric;
  }

  async registerView(testimonialId: string) {
    const metric = await this.findOrCreateMetric(testimonialId);
    
    metric.views += 1;
    
    return this.engagementRepository.save(metric);
  }

  async registerEmbed(testimonialId: string) {
    const metric = await this.findOrCreateMetric(testimonialId);
    
    metric.embeds += 1;
    
    return this.engagementRepository.save(metric);
  }
  
  async getMetricsByTestimonialId(testimonialId: string) {
    
    const metrics = await this.engagementRepository.findOne({
      where: { testimonial: { id: testimonialId } as any },
      select: ['views', 'embeds', 'ultimaActualizacion', 'id'], 
    });

    if (!metrics) {
      return { views: 0, embeds: 0, testimonialId };
    }

    return metrics;
  }
}