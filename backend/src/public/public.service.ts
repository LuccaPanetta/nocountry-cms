// src/public/public.service.ts (VERSIÓN CORREGIDA)
import { 
  Injectable, 
  NotFoundException, 
  Inject,
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimonialsService } from '../testimonials/services/testimonials.service';
import { EngagementService } from '../engagement/engagement.service';
import { 
  PublicTestimonialDto, 
  EmbedCodeResponseDto,
  PublicTestimonialsResponseDto,
  PublicMultimediaDto,
  PublicEngagementDto
} from './dto/public-testimonial.dto';
import { Testimonial, TestimonialStatus } from '../testimonials/entities/testimonial.entity';
import { Multimedia } from '../multimedia/entities/multimedia.entity';
import { MultimediaType } from '../multimedia/enums/multimedia-type.enum';
import { EngagementMetric } from '../engagement/entities/engagement.entity';

// Definir el tipo de retorno del engagement service
interface EngagementMetricsResponse {
  views: number;
  embeds: number;
  testimonialId: string;
  ultimaActualizacion?: Date;
  id?: string;
}

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);
  
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    @InjectRepository(EngagementMetric)
    private readonly engagementRepository: Repository<EngagementMetric>,
    @Inject(TestimonialsService)
    private readonly testimonialsService: TestimonialsService,
    @Inject(EngagementService)
    private readonly engagementService: EngagementService,
  ) {
    this.baseUrl = process.env.RENDER_BACKEND_URL || 'http://localhost:3000';
    this.logger.log(`PublicService inicializado con baseUrl: ${this.baseUrl}`);
  }

  async getPublicTestimonialById(id: string): Promise<PublicTestimonialDto> {
    try {
      // Usar QueryBuilder para cargar TODAS las relaciones correctamente
      const testimonialEntity = await this.testimonialRepository
        .createQueryBuilder('testimonial')
        .leftJoinAndSelect('testimonial.multimedia', 'multimedia')
        .leftJoinAndSelect('testimonial.engagement', 'engagement')
        .leftJoinAndSelect('testimonial.category', 'category')
        .leftJoinAndSelect('testimonial.tags', 'tags')
        .where('testimonial.id = :id', { id })
        .andWhere('testimonial.status = :status', { status: TestimonialStatus.APPROVED })
        .getOne();

      this.logger.debug(`🔍 Buscando testimonio ${id}`, {
        encontrado: !!testimonialEntity,
        tieneMultimedia: !!testimonialEntity?.multimedia,
        tieneEngagement: !!testimonialEntity?.engagement,
        tieneCategory: !!testimonialEntity?.category,
        tieneTags: testimonialEntity?.tags?.length || 0
      });

      if (!testimonialEntity) {
        throw new NotFoundException('Testimonio no encontrado o no aprobado');
      }

      // Registrar vista
      await this.engagementService.registerView(id);

      // Obtener engagement actualizado - CASTEAR AL TIPO CORRECTO
      const engagementMetrics = await this.engagementService.getMetricsByTestimonialId(id) as EngagementMetricsResponse;

      // Preparar multimedia DTO
      let multimediaDto: PublicMultimediaDto | undefined;
      if (testimonialEntity.multimedia) {
        multimediaDto = this.mapMultimediaToDto(testimonialEntity.multimedia);
        this.logger.debug(`📸 Multimedia mapeada:`, multimediaDto);
      }

      // Preparar engagement DTO - USAR EL OBJETO engagementMetrics CON EL TIPO CORRECTO
      const engagementDto: PublicEngagementDto = {
        views: engagementMetrics?.views || 0,
        embeds: engagementMetrics?.embeds || 0,
        lastUpdated: engagementMetrics?.ultimaActualizacion || new Date()
      };

      // Mapear a DTO público
      const publicTestimonial: PublicTestimonialDto = {
        id: testimonialEntity.id,
        title: testimonialEntity.titulo,
        content: testimonialEntity.contenido,
        author: testimonialEntity.autorNombre || 'Anónimo',
        company: testimonialEntity.empresa,
        position: testimonialEntity.cargo,
        status: testimonialEntity.status,
        category: this.extractCategoryName(testimonialEntity),
        tags: this.extractTagNames(testimonialEntity),
        multimedia: multimediaDto,
        createdAt: testimonialEntity.creadoEn,
        updatedAt: testimonialEntity.actualizadoEn,
        engagement: engagementDto
      };

      this.logger.debug(`✅ DTO final generado:`, {
        id: publicTestimonial.id,
        tieneMultimedia: !!publicTestimonial.multimedia,
        multimediaType: publicTestimonial.multimedia?.type,
        engagementViews: publicTestimonial.engagement.views,
        engagementLastUpdated: publicTestimonial.engagement.lastUpdated
      });

      return publicTestimonial;

    } catch (error) {
      this.logger.error(`❌ Error obteniendo testimonio público ${id}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Error al obtener el testimonio');
    }
  }

  async getPublicTestimonials(
    page: number = 1,
    limit: number = 10,
    category?: string,
    tags?: string[]
  ): Promise<PublicTestimonialsResponseDto> {
    try {
      // Usar QueryBuilder para optimizar la consulta
      const query = this.testimonialRepository
        .createQueryBuilder('testimonial')
        .leftJoinAndSelect('testimonial.multimedia', 'multimedia')
        .leftJoinAndSelect('testimonial.engagement', 'engagement')
        .leftJoinAndSelect('testimonial.category', 'category')
        .leftJoinAndSelect('testimonial.tags', 'tags')
        .where('testimonial.status = :status', { status: TestimonialStatus.APPROVED })
        .orderBy('testimonial.creadoEn', 'DESC');

      // Aplicar filtros
      if (category) {
        query.andWhere('category.name = :category', { category });
      }

      if (tags && tags.length > 0) {
        query.andWhere('tags.name IN (:...tags)', { tags });
      }

      // Paginación
      const skip = (page - 1) * limit;
      const [testimonialEntities, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      this.logger.debug(`📊 Resultados paginados:`, {
        pagina: page,
        limite: limit,
        total: total,
        encontrados: testimonialEntities.length
      });

      // Mapear a DTOs públicos
      const publicTestimonials = await Promise.all(
        testimonialEntities.map(async (testimonial) => {
          // Registrar vista para cada testimonio (opcional)
          await this.engagementService.registerView(testimonial.id);

          // Obtener engagement actualizado - CASTEAR AL TIPO CORRECTO
          const engagementMetrics = await this.engagementService.getMetricsByTestimonialId(testimonial.id) as EngagementMetricsResponse;

          return {
            id: testimonial.id,
            title: testimonial.titulo,
            content: testimonial.contenido,
            author: testimonial.autorNombre || 'Anónimo',
            company: testimonial.empresa,
            position: testimonial.cargo,
            status: testimonial.status,
            category: this.extractCategoryName(testimonial),
            tags: this.extractTagNames(testimonial),
            multimedia: testimonial.multimedia ? this.mapMultimediaToDto(testimonial.multimedia) : undefined,
            createdAt: testimonial.creadoEn,
            updatedAt: testimonial.actualizadoEn,
            engagement: {
              views: engagementMetrics?.views || 0,
              embeds: engagementMetrics?.embeds || 0,
              lastUpdated: engagementMetrics?.ultimaActualizacion || new Date()
            }
          };
        })
      );

      return {
        testimonials: publicTestimonials,
        total,
        page,
        limit
      };

    } catch (error) {
      this.logger.error('❌ Error obteniendo testimonios públicos:', error.message);
      throw error;
    }
  }

  // Método alternativo para obtener engagement desde el repository directamente
  private async getEngagementFromRepository(testimonialId: string): Promise<EngagementMetricsResponse> {
    try {
      const engagement = await this.engagementRepository.findOne({
        where: { testimonial: { id: testimonialId } },
        relations: ['testimonial']
      });

      if (engagement) {
        return {
          views: engagement.views,
          embeds: engagement.embeds,
          testimonialId: engagement.testimonial.id,
          ultimaActualizacion: engagement.ultimaActualizacion,
          id: engagement.id
        };
      }

      // Si no existe engagement, crear uno por defecto
      return {
        views: 0,
        embeds: 0,
        testimonialId,
        ultimaActualizacion: new Date()
      };
    } catch (error) {
      this.logger.error(`Error obteniendo engagement para ${testimonialId}:`, error.message);
      return {
        views: 0,
        embeds: 0,
        testimonialId,
        ultimaActualizacion: new Date()
      };
    }
  }

  private mapMultimediaToDto(multimedia: Multimedia): PublicMultimediaDto {
    return {
      id: multimedia.id,
      type: multimedia.tipo,
      url: multimedia.url,
      description: multimedia.descripcion,
      // Agregar campos adicionales si los necesitas
      ...(multimedia.nombreArchivo && { nombreArchivo: multimedia.nombreArchivo }),
      ...(multimedia.publicId && { publicId: multimedia.publicId })
    };
  }

  private extractCategoryName(testimonial: Testimonial): string {
    if (!testimonial.category) return 'Sin categoría';
    
    if (typeof testimonial.category === 'string') {
      return testimonial.category;
    }
    
    return testimonial.category?.name || 'Sin categoría';
  }

  private extractTagNames(testimonial: Testimonial): string[] {
    if (!testimonial.tags || !Array.isArray(testimonial.tags)) return [];
    
    return testimonial.tags
      .map(tag => {
        if (typeof tag === 'string') return tag;
        return tag?.name || '';
      })
      .filter(Boolean);
  }

  async getEmbedCode(testimonialId: string): Promise<EmbedCodeResponseDto> {
    try {
      // Verificar que existe y está aprobado
      const testimonial = await this.getPublicTestimonialById(testimonialId);
      
      // Registrar embed
      await this.engagementService.registerEmbed(testimonialId);

      // Generar códigos de embed
      const htmlCode = this.generateHtmlEmbed(testimonial);
      const scriptCode = this.generateScriptEmbed(testimonialId);

      return {
        html: htmlCode,
        script: scriptCode,
        testimonialId,
        apiUrl: `${this.baseUrl}/api/v1/public/testimonials/${testimonialId}`,
        previewUrl: `${this.baseUrl}/api/v1/public/embeds/${testimonialId}/preview`,
        hasMultimedia: !!testimonial.multimedia
      };

    } catch (error) {
      this.logger.error(`Error generando embed code para ${testimonialId}:`, error.message);
      throw error;
    }
  }

  private generateHtmlEmbed(testimonial: PublicTestimonialDto): string {
    const initials = testimonial.author?.charAt(0)?.toUpperCase() || 'A';
    const color = this.stringToColor(testimonial.id);
    
    // Generar sección de multimedia si existe
    const multimediaHtml = this.generateMultimediaHtml(testimonial.multimedia);
    
    return `
<div class="testimonial-embed" data-testimonial-id="${testimonial.id}" data-has-multimedia="${!!testimonial.multimedia}" style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: ${testimonial.multimedia ? '500px' : '400px'};
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: ${testimonial.multimedia ? '0' : '20px'};
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin: 10px auto;
    overflow: hidden;">
    
    <!-- Multimedia Section -->
    ${multimediaHtml}
    
    <!-- Content Section -->
    <div style="padding: 20px;">
        <!-- Header -->
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: ${color};
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 20px;
                margin-right: 16px;">
                ${initials}
            </div>
            <div>
                <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #1e293b;">
                    ${testimonial.author}
                </h3>
                ${testimonial.position ? `
                <p style="margin: 0 0 2px 0; font-size: 14px; color: #64748b;">
                    ${testimonial.position}
                </p>` : ''}
                ${testimonial.company ? `
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                    ${testimonial.company}
                </p>` : ''}
            </div>
        </div>
        
        <!-- Content -->
        <div style="margin-bottom: 16px;">
            <p style="
                margin: 0 0 12px 0;
                font-size: 15px;
                line-height: 1.5;
                color: #334155;
                font-style: italic;">
                "${testimonial.content}"
            </p>
        </div>
        
        <!-- Tags -->
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
            <span style="
                background: #e0e7ff;
                color: #4f46e5;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;">
                ${testimonial.category}
            </span>
            ${testimonial.tags.slice(0, 3).map(tag => `
            <span style="
                background: #f1f5f9;
                color: #64748b;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;">
                ${tag}
            </span>
            `).join('')}
        </div>
        
        <!-- Stats -->
        <div style="
            border-top: 1px solid #f1f5f9;
            padding-top: 12px;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;">
            <span>👁️ ${testimonial.engagement.views} vistas</span>
            <span>🔗 ${testimonial.engagement.embeds} embeds</span>
            <span>📅 ${new Date(testimonial.createdAt).toLocaleDateString('es-ES')}</span>
        </div>
        
        <!-- Powered by -->
        <div style="
            text-align: center;
            margin-top: 16px;
            font-size: 10px;
            color: #cbd5e1;">
            Powered by <a href="${this.baseUrl}" target="_blank" 
               style="color: #4f46e5; text-decoration: none;">Testimonial CMS</a>
        </div>
    </div>
</div>`;
  }

  private generateMultimediaHtml(multimedia?: PublicMultimediaDto): string {
    if (!multimedia) return '';
    
    switch (multimedia.type) {
      case MultimediaType.VIDEO:
        const youtubeId = this.extractYouTubeId(multimedia.url);
        if (youtubeId) {
          return `
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000;">
    <iframe 
        src="https://www.youtube.com/embed/${youtubeId}?rel=0&showinfo=0" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        title="${multimedia.description || 'Video testimonio'}">
    </iframe>
</div>`;
        } else {
          return `
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000;">
    <video 
        src="${multimedia.url}" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        controls
        preload="metadata"
        poster="https://via.placeholder.com/800x450/4f46e5/ffffff?text=Testimonio+Video">
        Tu navegador no soporta el elemento de video.
    </video>
</div>`;
        }
        
      case MultimediaType.IMAGE:
        return `
<div style="
    width: 100%;
    height: 250px;
    overflow: hidden;
    border-radius: 12px 12px 0 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <img 
        src="${multimedia.url}" 
        alt="${multimedia.description || 'Testimonio imagen'}"
        style="width: 100%; height: 100%; object-fit: cover; display: block;"
        onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)';">
</div>`;
        
      default:
        return '';
    }
  }

  private generateScriptEmbed(testimonialId: string): string {
    return `<script src="${this.baseUrl}/api/v1/public/embed/${testimonialId}.js" async></script>`;
  }

  async generateEmbedScript(testimonialId: string): Promise<string> {
    try {
      const testimonial = await this.getPublicTestimonialById(testimonialId);
      
      // Registrar vista para el script también
      await this.engagementService.registerView(testimonialId);

      return `
(function() {
    'use strict';
    
    function loadTestimonial() {
        var container = document.currentScript.parentNode;
        var testimonialContainer = document.createElement('div');
        testimonialContainer.className = 'testimonial-embed-container-' + '${testimonialId}';
        
        var html = \`${this.generateHtmlEmbed(testimonial)}\`;
        testimonialContainer.innerHTML = html;
        
        container.insertBefore(testimonialContainer, document.currentScript);
        
        // Dispatch event
        var event = new CustomEvent('testimonialLoaded', {
            detail: {
                testimonialId: '${testimonialId}',
                container: testimonialContainer,
                hasMultimedia: ${!!testimonial.multimedia}
            }
        });
        document.dispatchEvent(event);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadTestimonial);
    } else {
        loadTestimonial();
    }
})();`;
    } catch (error) {
      this.logger.error(`Error generando script embed para ${testimonialId}:`, error.message);
      throw error;
    }
  }

  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
        '#4f46e5', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#06b6d4', // Cyan
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }
}