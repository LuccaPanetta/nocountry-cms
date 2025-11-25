import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user-role.enum';

export function FindOneUserSwagger() {
  return applyDecorators(
    Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR),
    ApiOperation({ 
      summary: 'Obtener usuario por ID',
      description: 'Retorna la información detallada de un usuario específico'
    }),
    ApiParam({
      name: 'id',
      description: 'UUID del usuario',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Usuario encontrado exitosamente',
      schema: {
        example: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nombre: 'María',
          apellido: 'García',
          email: 'maria@ejemplo.com',
          role: 'OPERATOR',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Usuario no encontrado' 
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