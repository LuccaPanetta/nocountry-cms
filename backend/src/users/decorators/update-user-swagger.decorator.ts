import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user-role.enum';
import { UpdateUserDto } from '../dto/update-user.dto';

export function UpdateUserSwagger() {
  return applyDecorators(
    Roles(UserRole.ADMIN),
    ApiOperation({ 
      summary: 'Actualizar usuario',
      description: 'Actualiza la información de un usuario existente (solo administradores)'
    }),
    ApiParam({
      name: 'id',
      description: 'UUID del usuario a actualizar',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({ 
      status: 200, 
      description: 'Usuario actualizado exitosamente',
      schema: {
        example: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nombre: 'María Elena',
          apellido: 'García López',
          email: 'maria@ejemplo.com',
          role: 'EDITOR',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T11:45:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Usuario no encontrado' 
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Datos de actualización inválidos' 
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