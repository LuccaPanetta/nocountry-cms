import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user-role.enum';

export function FindAllUsersSwagger() {
  return applyDecorators(
    Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR),
    ApiOperation({ 
      summary: 'Obtener todos los usuarios',
      description: 'Retorna una lista paginada de todos los usuarios del sistema'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Lista de usuarios obtenida exitosamente',
      schema: {
        example: {
          data: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              nombre: 'María',
              apellido: 'García',
              email: 'maria@ejemplo.com',
              role: 'EDITOR',
              createdAt: '2024-01-15T10:30:00.000Z'
            }
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
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