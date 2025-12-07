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
          contenido: {
            type: 'string',
            description: `**📖 Contenido principal**`,
            example: 'Este servicio superó todas mis expectativas...',
            minLength: 10,
            maxLength: 2000
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
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: `**📹 Tipo de archivo** 
            
**Solo requerido si se sube archivo.** 
Si no se especifica y se sube archivo, se detecta automáticamente.`,
            example: MultimediaType.IMAGE
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
      enum: ['pending','in_review', 'approved', 'rejected'],
      example: 'approved'
    }),
    ApiQuery({
      name: 'categoryId',
      required: false,
      description: 'Filtrar por ID de categoría',
      /* example: '123e4567-e89b-12d3-a456-426614174000' */
    }),
    ApiQuery({
      name: 'tags',
      required: false,
      description: 'Filtrar por tags (nombres separados por comas)',
      /* example: 'tecnologia,servicio' */
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
      summary: '✏️ Actualizar un testimonio existente',
      description: `
Permite actualizar parcialmente un testimonio.

## 🔥 Reglas importantes
### 📌 1. Sobre el campo **status**
❗ *No se puede actualizar desde este endpoint*.  
Use: **PATCH /testimonials/:id/status**

---

## 🎬 Reglas de actualización de multimedia
1. **Subir un nuevo archivo (\`file\`)**
   - Se elimina multimedia anterior.
   - Se ignora completamente \`multimediaUrl\`.

2. **Enviar una nueva URL externa (\`multimediaUrl\`)**
   - Se elimina archivo previo si existía.
   - Se reemplaza por la nueva URL.

3. **Eliminar multimedia**
   - Enviar: \`multimediaUrl: ""\` o \`null\`.

4. **Sin cambios de multimedia**
   - No enviar ni \`file\` ni \`multimediaUrl\`.

---

## 🧪 Formatos aceptados para \`tagIds\`
- JSON array → \`["uuid1","uuid2"]\`
- Comas → \`uuid1,uuid2\`
- Un solo ID → \`uuid1\`
- Limpiar todo → \`[]\`
`
    }),

    ApiConsumes('multipart/form-data'),

    ApiParam({
      name: 'id',
      description: 'ID del testimonio a actualizar',
      example: '7a8c4f58-2a99-4fc9-8bd0-5572d1c5da31',
    }),

    ApiBody({
      description: 'Campos opcionales para actualizar el testimonio',
      schema: {
        type: 'object',
        properties: {
          titulo: {
            type: 'string',
            description: 'Título del testimonio',
            maxLength: 200,
            example: 'Resultados increíbles con el nuevo sistema'
          },
          autorNombre: {
            type: 'string',
            description: 'Nombre del autor del testimonio',
            maxLength: 100,
            example: 'María González'
          },
          empresa: {
            type: 'string',
            description: 'Empresa del autor',
            maxLength: 150,
            example: 'Tech Solutions SA'
          },
          cargo: {
            type: 'string',
            description: 'Cargo del autor',
            maxLength: 100,
            example: 'Gerente de Operaciones'
          },
          contenido: {
            type: 'string',
            description: 'Contenido actualizado del testimonio',
            maxLength: 2000,
            example: 'El servicio mejoró significativamente nuestro proceso interno.'
          },
          categoryId: {
            type: 'string',
            format: 'uuid',
            description: 'Nueva categoría asociada',
            example: '3d09faca-1bef-49da-ae64-08c211cc98a8'
          },
          tagIds: {
            type: 'string',
            description: `🏷️ IDs de Tags.  
Admite array, coma separada, un ID o limpiar con "[]"`,
            example: '["d1b9c18b-2f1b-47ad-bdc0-e6a7b91e1db0","5385d6a9-ddd3-49c2-a64b-f91dba0f7f3d"]'
          },
          tipo: {
            type: 'string',
            enum: Object.values(MultimediaType),
            description: 'Tipo de multimedia para el archivo subido',
            example: MultimediaType.IMAGE
          },
          multimediaUrl: {
            type: 'string',
            description: `**🔗 Nueva URL externa de multimedia**  
          - Reemplaza multimedia existente  
          - Para eliminar: enviar \`""\`  
          - Para dejar igual: no enviar`,
            example: 'https://res.cloudinary.com/demo/video/upload/v17302341/testimonio123.mp4'
          },
          file: {
            type: 'string',
            format: 'binary',
            description: '📎 Nuevo archivo multimedia (imagen o video)'
          },
          descripcion: {
            type: 'string',
            maxLength: 500,
            description: 'Descripción del archivo multimedia',
            example: 'Fotografía del cliente mostrando el resultado final'
          }
        }
      }
    }),

    ApiResponse({
      status: 200,
      description: '✅ Testimonio actualizado correctamente'
    }),
    ApiResponse({
      status: 400,
      description: '❌ Datos inválidos (ejemplo: archivo + URL simultáneamente)'
    }),
    ApiResponse({
      status: 404,
      description: '❌ El testimonio no existe'
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