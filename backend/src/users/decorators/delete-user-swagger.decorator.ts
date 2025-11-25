import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user-role.enum';

export function DeleteUserSwagger() {
  return applyDecorators(
    Roles(UserRole.ADMIN),
    ApiOperation({ 
      summary: 'Eliminar usuario',
      description: 'Elimina permanentemente un usuario del sistema (solo administradores)'
    }),
    ApiParam({
      name: 'id',
      description: 'UUID del usuario a eliminar',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Usuario eliminado exitosamente',
      schema: {
        example: {
          message: 'Usuario eliminado correctamente',
          id: '550e8400-e29b-41d4-a716-446655440000'
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
      description: 'Prohibido - No puedes eliminar tu propio usuario o permisos insuficientes' 
    })
  );
}