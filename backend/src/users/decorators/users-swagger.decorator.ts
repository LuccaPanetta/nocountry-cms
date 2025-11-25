import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

export function UsersSwagger() {
  return applyDecorators(
    ApiTags('Usuarios'),
    ApiBearerAuth('JWT-auth'),
    UseGuards(JwtAuthGuard, RolesGuard)
  );
}