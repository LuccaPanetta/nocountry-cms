// src/database/verify-seeds.ts (opcional - para testing)
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from '../testimonials/entities/testimonial.entity';

@Injectable()
export class VerifySeeds {
  private readonly logger = new Logger(VerifySeeds.name);

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async verifyAllTestimonials() {
    this.logger.log('🔍 VERIFICANDO TODOS LOS TESTIMONIOS...');
    
    const testimonials = await this.testimonialRepository.find({
      relations: ['multimedia', 'engagement', 'category', 'tags'],
    });
    
    this.logger.log(`📊 Total testimonios en BD: ${testimonials.length}`);
    
    testimonials.forEach((testimonial, index) => {
      this.logger.log(`\n--- Testimonio ${index + 1} ---`);
      this.logger.log(`ID: ${testimonial.id}`);
      this.logger.log(`Título: ${testimonial.titulo}`);
      this.logger.log(`Status: ${testimonial.status}`);
      this.logger.log(`Autor: ${testimonial.autorNombre}`);
      this.logger.log(`Multimedia: ${testimonial.multimedia ? 'Sí' : 'No'}`);
      if (testimonial.multimedia) {
        this.logger.log(`  Tipo: ${testimonial.multimedia.tipo}`);
        this.logger.log(`  URL: ${testimonial.multimedia.url}`);
      }
      this.logger.log(`Engagement: ${testimonial.engagement ? 'Sí' : 'No'}`);
      if (testimonial.engagement) {
        this.logger.log(`  Views: ${testimonial.engagement.views}`);
        this.logger.log(`  Embeds: ${testimonial.engagement.embeds}`);
      }
      this.logger.log(`Categoría: ${testimonial.category?.name || 'Sin categoría'}`);
      this.logger.log(`Tags: ${testimonial.tags?.map(t => t.name).join(', ') || 'Sin tags'}`);
    });
    
    // Estadísticas
    const withMultimedia = testimonials.filter(t => t.multimedia).length;
    const withEngagement = testimonials.filter(t => t.engagement).length;
    const approved = testimonials.filter(t => t.status === 'approved').length;
    
    this.logger.log('\n📈 ESTADÍSTICAS:');
    this.logger.log(`✅ Testimonios con multimedia: ${withMultimedia}/${testimonials.length}`);
    this.logger.log(`✅ Testimonios con engagement: ${withEngagement}/${testimonials.length}`);
    this.logger.log(`✅ Testimonios aprobados: ${approved}/${testimonials.length}`);
  }
}