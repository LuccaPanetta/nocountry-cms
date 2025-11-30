// src/testimonials/decorators/index.ts
import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/interfaces/user-role.enum';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { Public } from '../../auth/decorators/public.decorator';

// ✅ Decorador principal para el controller (como UsersSwagger)
export function TestimonialsSwagger() {
  return applyDecorators(
    ApiTags('testimonials'),
    ApiBearerAuth('JWT-auth') // ✅ ESTE ES EL CLAVE QUE FALTABA
  );
}

export function CreateTestimonialSwagger() {
  return applyDecorators(
    Roles(UserRole.CONTRIBUTOR, UserRole.EDITOR, UserRole.ADMIN), // ✅ Incluye todos los roles que pueden crear
    ApiOperation({ 
      summary: 'Crear un nuevo testimonio',
      description: 'Crea un nuevo testimonio en el sistema'
    }),
    ApiBody({ type: CreateTestimonialDto }),
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
    Roles(UserRole.EDITOR, UserRole.ADMIN), // ✅ Solo editor y admin pueden ver la lista completa
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
    Roles(UserRole.EDITOR, UserRole.ADMIN),
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
    Roles(UserRole.ADMIN),
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
    Roles(UserRole.EDITOR, UserRole.ADMIN),
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