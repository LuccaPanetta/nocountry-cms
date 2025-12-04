// src/testimonials/decorators/index.ts - VERSIÓN ACTUALIZADA
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

**Para multimedia - OPCIÓN A: Subir archivo**
- **Imágenes:** JPEG, PNG, WEBP (máx 5MB)
- **Videos:** MP4, MOV (máx 50MB)
- **Campo:** \`file\`
- **Opcional:** \`tipo\` (si no se especifica, se detecta automáticamente)

**Para multimedia - OPCIÓN B: Usar URL externa**
- **Campo:** \`multimediaUrl\`
- **Formato:** URL válida de imagen o video (YouTube, Vimeo, etc.)
- **Importante:** No se puede enviar archivo y URL simultáneamente

**Reglas de multimedia:**
1. **Subir archivo** → Se ignora \`multimediaUrl\`
2. **Usar URL externa** → No se sube archivo
3. **Sin multimedia** → No enviar ni archivo ni URL`
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
          multimediaUrl: { // ✅ CAMBIADO: videoUrl → multimediaUrl
            type: 'string',
            description: `**🔗 URL externa de multimedia (imagen o video)** 
            
**Ejemplos válidos:**
- \`https://www.youtube.com/watch?v=dQw4w9WgXcQ\`
- \`https://example.com/imagen.jpg\`
- \`https://vimeo.com/123456789\`

**Nota:** No se puede usar simultáneamente con archivo`,
            example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: `**📹 Tipo de archivo** 
            
**Solo requerido si se sube archivo.** 
Si no se especifica y se sube archivo, se detecta automáticamente.`,
            example: MultimediaType.IMAGE
          },
          file: {
            type: 'string',
            format: 'binary',
            description: `**📎 Archivo multimedia** 
            
**Formatos aceptados:**
- **Imágenes:** JPEG, PNG, WEBP (máx 5MB)
- **Videos:** MP4, MOV (máx 50MB)

**Nota:** No se puede usar simultáneamente con \`multimediaUrl\``
          },
          descripcion: {
            type: 'string',
            description: '📝 Descripción del archivo multimedia',
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

// 🔍 Mantener FindAllTestimonialsSwagger (sin cambios)
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

// 🔍 Mantener FindOneTestimonialSwagger (sin cambios)
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

// ✏️ UpdateTestimonialSwagger (actualizado)
export function UpdateTestimonialSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '✏️ Actualizar testimonio',
      description: `Actualiza un testimonio existente.
**Importante:** El campo 'status' NO se puede actualizar aquí. 
Use la ruta \`PATCH /testimonials/:id/status\` para cambiar el estado.
**Reglas de actualización de multimedia:**
1. **Subir nuevo archivo** → Se elimina multimedia anterior y se ignora \`multimediaUrl\`
2. **Usar nueva URL** → Se elimina archivo anterior (si existe) y se actualiza URL
3. **Limpiar multimedia** → Enviar \`multimediaUrl\` vacío o null
4. **Sin cambios** → No enviar ni \`file\` ni \`multimediaUrl\``
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
          contenido: { 
            type: 'string',
            description: 'Nuevo contenido',
            maxLength: 2000
          },
          titulo: { 
            type: 'string',
            description: 'Nuevo título',
            maxLength: 200
          },
          autorNombre: { 
            type: 'string',
            description: 'Nuevo nombre del autor',
            maxLength: 100
          },
          empresa: { 
            type: 'string',
            description: 'Nueva empresa',
            maxLength: 150
          },
          cargo: { 
            type: 'string',
            description: 'Nuevo cargo',
            maxLength: 100
          },
          multimediaUrl: { // ✅ CAMBIADO: videoUrl → multimediaUrl
            type: 'string',
            description: `**🔗 Nueva URL externa de multimedia** 
            
Para eliminar multimedia existente: enviar valor vacío \`""\`
Para actualizar URL: enviar nueva URL válida`,
            example: 'https://www.youtube.com/watch?v=abc123'
          },
          categoryId: {
            type: 'string',
            format: 'uuid',
            description: 'Nueva categoría',
          },
          tagIds: {
            type: 'string',
            description: `**🏷️ Nuevas etiquetas** 
            
**Formato:** 
1. JSON array: \`["uuid1","uuid2"]\`
2. Lista separada por comas: \`uuid1,uuid2\`
3. Un solo ID: \`uuid1\`
4. Para limpiar todos los tags: enviar array vacío \`[]\``,
            example: '3d09faca-1bef-49da-ae64-08c211cc98a8,cda3620b-0e3e-4b7b-8eb8-d676b6dbf290'
          },
          file: {
            type: 'string',
            format: 'binary',
            description: '**📎 Nuevo archivo multimedia**',
          },
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: '**📹 Tipo de nuevo archivo**',
          },
          descripcion: { 
            type: 'string',
            description: '**📝 Nueva descripción del archivo**',
            maxLength: 500
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: '✅ Testimonio actualizado'
    }),
    ApiResponse({
      status: 400,
      description: '❌ Datos inválidos (ej: archivo y URL simultáneos)'
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

// 🗑️ DeleteTestimonialSwagger (sin cambios)
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

// 📊 UpdateStatusSwagger (sin cambios)
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

// 🆕 Opcional: Decorador para multimedia específico (actualizado)
export function UpdateTestimonialMultimediaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '🖼️ Actualizar solo multimedia',
      description: `Actualiza solo el archivo multimedia de un testimonio.

**Nota:** Esta operación eliminará cualquier multimedia existente
y cualquier URL externa que estuviera configurada.`
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
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: '📎 Nuevo archivo multimedia'
          },
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: '📹 Tipo de archivo (opcional, se detecta automáticamente)'
          },
          descripcion: {
            type: 'string',
            description: '📝 Descripción del archivo (opcional)',
            maxLength: 500
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
    }),
    ApiResponse({
      status: 400,
      description: '❌ Archivo inválido o excede tamaño máximo'
    })
  );
}

// 🆕 Opcional: Para formularios frontend
export function TestimonialFormDataSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '📋 Datos para formulario',
      description: `Devuelve estructura y datos para construir formulario frontend.

**Incluye:**
- Lista de categorías disponibles
- Lista de tags disponibles
- Reglas de validación
- Opciones de multimedia`
    }),
    ApiResponse({
      status: 200,
      description: 'Datos del formulario',
      schema: {
        type: 'object',
        properties: {
          rules: {
            type: 'object',
            description: 'Reglas de validación',
            properties: {
              contenido: {
                minLength: 10,
                maxLength: 2000,
              },
              titulo: {
                maxLength: 200,
              },
              autorNombre: {
                maxLength: 100,
                pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'
              },
              multimedia: {
  description: 'Reglas para enviar multimedia (archivo o URL)',
  oneOf: [
    // Opción 1: El cliente sube un archivo
    {
      type: 'string',
      format: 'binary',
      description: 'Archivo multimedia (imagen o video). Tamaño máx: 5MB imágenes / 50MB videos. Formatos: JPEG, PNG, WEBP, MP4, MOV'
    },
    // Opción 2: El cliente envía una URL externa
    {
      type: 'string',
      format: 'uri',
      description: 'URL externa válida a una imagen o video'
    }
  ]
}
            }
          },
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