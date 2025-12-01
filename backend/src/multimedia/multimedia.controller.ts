// src/multimedia/multimedia.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  ParseUUIDPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { MultimediaType } from './enums/multimedia-type.enum';
import { MultimediaService } from './multimedia.service';
import { MultimediaResponseDto } from './dto/multimedia-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiProperty,
  ApiQuery
} from '@nestjs/swagger';

// DTO para el body del upload
class UploadMultimediaDto {
  @ApiProperty({
    enum: MultimediaType,
    example: MultimediaType.IMAGE,
    description: 'Tipo de archivo multimedia (IMAGE o VIDEO)'
  })
  tipo: MultimediaType;

  @ApiProperty({
    description: 'Descripción opcional del archivo multimedia',
    required: false,
    example: 'Imagen principal del testimonio'
  })
  descripcion?: string;
}

@ApiTags('Multimedia')
@ApiBearerAuth('JWT-auth')
@Controller('multimedia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MultimediaController {
  constructor(
    private readonly multimediaService: MultimediaService  
  ) { }

  @Post('upload/:testimonioId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.CONTRIBUTOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir archivo multimedia para testimonio',
    description: 'Sube un archivo de imagen o video y lo asocia a un testimonio específico. Los archivos se almacenan en Cloudinary y se guardan en la base de datos.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Formulario para subir archivo multimedia',
    schema: {
      type: 'object',
      required: ['file', 'tipo'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPEG, PNG, WEBP) o video (MP4, MOV)'
        },
        tipo: {
          type: 'string',
          enum: Object.values(MultimediaType),
          example: MultimediaType.IMAGE,
          description: 'Tipo de archivo multimedia - IMAGE para imágenes, VIDEO para videos'
        },
        descripcion: {
          type: 'string',
          description: 'Descripción opcional del archivo multimedia',
          example: 'Imagen principal del testimonio'
        }
      },
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido y guardado exitosamente',
    type: MultimediaResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o tipo incorrecto'
  })
  async uploadMedia(
    @Param('testimonioId', new ParseUUIDPipe()) testimonioId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMultimediaDto
  ): Promise<MultimediaResponseDto> {
    const { tipo, descripcion } = body;

    console.log('🔍 DEBUG - Body recibido:', body);
    console.log('🔍 DEBUG - Tipo recibido:', tipo);
    console.log('🔍 DEBUG - File recibido:', file?.originalname);

    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    if (!tipo) {
      throw new BadRequestException('El campo "tipo" es requerido');
    }

    if (![MultimediaType.IMAGE, MultimediaType.VIDEO].includes(tipo)) {
      throw new BadRequestException(`Tipo debe ser ${MultimediaType.IMAGE} o ${MultimediaType.VIDEO}. Recibido: ${tipo}`);
    }

    const result = await this.multimediaService.createWithUpload(
      testimonioId,
      file,
      tipo,
      descripcion
    );

    return this.multimediaService.toResponseDto(result.multimedia);
  }

  @Get('testimonio/:testimonioId')
  @ApiOperation({
    summary: 'Listar multimedia de un testimonio',
    description: 'Obtiene todos los archivos multimedia asociados a un testimonio específico. Se puede filtrar por tipo.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos multimedia obtenida exitosamente',
    type: [MultimediaResponseDto]
  })
  @ApiResponse({
    status: 404,
    description: 'Testimonio no encontrado'
  })
  @ApiParam({
    name: 'testimonioId',
    description: 'ID del testimonio',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({
    name: 'tipo',
    enum: MultimediaType,
    required: false,
    description: 'Filtrar por tipo de multimedia'
  })
  async listTestimonioMedia(
    @Param('testimonioId', new ParseUUIDPipe()) testimonioId: string,
    @Query('tipo') tipo?: MultimediaType
  ): Promise<MultimediaResponseDto[]> {
    return this.multimediaService.findByTestimonioIdWithFilter(testimonioId, tipo);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({
    summary: 'Eliminar archivo multimedia',
    description: 'Elimina un archivo multimedia tanto de Cloudinary como de la base de datos usando su ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo multimedia eliminado exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo multimedia no encontrado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del multimedia en la base de datos',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  async deleteMedia(
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return this.multimediaService.remove(id);
  }

  @Get('urls/:id')
  @ApiOperation({
    summary: 'Obtener URLs optimizadas',
    description: 'Genera URLs optimizadas para diferentes usos (original, optimizada, thumbnail) de un archivo multimedia'
  })
  @ApiResponse({
    status: 200,
    description: 'URLs optimizadas generadas exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo multimedia no encontrado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del multimedia en la base de datos',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  async getMediaUrls(
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return this.multimediaService.getOptimizedUrls(id);
  }

  @Get('health')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({
    summary: 'Health check del servicio multimedia',
    description: 'Verifica el estado de la conexión con Cloudinary y la base de datos'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios funcionando correctamente'
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio no disponible'
  })
  async healthCheck() {
    // El health check ahora debe estar en MultimediaService
    return this.multimediaService.healthCheck();
  }

  @Get('config/check')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verificar configuración de servicios' })
  async checkConfig() {
    // Este método puede mantenerse en el controller ya que es específico de configuración
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : undefined,
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : undefined,
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    };

    return {
      services: {
        cloudinary: cloudinaryConfig,
        database: {
          has_url: !!process.env.DATABASE_URL,
          environment: process.env.NODE_ENV
        }
      },
      status: cloudinaryConfig.configured ? '✅ Configurado' : '❌ No configurado',
      message: cloudinaryConfig.configured
        ? 'Todos los servicios están configurados correctamente'
        : 'Verifica las variables de entorno de Cloudinary'
    };
  }
}