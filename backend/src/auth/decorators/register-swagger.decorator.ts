import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

export function RegisterSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registro de contribuidor',
      description: 'Crea una nueva cuenta de contribuidor en el sistema'
    }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'Contribuidor registrado exitosamente',
      type: AuthResponseDto
    }),
    ApiResponse({
      status: 400,
      description: 'Datos de registro inválidos o usuario ya existe'
    })
  );
}