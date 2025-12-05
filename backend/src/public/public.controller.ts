// src/public/public.controller.ts
import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  Res, 
  Header,
  HttpStatus 
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam,
  ApiProduces 
} from '@nestjs/swagger';
import { PublicService } from './public.service';
import { 
  PublicTestimonialDto, 
  EmbedCodeResponseDto,
  PublicTestimonialsResponseDto 
} from './dto/public-testimonial.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('API Pública')
@Controller('public')
@Public()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('testimonials')
  @ApiOperation({ 
    summary: 'Obtener testimonios públicos', 
    description: 'Retorna una lista paginada de testimonios aprobados para integración externa, INCLUYENDO MULTIMEDIA' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Número de página (por defecto: 1)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Límite por página (por defecto: 10, máximo: 50)' 
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    type: String, 
    description: 'Filtrar por ID de categoría' 
  })
  @ApiQuery({ 
    name: 'tags', 
    required: false, 
    type: String, 
    description: 'Tags separados por comas' 
  })
  @ApiQuery({ 
    name: 'withMultimedia', 
    required: false, 
    type: Boolean, 
    description: 'Filtrar solo testimonios con multimedia' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de testimonios públicos CON MULTIMEDIA',
    type: PublicTestimonialsResponseDto
  })
 async getPublicTestimonials(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('withMultimedia') withMultimedia?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined;

    const testimonials = await this.publicService.getPublicTestimonials(
      pageNum,
      limitNum,
      category,
      tagsArray
    );

    // Filtrar por multimedia si se solicita
    if (withMultimedia === 'true') {
      testimonials.testimonials = testimonials.testimonials.filter(
        testimonial => testimonial.multimedia
      );
      testimonials.total = testimonials.testimonials.length;
    }

    return testimonials;
  }

  @Get('testimonials/:id')
  @ApiOperation({ 
    summary: 'Obtener testimonio público por ID', 
    description: 'Retorna un testimonio específico si está aprobado. Registra automáticamente una vista.' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String,
    example: '238b7b76-d72c-4d23-b682-39acfa8175a3'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Testimonio encontrado',
    type: PublicTestimonialDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Testimonio no encontrado o no aprobado' 
  })
  async getPublicTestimonial(@Param('id') id: string) {
    return this.publicService.getPublicTestimonialById(id);
  }

  @Get('embeds/:id')
  @ApiOperation({ 
    summary: 'Obtener código para incrustar testimonio', 
    description: 'Genera código HTML y JavaScript para incrustar un testimonio en otras webs. Registra automáticamente un embed.' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String,
    example: '238b7b76-d72c-4d23-b682-39acfa8175a3'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Códigos de embed generados',
    type: EmbedCodeResponseDto
  })
  async getEmbedCode(@Param('id') id: string) {
    return this.publicService.getEmbedCode(id);
  }

  @Get('embed/:id.js')
  @Header('Content-Type', 'application/javascript')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ 
    summary: 'JavaScript para incrustación automática', 
    description: 'Retorna JavaScript dinámico que incrusta automáticamente el testimonio en la página.' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String,
    example: '238b7b76-d72c-4d23-b682-39acfa8175a3'
  })
  @ApiProduces('application/javascript')
  @ApiResponse({ 
    status: 200, 
    description: 'JavaScript para incrustar testimonio',
    content: {
      'application/javascript': {
        schema: {
          type: 'string',
          example: '(function() { /* código javascript */ })();'
        }
      }
    }
  })
  async getEmbedScript(
    @Param('id') id: string,
    @Res() res: any  // Cambiar Response por any para evitar el error de TypeScript
  ) {
    try {
      const script = await this.publicService.generateEmbedScript(id);
      res.setHeader('X-Testimonial-Id', id);
      res.send(script);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send(
        'console.error("Error: Testimonio no encontrado o no disponible");'
      );
    }
  }

  @Get('embeds/:id/preview')
  @Header('Content-Type', 'text/html')
  @ApiOperation({ 
    summary: 'Vista previa del embed', 
    description: 'Retorna HTML completo para previsualizar el testimonio embebido' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String,
    example: '238b7b76-d72c-4d23-b682-39acfa8175a3'
  })
  @ApiProduces('text/html')
  @ApiResponse({ 
    status: 200, 
    description: 'HTML de previsualización',
    content: {
      'text/html': {
        schema: {
          type: 'string',
          example: '<div>Testimonio preview</div>'
        }
      }
    }
  })
  async getEmbedPreview(
    @Param('id') id: string,
    @Res() res: any  // Cambiar Response por any
  ) {
    try {
      const testimonial = await this.publicService.getPublicTestimonialById(id);
      
      // Acceder al método privado de manera segura
      const generateHtmlEmbed = (testimonial: PublicTestimonialDto): string => {
        const initials = testimonial.author?.charAt(0)?.toUpperCase() || 'A';
        const color = '#4f46e5'; // Color por defecto
        
        return `
<div class="testimonial-embed" data-testimonial-id="${testimonial.id}" style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 400px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin: 10px auto;">
    
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
            "${testimonial.content.substring(0, 200)}${testimonial.content.length > 200 ? '...' : ''}"
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
        ${testimonial.tags.slice(0, 2).map(tag => `
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
        justify-content: space-between;">
        <span>👁️ ${testimonial.engagement.views} vistas</span>
        <span>🔗 ${testimonial.engagement.embeds} embeds</span>
        <span>📅 ${new Date(testimonial.createdAt).toLocaleDateString('es-ES')}</span>
    </div>
    
    <!-- Powered by -->
    <div style="
        text-align: center;
        margin-top: 12px;
        font-size: 10px;
        color: #cbd5e1;">
        Powered by Testimonial CMS
    </div>
</div>`;
      };
      
      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vista previa: ${testimonial.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .preview-container {
            max-width: 600px;
            width: 100%;
            text-align: center;
        }
        .preview-title {
            color: #1e293b;
            margin-bottom: 30px;
        }
        .instructions {
            background: #e0e7ff;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <h1 class="preview-title">Vista previa del embed</h1>
        <p>Así se verá tu testimonio cuando lo incrustes en otro sitio:</p>
        
        ${generateHtmlEmbed(testimonial)}
        
        <div class="instructions">
            <h3>Instrucciones de uso:</h3>
            <p>1. Puedes usar el código HTML directamente</p>
            <p>2. O usar el script JavaScript para incrustación dinámica</p>
            <p>3. Las métricas se actualizan automáticamente</p>
        </div>
    </div>
</body>
</html>`;
      
      res.send(html);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #ef4444;">Testimonio no encontrado</h1>
            <p>El testimonio solicitado no existe o no está aprobado.</p>
          </body>
        </html>
      `);
    }
  }
}