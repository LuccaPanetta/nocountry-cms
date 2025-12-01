// src/testimonials/decorators/index.ts
import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/interfaces/user-role.enum';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { MultimediaType } from 'src/multimedia/enums/multimedia-type.enum';
// ✅ Decorador principal para el controller (como UsersSwagger)
export function TestimonialsSwagger() {
  return applyDecorators(
    ApiTags('testimonials'),
    ApiBearerAuth('JWT-auth') // ✅ ESTE ES EL CLAVE QUE FALTABA
  );
}

export function CreateTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo testimonio',
      description: 'Crea un nuevo testimonio en el sistema. Puede incluir archivo multimedia.'
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'FormData para crear testimonio',
      schema: {
        type: 'object',
        required: ['contenido', 'categoryId'],
        properties: {
          titulo: {
            type: 'string',
            description: 'Título del testimonio (opcional)',
            example: 'Mi experiencia con el producto X'
          },

          autorNombre: {
            type: 'string',
            description: 'Nombre del autor (opcional)',
            example: 'Juan Pérez'
          },

          empresa: {
            type: 'string',
            description: 'Empresa del autor (opcional)',
            example: 'Tech Solutions Inc.'
          },

          cargo: {
            type: 'string',
            description: 'Cargo del autor (opcional)',
            example: 'CEO'
          },

          categoryId: {
            type: 'string',
            format: 'uuid',
            description: 'ID de la categoría',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },

          tagIds: {
            type: 'string',
            description: 'IDs de tags como JSON array string',
            example: '["123e4567-e89b-12d3-a456-426614174001"]'
          },

          contenido: {
            type: 'string',
            description: 'Contenido principal del testimonio',
            example: 'Este es un testimonio increíble...'
          },

          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: 'Tipo de archivo (si se sube archivo)',
            example: MultimediaType.IMAGE
          },

          file: {
            type: 'string',
            format: 'binary',
            description: 'Archivo de imagen (JPEG, PNG, WEBP) o video (MP4, MOV)'
          },




          videoUrl: {
            type: 'string',
            description: 'URL de video externo (opcional)',
            example: 'https://www.youtube.com/watch?v=abc123'
          },

          descripcion: {
            type: 'string',
            description: 'Descripción del archivo (opcional)',
            example: 'Imagen principal del testimonio'
          },
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
            description: 'Estado del testimonio (opcional)',
            default: 'pending'
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Testimonio creado exitosamente'
    }),
    ApiResponse({
      status: 400,
      description: 'Datos del testimonio inválidos'
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido'
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - Permisos insuficientes'
    })
  );
}

export function FindAllTestimonialsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los testimonios',
      description: 'Retorna una lista de testimonios con filtros y paginación'
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de testimonios obtenida exitosamente'
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido'
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - Permisos insuficientes'
    })
  );
}

export function FindOneTestimonialSwagger() {
  return applyDecorators(
    Public(), // ✅ Este endpoint es público
    ApiOperation({
      summary: 'Obtener un testimonio específico',
      description: 'Retorna un testimonio específico por ID (acceso público)'
    }),
    ApiResponse({
      status: 200,
      description: 'Testimonio obtenido exitosamente'
    }),
    ApiResponse({
      status: 404,
      description: 'Testimonio no encontrado'
    })
  );
}

export function UpdateTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un testimonio',
      description: 'Actualiza el contenido de un testimonio existente'
    }),
    ApiBody({ type: UpdateTestimonialDto }),
    ApiResponse({
      status: 200,
      description: 'Testimonio actualizado exitosamente'
    }),
    ApiResponse({
      status: 404,
      description: 'Testimonio no encontrado'
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido'
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - Permisos insuficientes'
    })
  );
}

export function DeleteTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un testimonio',
      description: 'Elimina permanentemente un testimonio del sistema (solo administradores)'
    }),
    ApiResponse({
      status: 200,
      description: 'Testimonio eliminado exitosamente'
    }),
    ApiResponse({
      status: 404,
      description: 'Testimonio no encontrado'
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido'
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - Se requieren permisos de administrador'
    })
  );
}

export function UpdateStatusSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar estado de un testimonio',
      description: 'Aprueba o rechaza un testimonio (moderación)'
    }),
    ApiBody({ type: UpdateStatusDto }),
    ApiResponse({
      status: 200,
      description: 'Estado del testimonio actualizado exitosamente'
    }),
    ApiResponse({
      status: 404,
      description: 'Testimonio no encontrado'
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido'
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - Permisos insuficientes'
    })
  );
}