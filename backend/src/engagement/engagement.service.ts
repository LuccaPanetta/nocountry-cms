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
    
    // **SOLUCIÓN:** Usar QueryBuilder para hacer el JOIN y buscar por el ID del Testimonial
    let metric = await this.engagementRepository
      .createQueryBuilder('engagement')
      // Buscamos a través de la relación 'testimonial'
      // y filtramos donde el id del testimonial sea el que buscamos.
      .innerJoin('engagement.testimonial', 'testimonial', 'testimonial.id = :id', { id: testimonialId })
      .getOne();
      
    // Si no se encuentra (incluye el caso donde la métrica no existe)
    if (!metric) {
      // ⚠️ IMPORTANTE: Necesitas pasar el objeto Testimonial o un objeto con solo el ID 
      // para crear la relación correctamente, ya que no tienes la FK local.
      
      metric = this.engagementRepository.create({
        // Creamos la nueva métrica apuntando al Testimonial.
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
    const metrics = await this.engagementRepository
      .createQueryBuilder('engagement')
      .select(['engagement.views', 'engagement.embeds', 'engagement.ultimaActualizacion', 'engagement.id'])
      .innerJoin('engagement.testimonial', 'testimonial', 'testimonial.id = :id', { id: testimonialId })
      .getOne();

    if (!metrics) {
      return { views: 0, embeds: 0, testimonialId };
    }

    return metrics;
  }
}