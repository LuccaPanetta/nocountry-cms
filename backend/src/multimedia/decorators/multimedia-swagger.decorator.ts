import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MultimediaResponseDto } from '../dto/multimedia-response.dto';
import { MultimediaType } from '../enums/multimedia-type.enum';

export function MultimediaSwagger() {
  return applyDecorators(
    ApiTags('Multimedia'),
    ApiBearerAuth('JWT-auth')
  );
}

export function UploadMediaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Subir archivo multimedia para testimonio',
      description: 'Sube un archivo de imagen o video y lo asocia a un testimonio específico. Los archivos se almacenan en Cloudinary y se guardan en la base de datos.'
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
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
    }),
    ApiResponse({
      status: 201,
      description: 'Archivo subido y guardado exitosamente',
      type: MultimediaResponseDto
    }),
    ApiResponse({
      status: 400,
      description: 'Archivo inválido o tipo incorrecto'
    }),
    ApiParam({
      name: 'testimonioId',
      description: 'ID del testimonio',
      example: '123e4567-e89b-12d3-a456-426614174000'
    })
  );
}

export function ListTestimonioMediaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar multimedia de un testimonio',
      description: 'Obtiene todos los archivos multimedia asociados a un testimonio específico. Se puede filtrar por tipo.'
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de archivos multimedia obtenida exitosamente',
      type: [MultimediaResponseDto]
    }),
    ApiResponse({
      status: 404,
      description: 'Testimonio no encontrado'
    }),
    ApiParam({
      name: 'testimonioId',
      description: 'ID del testimonio',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    ApiQuery({
      name: 'tipo',
      enum: MultimediaType,
      required: false,
      description: 'Filtrar por tipo de multimedia'
    })
  );
}

export function DeleteMediaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar archivo multimedia',
      description: 'Elimina un archivo multimedia tanto de Cloudinary como de la base de datos usando su ID'
    }),
    ApiResponse({
      status: 200,
      description: 'Archivo multimedia eliminado exitosamente'
    }),
    ApiResponse({
      status: 404,
      description: 'Archivo multimedia no encontrado'
    }),
    ApiParam({
      name: 'id',
      description: 'ID del multimedia en la base de datos',
      example: '123e4567-e89b-12d3-a456-426614174000'
    })
  );
}

export function GetMediaUrlsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener URLs optimizadas',
      description: 'Genera URLs optimizadas para diferentes usos (original, optimizada, thumbnail) de un archivo multimedia'
    }),
    ApiResponse({
      status: 200,
      description: 'URLs optimizadas generadas exitosamente'
    }),
    ApiResponse({
      status: 404,
      description: 'Archivo multimedia no encontrado'
    }),
    ApiParam({
      name: 'id',
      description: 'ID del multimedia en la base de datos',
      example: '123e4567-e89b-12d3-a456-426614174000'
    })
  );
}

export function HealthCheckSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Health check del servicio multimedia',
      description: 'Verifica el estado de la conexión con Cloudinary y la base de datos'
    }),
    ApiResponse({
      status: 200,
      description: 'Servicios funcionando correctamente'
    }),
    ApiResponse({
      status: 503,
      description: 'Servicio no disponible'
    })
  );
}

export function CheckConfigSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Verificar configuración de servicios' 
    })
  );
}