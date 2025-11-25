import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

export function AuthSwagger() {
  return applyDecorators(
    ApiTags('Autenticación y Gestión de Usuarios'),
    ApiBearerAuth('JWT-auth')
  );
}