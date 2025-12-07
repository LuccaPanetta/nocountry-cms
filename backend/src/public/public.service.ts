// src/public/public.service.ts (VERSIÓN COMPLETA CON TUS ENTIDADES)
import { 
  Injectable, 
  NotFoundException, 
  Inject,
  Logger,
  BadRequestException 
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
import { ConfigService } from '@nestjs/config';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';

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
  private readonly embedStyles: {
    default: { [key: string]: string };
    withMedia: { [key: string]: string };
  };

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    @InjectRepository(EngagementMetric)
    private readonly engagementRepository: Repository<EngagementMetric>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @Inject(TestimonialsService)
    private readonly testimonialsService: TestimonialsService,
    @Inject(EngagementService)
    private readonly engagementService: EngagementService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = process.env.RENDER_BACKEND_URL || 
                   configService.get<string>('APP_URL') || 
                   'http://localhost:3000';
    
    this.embedStyles = {
      default: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        maxWidth: "400px",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        background: "white",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        margin: "10px auto",
        overflow: "hidden",
      },
      withMedia: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        maxWidth: "500px",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "0",
        background: "white",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        margin: "10px auto",
        overflow: "hidden",
      }
    };
    
    this.logger.log(`PublicService inicializado con baseUrl: ${this.baseUrl}`);
  }

  async getPublicTestimonialById(id: string): Promise<PublicTestimonialDto> {
    try {
      // Validar formato UUID
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('ID de testimonio inválido');
      }

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

      // Obtener engagement actualizado
      const engagementMetrics = await this.getEngagementMetrics(id);

      // Preparar multimedia DTO
      let multimediaDto: PublicMultimediaDto | undefined;
      if (testimonialEntity.multimedia) {
        multimediaDto = this.mapMultimediaToDto(testimonialEntity.multimedia);
        this.logger.debug(`📸 Multimedia mapeada:`, multimediaDto);
      }

      // Preparar engagement DTO
      const engagementDto: PublicEngagementDto = {
        views: engagementMetrics?.views || 0,
        embeds: engagementMetrics?.embeds || 0,
        lastUpdated: engagementMetrics?.ultimaActualizacion || new Date()
      };

      // Determinar si tiene multimedia
      const hasMultimedia = !!multimediaDto;
      const mediaType = this.determineMediaType(multimediaDto);

      // Mapear a DTO público
      const publicTestimonial: PublicTestimonialDto = {
        id: testimonialEntity.id,
        title: testimonialEntity.titulo || '',
        content: testimonialEntity.contenido,
        author: testimonialEntity.autorNombre || 'Anónimo',
        company: testimonialEntity.empresa,
        position: testimonialEntity.cargo,
        status: testimonialEntity.status,
        videoUrl: testimonialEntity['videoUrl'], // Si existe en la entidad
        category: this.extractCategoryName(testimonialEntity),
        tags: this.extractTagNames(testimonialEntity),
        multimedia: multimediaDto,
        createdAt: testimonialEntity.creadoEn,
        updatedAt: testimonialEntity.actualizadoEn,
        engagement: engagementDto,
        hasMultimedia,
        mediaType
      };

      this.logger.debug(`✅ DTO final generado:`, {
        id: publicTestimonial.id,
        tieneMultimedia: publicTestimonial.hasMultimedia,
        mediaType: publicTestimonial.mediaType,
        multimediaType: publicTestimonial.multimedia?.type,
        engagementViews: publicTestimonial.engagement.views,
        engagementLastUpdated: publicTestimonial.engagement.lastUpdated
      });

      return publicTestimonial;

    } catch (error) {
      this.logger.error(`❌ Error obteniendo testimonio público ${id}:`, error.message);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new NotFoundException('Error al obtener el testimonio');
    }
  }

  async getPublicTestimonials(
    page: number = 1,
    limit: number = 10,
    categoryName?: string,
    tags?: string[]
  ): Promise<PublicTestimonialsResponseDto> {
    try {
      // Validar parámetros
      const pageNum = Math.max(1, page);
      const limitNum = Math.min(50, Math.max(1, limit));

      // Usar QueryBuilder para optimizar la consulta
      const query = this.testimonialRepository
        .createQueryBuilder('testimonial')
        .leftJoinAndSelect('testimonial.multimedia', 'multimedia')
        .leftJoinAndSelect('testimonial.engagement', 'engagement')
        .leftJoinAndSelect('testimonial.category', 'category')
        .leftJoinAndSelect('testimonial.tags', 'tags')
        .where('testimonial.status = :status', { status: TestimonialStatus.APPROVED })
        .orderBy('testimonial.creadoEn', 'DESC');

      // Aplicar filtros por categoría (por nombre)
      if (categoryName) {
        query.andWhere('category.name = :categoryName', { categoryName });
      }

      // Aplicar filtros por tags (por nombre)
      if (tags && tags.length > 0) {
        query.andWhere('tags.name IN (:...tags)', { tags });
      }

      // Paginación
      const skip = (pageNum - 1) * limitNum;
      const [testimonialEntities, total] = await query
        .skip(skip)
        .take(limitNum)
        .getManyAndCount();

      this.logger.debug(`📊 Resultados paginados:`, {
        pagina: pageNum,
        limite: limitNum,
        total: total,
        encontrados: testimonialEntities.length
      });

      // Mapear a DTOs públicos
      const publicTestimonials = await Promise.all(
        testimonialEntities.map(async (testimonial) => {
          // Registrar vista para cada testimonio
          await this.engagementService.registerView(testimonial.id);

          // Obtener engagement actualizado
          const engagementMetrics = await this.getEngagementMetrics(testimonial.id);

          // Preparar multimedia DTO
          let multimediaDto: PublicMultimediaDto | undefined;
          if (testimonial.multimedia) {
            multimediaDto = this.mapMultimediaToDto(testimonial.multimedia);
          }

          // Determinar si tiene multimedia
          const hasMultimedia = !!multimediaDto;
          const mediaType = this.determineMediaType(multimediaDto);

          return {
            id: testimonial.id,
            title: testimonial.titulo || '',
            content: testimonial.contenido,
            author: testimonial.autorNombre || 'Anónimo',
            company: testimonial.empresa,
            position: testimonial.cargo,
            status: testimonial.status,
            videoUrl: testimonial['videoUrl'], // Si existe en la entidad
            category: this.extractCategoryName(testimonial),
            tags: this.extractTagNames(testimonial),
            multimedia: multimediaDto,
            createdAt: testimonial.creadoEn,
            updatedAt: testimonial.actualizadoEn,
            engagement: {
              views: engagementMetrics?.views || 0,
              embeds: engagementMetrics?.embeds || 0,
              lastUpdated: engagementMetrics?.ultimaActualizacion || new Date()
            },
            hasMultimedia,
            mediaType
          };
        })
      );

      return {
        testimonials: publicTestimonials,
        total,
        page: pageNum,
        limit: limitNum
      };

    } catch (error) {
      this.logger.error('❌ Error obteniendo testimonios públicos:', error.message);
      throw error;
    }
  }

  async getTestimonialMultimedia(id: string): Promise<{
    multimedia?: PublicMultimediaDto;
    videoUrl?: string;
    hasMultimedia: boolean;
    mediaType: string;
  }> {
    const testimonial = await this.getPublicTestimonialById(id);
    
    return {
      multimedia: testimonial.multimedia,
      videoUrl: testimonial.videoUrl,
      hasMultimedia: testimonial.hasMultimedia,
      mediaType: testimonial.mediaType
    };
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
        hasMultimedia: testimonial.hasMultimedia
      };

    } catch (error) {
      this.logger.error(`Error generando embed code para ${testimonialId}:`, error.message);
      throw error;
    }
  }

  async generateEmbedScript(testimonialId: string): Promise<string> {
    try {
      const testimonial = await this.getPublicTestimonialById(testimonialId);
      
      // Registrar vista para el script también
      await this.engagementService.registerView(testimonialId);

      const htmlEmbed = this.generateHtmlEmbed(testimonial);

      return `
(function() {
    'use strict';
    
    function loadTestimonial() {
        var container = document.currentScript.parentNode;
        var testimonialContainer = document.createElement('div');
        testimonialContainer.className = 'testimonial-embed-container';
        testimonialContainer.setAttribute('data-testimonial-id', '${testimonialId}');
        
        var html = \`${htmlEmbed}\`;
        testimonialContainer.innerHTML = html;
        
        // Insertar antes del script
        if (document.currentScript) {
            document.currentScript.parentNode.insertBefore(testimonialContainer, document.currentScript);
        } else {
            // Fallback: insertar al final del body
            document.body.appendChild(testimonialContainer);
        }
        
        // Dispatch event
        try {
            var event = new CustomEvent('testimonialLoaded', {
                detail: {
                    testimonialId: '${testimonialId}',
                    container: testimonialContainer,
                    hasMultimedia: ${testimonial.hasMultimedia},
                    mediaType: '${testimonial.mediaType}'
                }
            });
            document.dispatchEvent(event);
        } catch(e) {
            console.log('Testimonio cargado:', testimonialId);
        }
    }
    
    // Cargar cuando el DOM esté listo
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

  // ========== MÉTODOS PRIVADOS AUXILIARES ==========

  private async getEngagementMetrics(testimonialId: string): Promise<EngagementMetricsResponse> {
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
      // Nota: Los campos thumbnailUrl, width, height, duration no existen en tu entidad
      // Si los necesitas, debes agregarlos a la entidad Multimedia
      thumbnailUrl: undefined,
      width: undefined,
      height: undefined,
      duration: undefined,
      // Campos adicionales
      ...(multimedia.nombreArchivo && { fileName: multimedia.nombreArchivo }),
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

  private determineMediaType(multimedia?: PublicMultimediaDto): string {
    if (!multimedia) return 'none';
    
    switch (multimedia.type) {
      case MultimediaType.VIDEO:
        return 'video';
      case MultimediaType.IMAGE:
        return 'image';
      default:
        return 'none';
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  private formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private extractYouTubeId(url: string): string | null {
    if (!url) return null;
    
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

  private extractVimeoId(url: string): string | null {
    if (!url) return null;
    
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /vimeo\.com\/video\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  // ========== MÉTODOS PRIVADOS PARA GENERACIÓN DE EMBEDS ==========

  private generateHtmlEmbed(testimonial: PublicTestimonialDto): string {
    const initials = testimonial.author?.charAt(0)?.toUpperCase() || 'A';
    const color = this.stringToColor(testimonial.id);
    const hasMedia = testimonial.hasMultimedia;
    
    // Obtener estilos según si tiene multimedia
    const styles = hasMedia ? this.embedStyles.withMedia : this.embedStyles.default;
    
    // Generar multimedia
    const multimediaHtml = testimonial.multimedia ? this.generateMultimediaHtml(testimonial.multimedia) : '';
    
    // Construir estilo inline
    const inlineStyles = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    
    return `
<div class="testimonial-embed" 
     data-testimonial-id="${testimonial.id}" 
     data-testimonial-title="${testimonial.title}"
     data-media-type="${testimonial.mediaType}"
     data-author="${testimonial.author}"
     data-category="${testimonial.category}"
     style="${inlineStyles}; transition: transform 0.2s ease, box-shadow 0.2s ease;"
     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px -2px rgba(0,0,0,0.15)';"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1)';">
    
    ${multimediaHtml}
    
    <div style="${hasMedia ? 'padding: 20px;' : ''}">
        <!-- Header -->
        <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <div style="
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: ${color};
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 22px;
                margin-right: 16px;
                flex-shrink: 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${initials}
            </div>
            <div style="flex: 1; min-width: 0;">
                <h3 style="
                    margin: 0 0 6px 0;
                    font-size: 17px;
                    color: #1e293b;
                    font-weight: 600;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;">
                    ${testimonial.author}
                </h3>
                ${(testimonial.position || testimonial.company) ? `
                <div style="font-size: 14px; color: #64748b; line-height: 1.4;">
                    ${testimonial.position ? `
                    <div style="margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 12px;">👨‍💼</span>
                        <span>${testimonial.position}</span>
                    </div>` : ''}
                    ${testimonial.company ? `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 12px;">🏢</span>
                        <span>${testimonial.company}</span>
                    </div>` : ''}
                </div>` : ''}
            </div>
        </div>
        
        <!-- Title & Content -->
        <div style="margin-bottom: 18px;">
            ${testimonial.title ? `
            <h4 style="
                margin: 0 0 10px 0;
                font-size: 15px;
                color: #4f46e5;
                font-weight: 600;
                line-height: 1.4;">
                ${testimonial.title}
            </h4>` : ''}
            <div style="position: relative;">
                <div style="
                    position: absolute;
                    top: 0;
                    left: -8px;
                    width: 3px;
                    height: 100%;
                    background: ${color};
                    border-radius: 3px;"></div>
                <p style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #475569;
                    font-style: italic;
                    padding-left: 12px;">
                    "${this.truncateText(testimonial.content, 300)}"
                </p>
            </div>
        </div>
        
        <!-- Tags -->
        ${(testimonial.category || (testimonial.tags && testimonial.tags.length > 0)) ? `
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
            ${testimonial.category ? `
            <span style="
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                color: white;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
                <span style="font-size: 10px;">🏷️</span>
                ${testimonial.category}
            </span>` : ''}
            ${testimonial.tags ? testimonial.tags.slice(0, 3).map(tag => `
            <span style="
                background: #f1f5f9;
                color: #64748b;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;"
                onmouseover="this.style.background='#e2e8f0'; this.style.color='#475569';"
                onmouseout="this.style.background='#f1f5f9'; this.style.color='#64748b';">
                <span style="font-size: 10px;">#</span>
                ${tag}
            </span>
            `).join('') : ''}
        </div>` : ''}
        
        <!-- Stats & Footer -->
        <div style="
            border-top: 1px solid #f1f5f9;
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;">
            <div style="display: flex; align-items: center; gap: 16px; font-size: 12px; color: #64748b;">
                <span style="display: flex; align-items: center; gap: 5px;"
                      title="Vistas totales">
                    <span style="font-size: 14px;">👁️</span>
                    <span style="font-weight: 500;">${testimonial.engagement.views}</span>
                </span>
                <span style="display: flex; align-items: center; gap: 5px;"
                      title="Veces incrustado">
                    <span style="font-size: 14px;">🔗</span>
                    <span style="font-weight: 500;">${testimonial.engagement.embeds}</span>
                </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">
                <span title="${new Date(testimonial.createdAt).toLocaleString('es-ES')}">
                    📅 ${new Date(testimonial.createdAt).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })}
                </span>
            </div>
        </div>
        
        <!-- Powered by -->
        <div style="
            text-align: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f1f5f9;">
            <a href="${this.baseUrl}" 
               target="_blank" 
               rel="noopener noreferrer"
               style="
                    color: #94a3b8;
                    text-decoration: none;
                    font-size: 10px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    background: #f8fafc;
                    transition: all 0.2s ease;"
               onmouseover="this.style.color='#4f46e5'; this.style.background='#e0e7ff';"
               onmouseout="this.style.color='#94a3b8'; this.style.background='#f8fafc';">
               <span style="font-size: 12px;">💬</span>
               <span>Generado con Testimonial CMS</span>
               <span style="font-size: 12px;">🚀</span>
            </a>
        </div>
    </div>
</div>`;
  }

  private generateMultimediaHtml(multimedia: PublicMultimediaDto): string {
    switch (multimedia.type) {
      case MultimediaType.VIDEO:
        return this.generateVideoHtml(multimedia);
      case MultimediaType.IMAGE:
        return this.generateImageHtml(multimedia);
      default:
        return '';
    }
  }

 private generateVideoHtml(multimedia: PublicMultimediaDto): string {
  const youtubeId = this.extractYouTubeId(multimedia.url);
  const vimeoId = this.extractVimeoId(multimedia.url);
  
  if (youtubeId) {
    // USAR ESTE ID DE YOUTUBE REAL PARA PRUEBAS
    const TEST_YOUTUBE_ID = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (video real)
    
    // Si el ID extraído no es válido, usar el de prueba
    const finalYoutubeId = youtubeId && youtubeId.length === 11 ? youtubeId : TEST_YOUTUBE_ID;
    
    // URL simplificada
    const embedUrl = `https://www.youtube.com/embed/${finalYoutubeId}`;
    
    this.logger.debug(`🎬 Generando iframe de YouTube: ${finalYoutubeId}`);
    
    return `
<div class="testimonial-video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000; border-radius: 12px 12px 0 0;">
  <iframe 
    src="${embedUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    title="${multimedia.description || 'Video testimonio'}"
    loading="lazy">
  </iframe>
</div>
<div style="padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px;">
  <span style="font-size: 14px;">🎬</span>
  <span>Video testimonio (YouTube)</span>
  <a href="https://www.youtube.com/watch?v=${finalYoutubeId}" 
     target="_blank" 
     rel="noopener noreferrer"
     style="margin-left: auto; color: #4f46e5; text-decoration: none; font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #e0e7ff;"
     onmouseover="this.style.textDecoration='underline'; this.style.background='#c7d2fe';"
     onmouseout="this.style.textDecoration='none'; this.style.background='#e0e7ff';"
     title="Abrir en YouTube">
    Ver en YouTube
  </a>
</div>
<!-- Solo mostrar si es el video de prueba -->
${finalYoutubeId === TEST_YOUTUBE_ID ? `
<div style="padding: 8px 20px; background: #fef3c7; border-bottom: 1px solid #fbbf24; font-size: 11px; color: #92400e; text-align: center;">
  <i class="fas fa-info-circle" style="margin-right: 4px;"></i>
  Usando video de prueba de YouTube. Reemplaza con tu propio video.
</div>` : ''}`;
  }
  
  if (vimeoId) {
    return `
<div class="testimonial-video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000; border-radius: 12px 12px 0 0;">
  <iframe 
    src="https://player.vimeo.com/video/${vimeoId}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    frameborder="0"
    allowfullscreen
    title="${multimedia.description || 'Video testimonio'}"
    loading="lazy">
  </iframe>
</div>
<div style="padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px;">
  <span style="font-size: 14px;">🎬</span>
  <span>Video testimonio (Vimeo)</span>
  <a href="https://vimeo.com/${vimeoId}" 
     target="_blank" 
     rel="noopener noreferrer"
     style="margin-left: auto; color: #19b5fe; text-decoration: none; font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #e1f5fe;"
     onmouseover="this.style.textDecoration='underline'; this.style.background='#b3e5fc';"
     onmouseout="this.style.textDecoration='none'; this.style.background='#e1f5fe';"
     title="Abrir en Vimeo">
    Ver en Vimeo
  </a>
</div>`;
  }
  
  // Video local
  const placeholder = 'https://via.placeholder.com/800x450/4f46e5/ffffff?text=Video+Testimonio';
  
  return `
<div class="testimonial-video-local" style="background: #000; border-radius: 12px 12px 0 0; overflow: hidden;">
  <video 
    controls
    preload="metadata"
    style="width: 100%; height: auto; max-height: 400px; display: block; background: #000;"
    playsinline
    webkit-playsinline>
    <source src="${multimedia.url}" type="video/mp4">
    <source src="${multimedia.url}" type="video/webm">
    <source src="${multimedia.url}" type="video/ogg">
    Tu navegador no soporta videos HTML5.
  </video>
  ${multimedia.description ? `
  <div style="padding: 12px 20px; background: rgba(0,0,0,0.85); color: white; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 14px;">📝</span>
      <span>${multimedia.description}</span>
    </div>
  </div>` : ''}
</div>`;
}
  private generateImageHtml(multimedia: PublicMultimediaDto): string {
    const placeholder = 'https://via.placeholder.com/800x400/4f46e5/ffffff?text=Testimonio+Imagen';
    
    return `
<div class="testimonial-image-container" style="position: relative; border-radius: 12px 12px 0 0; overflow: hidden;">
  <div style="position: relative; width: 100%; height: 250px; overflow: hidden;">
    <img 
      src="${multimedia.url}" 
      alt="${multimedia.description || 'Imagen testimonio'}"
      style="width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease;"
      onerror="this.src='${placeholder}'; this.style.objectFit='contain'; this.style.padding='20px'; this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)';"
      onmouseover="this.style.transform='scale(1.05)';"
      onmouseout="this.style.transform='scale(1)';"
      loading="lazy"
      decoding="async">
    <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.7));
        padding: 40px 20px 20px;
        display: flex;
        align-items: center;
        justify-content: center;">
    </div>
  </div>
  ${multimedia.description ? `
  <div style="padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
    <div style="display: flex; align-items: flex-start; gap: 8px;">
      <span style="font-size: 14px; flex-shrink: 0;">📝</span>
      <span>${multimedia.description}</span>
    </div>
  </div>` : ''}
</div>`;
  }

  private generateAudioHtml(multimedia: PublicMultimediaDto): string {
    return `
<div class="testimonial-audio-container" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0;">
  <div style="display: flex; align-items: center; gap: 16px;">
    <div style="
        width: 70px;
        height: 70px;
        background: rgba(255,255,255,0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 28px;
        flex-shrink: 0;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);">
      🔊
    </div>
    <div style="flex: 1; min-width: 0;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <span style="color: white; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 4px;">
          <span>🎙️</span>
          <span>Audio testimonio</span>
        </span>
      </div>
      <audio 
        controls
        style="width: 100%; height: 40px;"
        preload="metadata"
        onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\"color: white; font-size: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px;\\">Audio no disponible</div>';">
        <source src="${multimedia.url}" type="audio/mpeg">
        <source src="${multimedia.url}" type="audio/ogg">
        <source src="${multimedia.url}" type="audio/wav">
        Tu navegador no soporta audio HTML5.
      </audio>
      ${multimedia.description ? `
      <p style="color: white; font-size: 12px; margin: 10px 0 0; opacity: 0.9; line-height: 1.4;">
        ${multimedia.description}
      </p>` : ''}
    </div>
  </div>
</div>`;
  }

  private generateScriptEmbed(testimonialId: string): string {
    return `<script src="${this.baseUrl}/api/v1/public/embed/${testimonialId}.js" async defer></script>`;
  }

  // Método para logging de errores
  private logEmbedError(testimonialId: string, error: any) {
    this.logger.error(`❌ Error en embed para testimonio ${testimonialId}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}