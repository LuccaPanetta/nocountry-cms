import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user-role.enum';
import { CreateUserDto } from '../dto/create-user.dto';

export function CreateUserSwagger() {
  return applyDecorators(
    Roles(UserRole.ADMIN),
    ApiOperation({ 
      summary: 'Crear usuario de rol Operador o Administrador',
      description: 'Crea un nuevo usuario en el sistema (solo administradores)'
    }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Usuario creado exitosamente',
      schema: {
        example: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nombre: 'María',
          apellido: 'García',
          email: 'maria@ejemplo.com',
          role: 'EDITOR', 
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Datos del usuario inválidos' 
    }),
    ApiResponse({ 
      status: 409, 
      description: 'El email ya está registrado' 
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