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
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { CloudinaryMediaService } from '../cloudinary/cloudinary-media.service';
import { MultimediaType } from './enums/multimedia-type.enum';
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
  constructor(private readonly mediaService: CloudinaryMediaService) { }

  @Post('upload/:testimonioId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir archivo multimedia para testimonio',
    description: 'Sube un archivo de imagen o video y lo asocia a un testimonio específico. Los archivos se almacenan en Cloudinary.'
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
    description: 'Archivo multimedia subido exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de entrada o archivo no proporcionado'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Rol de usuario no tiene permisos'
  })
  @ApiParam({
    name: 'testimonioId',
    description: 'ID del testimonio al que se asociará el archivo multimedia',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  async uploadMedia(
    @Param('testimonioId') testimonioId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMultimediaDto
  ) {
    const { tipo, descripcion } = body;

    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    if (![MultimediaType.IMAGE, MultimediaType.VIDEO].includes(tipo)) {
      throw new BadRequestException('Tipo debe ser IMAGE o VIDEO');
    }

    return this.mediaService.uploadMedia(
      file.buffer,
      testimonioId,
      tipo,
      descripcion
    );
  }

  @Get('testimonio/:testimonioId')
  @ApiOperation({
    summary: 'Listar multimedia de un testimonio',
    description: 'Obtiene todos los archivos multimedia asociados a un testimonio específico. Se puede filtrar por tipo.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos multimedia obtenida exitosamente'
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
    @Param('testimonioId') testimonioId: string,
    @Query('tipo') tipo?: MultimediaType
  ) {
    return this.mediaService.listTestimonioMedia(testimonioId, tipo);
  }

  @Delete(':publicId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({
    summary: 'Eliminar archivo multimedia',
    description: 'Elimina un archivo multimedia tanto de Cloudinary como de la base de datos usando su publicId'
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
    name: 'publicId',
    description: 'ID público del archivo en Cloudinary',
    example: 'testimonios/123e4567/image_abc123'
  })
  @ApiBody({
    description: 'Datos necesarios para eliminar el archivo',
    schema: {
      type: 'object',
      required: ['tipo'],
      properties: {
        tipo: {
          type: 'string',
          enum: Object.values(MultimediaType),
          example: MultimediaType.IMAGE,
          description: 'Tipo de archivo multimedia a eliminar'
        }
      }
    }
  })
  async deleteMedia(
    @Param('publicId') publicId: string,
    @Body('tipo') tipo: MultimediaType
  ) {
    return this.mediaService.deleteMedia(publicId, tipo);
  }

  @Get('urls/:publicId')
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
    name: 'publicId',
    description: 'ID público del archivo en Cloudinary',
    example: 'testimonios/123e4567/image_abc123'
  })
  @ApiBody({
    description: 'Datos necesarios para generar las URLs',
    schema: {
      type: 'object',
      required: ['tipo'],
      properties: {
        tipo: {
          type: 'string',
          enum: Object.values(MultimediaType),
          example: MultimediaType.IMAGE,
          description: 'Tipo de archivo multimedia'
        }
      }
    }
  })
  async getMediaUrls(
    @Param('publicId') publicId: string,
    @Body('tipo') tipo: MultimediaType
  ) {
    return this.mediaService.getMediaUrls(publicId, tipo);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check del servicio Cloudinary',
    description: 'Verifica el estado de la conexión con Cloudinary'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio Cloudinary funcionando correctamente'
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Cloudinary no disponible'
  })
  async healthCheck() {
    return this.mediaService.healthCheck();
  }
}