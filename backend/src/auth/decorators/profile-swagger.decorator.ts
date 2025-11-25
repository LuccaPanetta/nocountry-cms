import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserAuthResponseDto } from '../dto/auth-response.dto';

export function ProfileSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Perfil de usuario',
      description: 'Obtiene la información completa del perfil del usuario autenticado'
    }),
    ApiResponse({
      status: 200,
      description: 'Perfil obtenido exitosamente',
      type: UserAuthResponseDto 
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token inválido o expirado'
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado'
    })
  );
}