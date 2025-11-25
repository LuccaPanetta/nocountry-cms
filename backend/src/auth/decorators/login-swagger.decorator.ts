import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Inicio de sesión',
      description: `Autentica un usuario y genera un token JWT

### Roles disponibles:
- **👤 Contributor**: Puede crear y gestionar sus propios testimonios
- **👑 Admin**: Acceso completo al sistema y gestión de usuarios
- **⚙️ Editor**: Puede moderar y gestionar testimonios de todos los usuarios

Selecciona un rol del dropdown para cargar automáticamente las credenciales de ejemplo.`
    }),
    ApiBody({
      description: 'Selecciona un rol para cargar credenciales de ejemplo',
      examples: {
        admin: {
          summary: '👑 Administrador',
          description: 'Acceso completo al sistema',
          value: {
            email: 'admin@testimonialcms.com',
            password: 'password123!'
          }
        },
        editor: {
          summary: '⚙️ Editor',
          description: 'Puede moderar testimonios de todos los usuarios',
          value: {
            email: 'editor@testimonialcms.com',
            password: 'password123!'
          }
        },
        contributor: {
          summary: '👤 Contribuidor',
          description: 'Puede gestionar sus propios testimonios',
          value: {
            email: 'juan.perez@gmail.com',
            password: 'password123!'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Login exitoso',
      type: AuthResponseDto
    }),
    ApiResponse({
      status: 401,
      description: 'Credenciales inválidas'
    })
  );
}