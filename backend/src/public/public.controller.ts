// src/public/public.controller.ts (VERSIÓN COMPLETA MEJORADA)
import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  Res, 
  Header,
  HttpStatus,
  Post,
  Body,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam,
  ApiProduces,
  ApiBody,
  ApiConsumes
} from '@nestjs/swagger';
import { PublicService } from './public.service';
import { 
  PublicTestimonialDto, 
  EmbedCodeResponseDto,
  PublicTestimonialsResponseDto
} from './dto/public-testimonial.dto';
import { Public } from '../auth/decorators/public.decorator';
import { SearchTestimonialsDto } from './dto/public-testimonial.dto';

@ApiTags('API Pública - Testimonios')
@Controller('public')
@Public()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  private readonly baseUrl = process.env.RENDER_BACKEND_URL || 'http://localhost:3000';

  // ========== ENDPOINTS PRINCIPALES DE TESTIMONIOS ==========

  @Get('testimonials')
  @ApiOperation({ 
    summary: 'Obtener testimonios públicos', 
    description: 'Retorna una lista paginada de testimonios aprobados para integración externa, incluyendo multimedia. Permite filtrar por categoría, tags y tipo de contenido.' 
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
    description: 'Filtrar por nombre de categoría' 
  })
  @ApiQuery({ 
    name: 'tags', 
    required: false, 
    type: String, 
    description: 'Tags separados por comas (ej: tecnologia,servicio)' 
  })
  @ApiQuery({ 
    name: 'hasMultimedia', 
    required: false, 
    type: Boolean, 
    description: 'Filtrar solo testimonios con multimedia (true/false)' 
  })
  @ApiQuery({ 
    name: 'mediaType', 
    required: false, 
    type: String, 
    description: 'Tipo de multimedia (video, image, audio)' 
  })
  @ApiQuery({ 
    name: 'sort', 
    required: false, 
    type: String, 
    description: 'Ordenar por: newest, oldest, popular, views' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de testimonios públicos',
    type: PublicTestimonialsResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos' 
  })
  async getPublicTestimonials(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('hasMultimedia') hasMultimedia?: string,
    @Query('mediaType') mediaType?: string,
    @Query('sort') sort: string = 'newest',
  ): Promise<PublicTestimonialsResponseDto> {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined;
    
    // Validar mediaType
    if (mediaType && !['video', 'image', 'audio', 'none'].includes(mediaType)) {
      throw new BadRequestException('mediaType debe ser: video, image, audio o none');
    }
    
    // Validar sort
    const validSorts = ['newest', 'oldest', 'popular', 'views'];
    if (sort && !validSorts.includes(sort)) {
      throw new BadRequestException(`sort debe ser uno de: ${validSorts.join(', ')}`);
    }

    const testimonials = await this.publicService.getPublicTestimonials(
      pageNum,
      limitNum,
      category,
      tagsArray
    );

    // Aplicar filtros adicionales
    if (hasMultimedia === 'true') {
      testimonials.testimonials = testimonials.testimonials.filter(
        testimonial => testimonial.hasMultimedia
      );
      testimonials.total = testimonials.testimonials.length;
    } else if (hasMultimedia === 'false') {
      testimonials.testimonials = testimonials.testimonials.filter(
        testimonial => !testimonial.hasMultimedia
      );
      testimonials.total = testimonials.testimonials.length;
    }

    // Filtrar por tipo de media
    if (mediaType) {
      testimonials.testimonials = testimonials.testimonials.filter(
        testimonial => testimonial.mediaType === mediaType
      );
      testimonials.total = testimonials.testimonials.length;
    }

    // Aplicar ordenamiento
    if (sort === 'oldest') {
      testimonials.testimonials.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sort === 'popular') {
      testimonials.testimonials.sort((a, b) => 
        (b.engagement.views + b.engagement.embeds) - (a.engagement.views + a.engagement.embeds)
      );
    } else if (sort === 'views') {
      testimonials.testimonials.sort((a, b) => 
        b.engagement.views - a.engagement.views
      );
    }
    // 'newest' es el orden por defecto (ya viene ordenado del servicio)

    return testimonials;
  }

  @Get('testimonials/search')
  @ApiOperation({ 
    summary: 'Buscar testimonios', 
    description: 'Búsqueda avanzada en testimonios por texto, autor, empresa, etc.' 
  })
  @ApiQuery({ 
    name: 'q', 
    required: true, 
    type: String, 
    description: 'Término de búsqueda' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Número de página' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Límite por página' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda',
    type: PublicTestimonialsResponseDto
  })
  async searchTestimonials(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<PublicTestimonialsResponseDto> {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    // Esta es una implementación básica. Deberías crear un servicio específico para búsqueda
    const testimonials = await this.publicService.getPublicTestimonials(
      pageNum,
      limitNum
    );

    // Filtrar por término de búsqueda
    const searchTerm = query.toLowerCase().trim();
    const filtered = testimonials.testimonials.filter(testimonial => {
      const searchableText = `
        ${testimonial.title?.toLowerCase() || ''}
        ${testimonial.content?.toLowerCase() || ''}
        ${testimonial.author?.toLowerCase() || ''}
        ${testimonial.company?.toLowerCase() || ''}
        ${testimonial.position?.toLowerCase() || ''}
        ${testimonial.category?.toLowerCase() || ''}
        ${testimonial.tags?.join(' ').toLowerCase() || ''}
      `;
      
      return searchableText.includes(searchTerm);
    });

    return {
      testimonials: filtered,
      total: filtered.length,
      page: pageNum,
      limit: limitNum
    };
  }

  @Post('testimonials/search')
  @ApiOperation({ 
    summary: 'Búsqueda avanzada de testimonios', 
    description: 'Búsqueda con múltiples criterios usando POST para evitar límites de URL' 
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: SearchTestimonialsDto,
    description: 'Criterios de búsqueda'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda avanzada',
    type: PublicTestimonialsResponseDto
  })
  async searchTestimonialsAdvanced(
    @Body() searchDto: SearchTestimonialsDto
  ): Promise<PublicTestimonialsResponseDto> {
    // Implementación básica - expandir según necesidades
    const pageNum = Math.max(1, searchDto.page || 1);
    const limitNum = Math.min(50, Math.max(1, searchDto.limit || 10));

    const testimonials = await this.publicService.getPublicTestimonials(
      pageNum,
      limitNum,
      searchDto.category,
      searchDto.tags
    );

    // Aplicar filtros adicionales
    let filtered = testimonials.testimonials;

    if (searchDto.hasMultimedia !== undefined) {
      filtered = filtered.filter(
        testimonial => testimonial.hasMultimedia === searchDto.hasMultimedia
      );
    }

    if (searchDto.mediaType) {
      filtered = filtered.filter(
        testimonial => testimonial.mediaType === searchDto.mediaType
      );
    }

    if (searchDto.minViews !== undefined) {
      filtered = filtered.filter(
        testimonial => testimonial.engagement.views >= searchDto.minViews!
      );
    }

    if (searchDto.query) {
      const searchTerm = searchDto.query.toLowerCase().trim();
      filtered = filtered.filter(testimonial => {
        const searchableText = `
          ${testimonial.title?.toLowerCase() || ''}
          ${testimonial.content?.toLowerCase() || ''}
          ${testimonial.author?.toLowerCase() || ''}
          ${testimonial.company?.toLowerCase() || ''}
        `;
        return searchableText.includes(searchTerm);
      });
    }

    return {
      testimonials: filtered,
      total: filtered.length,
      page: pageNum,
      limit: limitNum
    };
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
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido' 
  })
  async getPublicTestimonial(@Param('id') id: string): Promise<PublicTestimonialDto> {
    return this.publicService.getPublicTestimonialById(id);
  }

  @Get('testimonials/:id/multimedia')
  @ApiOperation({ 
    summary: 'Obtener multimedia del testimonio', 
    description: 'Retorna solo la información multimedia de un testimonio específico' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Multimedia encontrada',
    schema: {
      type: 'object',
      properties: {
        multimedia: { $ref: '#/components/schemas/PublicMultimediaDto' },
        videoUrl: { type: 'string' },
        hasMultimedia: { type: 'boolean' },
        mediaType: { type: 'string' }
      }
    }
  })
  async getTestimonialMultimedia(@Param('id') id: string) {
    return this.publicService.getTestimonialMultimedia(id);
  }

  @Get('testimonials/:id/related')
  @ApiOperation({ 
    summary: 'Obtener testimonios relacionados', 
    description: 'Retorna testimonios relacionados por categoría o tags' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Límite de resultados (por defecto: 5)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Testimonios relacionados',
    type: PublicTestimonialsResponseDto
  })
  async getRelatedTestimonials(
    @Param('id') id: string,
    @Query('limit') limit: string = '5'
  ): Promise<PublicTestimonialsResponseDto> {
    const limitNum = Math.min(20, Math.max(1, parseInt(limit) || 5));
    
    // Obtener el testimonio principal
    const mainTestimonial = await this.publicService.getPublicTestimonialById(id);
    
    // Obtener todos los testimonios (excluyendo el actual)
    const allTestimonials = await this.publicService.getPublicTestimonials(1, 100);
    
    // Filtrar relacionados por categoría y tags
    const related = allTestimonials.testimonials
      .filter(t => t.id !== id)
      .filter(t => {
        // Misma categoría
        if (t.category === mainTestimonial.category) return true;
        
        // Tags en común
        const commonTags = t.tags.filter(tag => 
          mainTestimonial.tags.includes(tag)
        );
        return commonTags.length > 0;
      })
      .slice(0, limitNum);

    return {
      testimonials: related,
      total: related.length,
      page: 1,
      limit: limitNum
    };
  }

  // ========== ENDPOINTS DE EMBED ==========

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
  async getEmbedCode(@Param('id') id: string): Promise<EmbedCodeResponseDto> {
    return this.publicService.getEmbedCode(id);
  }

  @Get('embeds/:id/code')
  @ApiOperation({ 
    summary: 'Obtener solo código HTML del embed', 
    description: 'Retorna solo el código HTML para incrustar, sin JSON' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String
  })
  @Header('Content-Type', 'text/html')
  @ApiProduces('text/html')
  @ApiResponse({ 
    status: 200, 
    description: 'HTML del embed',
    content: {
      'text/html': {
        schema: {
          type: 'string',
          example: '<div class="testimonial-embed">...</div>'
        }
      }
    }
  })
  async getEmbedHtml(
    @Param('id') id: string,
    @Res() res: any
  ) {
    try {
      const testimonial = await this.publicService.getPublicTestimonialById(id);
      const embedCode = await this.publicService.getEmbedCode(id);
      
      res.setHeader('X-Testimonial-ID', id);
      res.setHeader('X-Has-Multimedia', testimonial.hasMultimedia.toString());
      res.setHeader('X-Media-Type', testimonial.mediaType);
      res.send(embedCode.html);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        res.status(error.getStatus()).send(`<!-- Error: ${error.message} -->`);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('<!-- Error generando embed -->');
      }
    }
  }

  @Get('embed/:id.js')
  @Header('Content-Type', 'application/javascript')
  @Header('Cache-Control', 'public, max-age=3600')
  @Header('Access-Control-Allow-Origin', '*')
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
    @Res() res: any
  ) {
    try {
      const script = await this.publicService.generateEmbedScript(id);
      res.setHeader('X-Testimonial-Id', id);
      res.send(script);
    } catch (error) {
      let errorMessage = 'Testimonio no encontrado o no disponible';
      let statusCode = HttpStatus.NOT_FOUND;
      
      if (error instanceof BadRequestException) {
        errorMessage = error.message;
        statusCode = error.getStatus();
      } else if (error instanceof NotFoundException) {
        errorMessage = error.message;
        statusCode = error.getStatus();
      }
      
      const errorScript = `console.error("Error: ${errorMessage}");`;
      res.status(statusCode).send(errorScript);
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
    @Res() res: any
  ) {
    try {
      const testimonial = await this.publicService.getPublicTestimonialById(id);
      const embedCode = await this.publicService.getEmbedCode(id);
      
      // Usar método del servicio para generar HTML del embed
      const embedHtml = await this.generateTestimonialHtml(testimonial);
      
      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vista previa: ${testimonial.title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .preview-wrapper {
            width: 100%;
            max-width: 800px;
            padding: 20px;
        }
        .preview-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .preview-header h1 {
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .preview-header p {
            color: #64748b;
            font-size: 16px;
        }
        .instructions {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-top: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .instructions h3 {
            color: #4f46e5;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .code-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
        }
        .code-box {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
        }
        @media (max-width: 768px) {
            .code-options { grid-template-columns: 1fr; }
        }
        
        .testimonial-preview-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            margin-bottom: 30px;
        }
        
        .stats-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="preview-wrapper">
        <div class="preview-header">
            <h1><i class="fas fa-eye"></i> Vista previa del embed</h1>
            <p>Así se verá tu testimonio cuando lo incrustes en otro sitio web</p>
            ${testimonial.hasMultimedia ? 
              `<div class="badge"><i class="fas fa-photo-video"></i> Contiene multimedia</div>` : 
              ''}
            <div class="stats-badge">
                <i class="fas fa-eye"></i> ${testimonial.engagement.views} vistas
            </div>
        </div>
        
        <!-- Vista previa del testimonio -->
        <div class="testimonial-preview-container">
            ${embedHtml}
        </div>
        
        <div class="instructions">
            <h3><i class="fas fa-code"></i> Cómo usar este testimonio</h3>
            <p><strong>Opción 1:</strong> Usa el código HTML directamente</p>
            <p><strong>Opción 2:</strong> Usa el script para incrustación dinámica</p>
            <p><strong>Opción 3:</strong> Usa la API para obtener los datos en JSON</p>
            
            <div class="code-options">
                <div>
                    <h4><i class="fas fa-file-code"></i> Código HTML</h4>
                    <div class="code-box">${this.escapeHtml(embedCode.html)}</div>
                </div>
                <div>
                    <h4><i class="fas fa-code"></i> Script JS</h4>
                    <div class="code-box">${this.escapeHtml(embedCode.script)}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4><i class="fas fa-link"></i> Enlaces útiles</h4>
                <p><strong>API Endpoint:</strong> <a href="${embedCode.apiUrl}" target="_blank">${embedCode.apiUrl}</a></p>
                <p><strong>Testimonio ID:</strong> <code>${testimonial.id}</code></p>
            </div>
        </div>
    </div>
</body>
</html>`;
      
      res.send(html);
    } catch (error) {
      const errorHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Vista previa no disponible</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            text-align: center;
            background: #f8fafc;
        }
        .error-container {
            max-width: 500px;
            margin: 0 auto;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #ef4444;
            margin-bottom: 20px;
        }
        p {
            color: #64748b;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1><i class="fas fa-exclamation-triangle"></i> Testimonio no encontrado</h1>
        <p>El testimonio solicitado no existe o no está aprobado para vista pública.</p>
        <p>ID: ${id}</p>
        <p>Error: ${error.message}</p>
    </div>
</body>
</html>`;
      
      res.status(
        error instanceof NotFoundException || error instanceof BadRequestException 
          ? error.getStatus() 
          : HttpStatus.INTERNAL_SERVER_ERROR
      ).send(errorHtml);
    }
  }

  @Get('embeds/:id/oembed')
  @ApiOperation({ 
    summary: 'oEmbed para el testimonio', 
    description: 'Endpoint oEmbed compatible para incrustación en plataformas que soportan oEmbed' 
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID)',
    type: String
  })
  @ApiQuery({ 
    name: 'format', 
    required: false, 
    type: String, 
    description: 'Formato de respuesta (json o xml)' 
  })
  @ApiQuery({ 
    name: 'maxwidth', 
    required: false, 
    type: Number, 
    description: 'Ancho máximo del embed' 
  })
  @ApiQuery({ 
    name: 'maxheight', 
    required: false, 
    type: Number, 
    description: 'Alto máximo del embed' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta oEmbed',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string' },
        type: { type: 'string' },
        html: { type: 'string' },
        width: { type: 'number' },
        height: { type: 'number' },
        title: { type: 'string' },
        author_name: { type: 'string' },
        author_url: { type: 'string' },
        provider_name: { type: 'string' },
        provider_url: { type: 'string' }
      }
    }
  })
  async getOEmbed(
    @Param('id') id: string,
    @Query('format') format: string = 'json',
    @Query('maxwidth') maxwidth: string,
    @Query('maxheight') maxheight: string,
    @Res() res: any
  ) {
    try {
      const testimonial = await this.publicService.getPublicTestimonialById(id);
      const embedCode = await this.publicService.getEmbedCode(id);
      
      const maxWidth = maxwidth ? parseInt(maxwidth) : 500;
      const maxHeight = maxheight ? parseInt(maxheight) : 600;
      
      const oembedResponse = {
        version: '1.0',
        type: 'rich',
        html: embedCode.html,
        width: maxWidth,
        height: maxHeight,
        title: testimonial.title,
        author_name: testimonial.author,
        author_url: testimonial.company ? `https://${testimonial.company}.com` : undefined,
        provider_name: 'Testimonial CMS',
        provider_url: this.baseUrl,
        cache_age: 3600,
        thumbnail_url: testimonial.multimedia?.url || undefined,
        thumbnail_width: testimonial.multimedia?.width || undefined,
        thumbnail_height: testimonial.multimedia?.height || undefined
      };
      
      if (format === 'xml') {
        res.setHeader('Content-Type', 'application/xml');
        const xml = this.jsonToXml(oembedResponse);
        res.send(xml);
      } else {
        res.json(oembedResponse);
      }
      
    } catch (error) {
      const errorResponse = {
        error: 'Testimonio no encontrado',
        code: 404
      };
      
      if (format === 'xml') {
        res.setHeader('Content-Type', 'application/xml');
        res.status(404).send(this.jsonToXml(errorResponse));
      } else {
        res.status(404).json(errorResponse);
      }
    }
  }

  // ========== ENDPOINTS DE ESTADÍSTICAS ==========

  @Get('stats')
  @ApiOperation({ 
    summary: 'Estadísticas públicas', 
    description: 'Obtiene estadísticas generales de los testimonios públicos' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas',
    schema: {
      type: 'object',
      properties: {
        totalTestimonials: { type: 'number' },
        totalViews: { type: 'number' },
        totalEmbeds: { type: 'number' },
        testimonialsWithMultimedia: { type: 'number' },
        testimonialsByType: {
          type: 'object',
          properties: {
            video: { type: 'number' },
            image: { type: 'number' },
            audio: { type: 'number' },
            text: { type: 'number' }
          }
        },
        topCategories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              count: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async getPublicStats() {
    try {
      const testimonials = await this.publicService.getPublicTestimonials(1, 1000);
      
      // Calcular estadísticas básicas
      const totalTestimonials = testimonials.total;
      const testimonialsWithMultimedia = testimonials.testimonials.filter(t => t.hasMultimedia).length;
      
      let totalViews = 0;
      let totalEmbeds = 0;
      const typeCounts = { video: 0, image: 0, audio: 0, text: 0 };
      const categoryCounts = {};
      
      testimonials.testimonials.forEach(testimonial => {
        totalViews += testimonial.engagement.views;
        totalEmbeds += testimonial.engagement.embeds;
        
        // Contar por tipo
        typeCounts[testimonial.mediaType] = (typeCounts[testimonial.mediaType] || 0) + 1;
        
        // Contar por categoría
        const category = testimonial.category || 'Sin categoría';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Ordenar categorías
      const topCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalTestimonials,
        totalViews,
        totalEmbeds,
        testimonialsWithMultimedia,
        testimonialsByType: typeCounts,
        topCategories,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        totalTestimonials: 0,
        totalViews: 0,
        totalEmbeds: 0,
        testimonialsWithMultimedia: 0,
        testimonialsByType: { video: 0, image: 0, audio: 0, text: 0 },
        topCategories: [],
        error: 'Error calculando estadísticas'
      };
    }
  }

  @Get('stats/categories')
@ApiOperation({ 
  summary: 'Estadísticas por categoría', 
  description: 'Obtiene estadísticas agrupadas por categoría' 
})
async getCategoryStats() {
  const testimonials = await this.publicService.getPublicTestimonials(1, 1000);
  
  const statsByCategory: Record<string, {
    count: number;
    views: number;
    embeds: number;
    hasMultimedia: number;
  }> = {};
  
  testimonials.testimonials.forEach(testimonial => {
    const category = testimonial.category || 'Sin categoría';
    
    if (!statsByCategory[category]) {
      statsByCategory[category] = {
        count: 0,
        views: 0,
        embeds: 0,
        hasMultimedia: 0
      };
    }
    
    statsByCategory[category].count++;
    statsByCategory[category].views += testimonial.engagement.views;
    statsByCategory[category].embeds += testimonial.engagement.embeds;
    
    if (testimonial.hasMultimedia) {
      statsByCategory[category].hasMultimedia++;
    }
  });
  
  return Object.entries(statsByCategory).map(([category, data]) => ({
    category,
    ...data
  }));
}

  // ========== MÉTODOS AUXILIARES PRIVADOS ==========

  private async generateTestimonialHtml(testimonial: PublicTestimonialDto): Promise<string> {
    // Este método llama al método privado del servicio a través de un método público
    // Si necesitas acceder a generateHtmlEmbed, deberías exponerlo en el servicio
    // Por ahora, usamos el embed code que ya incluye el HTML
    const embedCode = await this.publicService.getEmbedCode(testimonial.id);
    return embedCode.html;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private jsonToXml(json: any): string {
    const xmlItems = Object.entries(json)
      .map(([key, value]) => {
        if (value === undefined || value === null) return '';
        return `<${key}>${value}</${key}>`;
      })
      .filter(item => item !== '');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<oembed>
  ${xmlItems.join('\n  ')}
</oembed>`;
  }
}