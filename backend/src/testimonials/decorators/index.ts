// src/testimonials/decorators/index.ts - VERSIÓN COMPLETA
import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/interfaces/user-role.enum';
import { Public } from '../../auth/decorators/public.decorator';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

// ✅ Decorador principal para el controller
export function TestimonialsSwagger() {
  return applyDecorators(
    ApiTags('📝 Testimonios'),
    ApiBearerAuth('JWT-auth')
  );
}

export function CreateTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '📝 Crear nuevo testimonio',
      description: `## 📋 Información importante:
      
**Para categorías y tags:**
1. Primero consulta los endpoints:
   - \`GET /categories\` → Lista de categorías disponibles
   - \`GET /tags\` → Lista de tags disponibles
2. Selecciona los IDs correspondientes
3. Envía los IDs en el request

**Para archivos multimedia:**
- Imágenes: JPEG, PNG, WEBP (máx 5MB)
- Videos: MP4, MOV (máx 50MB)`
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Formulario para crear testimonio',
      schema: {
        type: 'object',
        required: ['contenido', 'categoryId'],
        properties: {
          contenido: {
            type: 'string',
            description: `**📖 Contenido principal**`,
            example: 'Este servicio superó todas mis expectativas...',
            minLength: 10,
            maxLength: 2000
          },
          titulo: {
            type: 'string',
            description: '🏷️ Título breve',
            example: 'Experiencia increíble con Producto X',
            maxLength: 200
          },
          autorNombre: {
            type: 'string',
            description: '👤 Nombre completo del autor',
            example: 'María González',
            maxLength: 100
          },
          empresa: {
            type: 'string',
            description: '🏢 Empresa u organización',
            example: 'Innovatech Solutions',
            maxLength: 150
          },
          cargo: {
            type: 'string',
            description: '💼 Posición o cargo',
            example: 'Directora de Marketing',
            maxLength: 100
          },
          categoryId: {
            type: 'string',
            format: 'uuid',
            description: `**📂 Categoría del testimonio** 
            
**Requerido.** ID de categoría. Consulta primero: \`GET /categories\``,
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          tagIds: {
            type: 'string',
            description: `**🏷️ Etiquetas del testimonio** 
            
**Formato:** Array JSON de IDs como string.
Consulta primero: \`GET /tags\`

**Ejemplo de valor:**
\`\`\`json
["323e4567-e89b-12d3-a456-426614174000", "423e4567-e89b-12d3-a456-426614174000"]
\`\`\``,
            example: '["323e4567-e89b-12d3-a456-426614174000", "423e4567-e89b-12d3-a456-426614174000"]'
          },
          videoUrl: {
            type: 'string',
            description: `**🎥 URL de video externo**`,
            example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: `**📹 Tipo de archivo**`,
            example: MultimediaType.IMAGE,
            default: MultimediaType.IMAGE
          },
          file: {
            type: 'string',
            format: 'binary',
            description: `**📎 Archivo multimedia** 
            
- **Imágenes:** JPEG, PNG, WEBP (máx 5MB)
- **Videos:** MP4, MOV (máx 50MB)`
          },
          descripcion: {
            type: 'string',
            description: '📝 Descripción del archivo',
            example: 'Foto del cliente usando nuestro producto',
            maxLength: 500
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: '✅ Testimonio creado exitosamente'
    }),
    ApiResponse({
      status: 400,
      description: '❌ Datos inválidos'
    }),
    ApiResponse({
      status: 401,
      description: '🔒 No autorizado'
    }),
    ApiResponse({
      status: 403,
      description: '🚫 Permisos insuficientes'
    })
  );
}

// 🔍 Mantener FindAllTestimonialsSwagger
export function FindAllTestimonialsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '📋 Listar testimonios',
      description: 'Obtiene todos los testimonios con filtros opcionales.'
    }),
    ApiQuery({
      name: 'status',
      required: false,
      description: 'Filtrar por estado',
      enum: ['pending', 'approved', 'rejected'],
      example: 'approved'
    }),
    ApiQuery({
      name: 'categoryId',
      required: false,
      description: 'Filtrar por ID de categoría',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    ApiQuery({
      name: 'tags',
      required: false,
      description: 'Filtrar por tags (nombres separados por comas)',
      example: 'tecnologia,servicio'
    }),
    ApiResponse({
      status: 200,
      description: '✅ Lista obtenida exitosamente'
    }),
    ApiResponse({
      status: 401,
      description: '🔒 No autorizado'
    }),
    ApiResponse({
      status: 403,
      description: '🚫 Permisos insuficientes'
    })
  );
}

// 🔍 Mantener FindOneTestimonialSwagger
export function FindOneTestimonialSwagger() {
  return applyDecorators(
    Public(),
    ApiOperation({
      summary: '🔍 Obtener testimonio específico',
      description: 'Obtiene un testimonio por su ID. **Acceso público**.'
    }),
    ApiParam({
      name: 'id',
      description: 'ID del testimonio',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    ApiResponse({
      status: 200,
      description: '✅ Testimonio obtenido'
    }),
    ApiResponse({
      status: 404,
      description: '❌ No encontrado'
    })
  );
}

// ✏️ Mantener UpdateTestimonialSwagger
export function UpdateTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '✏️ Actualizar testimonio',
      description: 'Actualiza un testimonio existente.'
    }),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      description: 'ID del testimonio a actualizar',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    ApiBody({
      description: 'Campos a actualizar (todos opcionales)',
      schema: {
        type: 'object',
        properties: {
          contenido: { type: 'string' },
          titulo: { type: 'string' },
          autorNombre: { type: 'string' },
          empresa: { type: 'string' },
          cargo: { type: 'string' },
          videoUrl: { type: 'string' },
          categoryId: {
            type: 'string',
            format: 'uuid',
            description: 'Nueva categoría',
          },
         tagIds: {
  type: 'string',
  description: `**🏷️ Etiquetas del testimonio** 
  
**Formato:** 
1. JSON array: \`["uuid1","uuid2"]\`
2. Lista separada por comas: \`uuid1,uuid2\`
3. Un solo ID: \`uuid1\``,
  example: '3d09faca-1bef-49da-ae64-08c211cc98a8,cda3620b-0e3e-4b7b-8eb8-d676b6dbf290'
},
          file: {
            type: 'string',
            format: 'binary',
            description: 'Nuevo archivo',
          },
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
          },
          descripcion: { type: 'string' },
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: '✅ Testimonio actualizado'
    }),
    ApiResponse({
      status: 404,
      description: '❌ No encontrado'
    }),
    ApiResponse({
      status: 401,
      description: '🔒 No autorizado'
    }),
    ApiResponse({
      status: 403,
      description: '🚫 Permisos insuficientes'
    })
  );
}

// 🗑️ Mantener DeleteTestimonialSwagger
export function DeleteTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '🗑️ Eliminar testimonio',
      description: 'Elimina permanentemente un testimonio. **Solo administradores**.'
    }),
    ApiParam({
      name: 'id',
      description: 'ID del testimonio a eliminar',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    ApiResponse({
      status: 200,
      description: '✅ Testimonio eliminado'
    }),
    ApiResponse({
      status: 404,
      description: '❌ No encontrado'
    }),
    ApiResponse({
      status: 401,
      description: '🔒 No autorizado'
    }),
    ApiResponse({
      status: 403,
      description: '🚫 Se requieren permisos de administrador'
    })
  );
}

// 📊 Mantener UpdateStatusSwagger
export function UpdateStatusSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '📊 Moderar testimonio',
      description: 'Aprueba o rechaza un testimonio.'
    }),
    ApiParam({
      name: 'id',
      description: 'ID del testimonio',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    ApiBody({
      description: 'Nuevo estado',
      schema: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
            description: '📊 Nuevo estado',
            example: 'approved'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: '✅ Estado actualizado'
    }),
    ApiResponse({
      status: 404,
      description: '❌ No encontrado'
    }),
    ApiResponse({
      status: 401,
      description: '🔒 No autorizado'
    }),
    ApiResponse({
      status: 403,
      description: '🚫 Permisos insuficientes'
    })
  );
}

// 🆕 Opcional: Decorador para multimedia específico
export function UpdateTestimonialMultimediaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '🖼️ Actualizar solo multimedia',
      description: 'Actualiza solo el archivo multimedia de un testimonio.'
    }),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      description: 'ID del testimonio',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    ApiBody({
      description: 'Nuevo archivo multimedia',
      schema: {
        type: 'object',
        required: ['file', 'tipo'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: '📎 Nuevo archivo'
          },
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: '📹 Tipo de archivo'
          },
          descripcion: {
            type: 'string',
            description: '📝 Descripción'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: '✅ Multimedia actualizado'
    }),
    ApiResponse({
      status: 404,
      description: '❌ No encontrado'
    })
  );
}

// 🆕 Opcional: Para formularios frontend
export function TestimonialFormDataSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '📋 Datos para formulario',
      description: 'Devuelve estructura y datos para construir formulario frontend.'
    }),
    ApiResponse({
      status: 200,
      description: 'Datos del formulario',
      schema: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            description: 'Categorías para selectbox',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                nombre: { type: 'string' },
                descripcion: { type: 'string' }
              }
            }
          },
          tags: {
            type: 'array',
            description: 'Tags para multi-select',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                nombre: { type: 'string' },
                color: { type: 'string' }
              }
            }
          }
        }
      }
    })
  );
}