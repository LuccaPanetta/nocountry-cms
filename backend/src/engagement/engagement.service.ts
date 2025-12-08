// src/engagement/engagement.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EngagementMetric } from './entities/engagement.entity';

@Injectable()
export class EngagementService {
    private readonly logger = new Logger(EngagementService.name);

    constructor(
        @InjectRepository(EngagementMetric)
        private readonly engagementRepository: Repository<EngagementMetric>,
    ) {}

    private async findOrCreateMetric(testimonialId: string) {
        
        let metric = await this.engagementRepository
            .createQueryBuilder('engagement')
            .innerJoin('engagement.testimonial', 'testimonial', 'testimonial.id = :id', { id: testimonialId })
            .getOne();

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
        
        const now = new Date();
        metric.views += 1;
        metric.ultimaActualizacion = now; 
        
        this.logger.debug(`✅ VISTA REGISTRADA (Bloqueo desactivado, suma forzada) para ${testimonialId}. Nuevo total: ${metric.views}`);
        
        return this.engagementRepository.save(metric);
    }

    async registerEmbed(testimonialId: string) {
        const metric = await this.findOrCreateMetric(testimonialId);
        
        metric.embeds += 1; 
        metric.ultimaActualizacion = new Date(); 

        this.logger.debug(`✅ Embed registrado para ${testimonialId}. Nuevo embed: ${metric.embeds}`);
        return this.engagementRepository.save(metric);
    }
    
    async getMetricsByTestimonialId(testimonialId: string) {
        const metrics = await this.engagementRepository
            .createQueryBuilder('engagement')
            .select(['engagement.views', 'engagement.embeds', 'engagement.ultimaActualizacion', 'engagement.id'])
            .innerJoin('engagement.testimonial', 'testimonial', 'testimonial.id = :id', { id: testimonialId })
            .getOne();

        if (!metrics) {
            return { 
                views: 0, 
                embeds: 0, 
                testimonialId,
                ultimaActualizacion: new Date(), 
                id: undefined 
            };
        }

        return {
            views: metrics.views,
            embeds: metrics.embeds,
            testimonialId,
            ultimaActualizacion: metrics.ultimaActualizacion,
            id: metrics.id
        };
    }
}