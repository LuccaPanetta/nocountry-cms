import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Autenticación y Gestión de Usuarios')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Registro de contribuidor',
    description: 'Crea una nueva cuenta de contribuidor en el sistema'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Contribuidor registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de registro inválidos o usuario ya existe'
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
@ApiOperation({
  summary: 'Inicio de sesión',
  description: `Autentica un usuario y genera un token JWT

### Roles disponibles:
- **👤 Contributor**: Puede crear y gestionar sus propios testimonios
- **👑 Admin**: Acceso completo al sistema y gestión de usuarios
- **⚙️ Operator**: Puede moderar y gestionar testimonios de todos los usuarios

Selecciona un rol del dropdown para cargar automáticamente las credenciales de ejemplo.`
})
@ApiBody({
  description: 'Selecciona un rol para cargar credenciales de ejemplo',
  examples: {
    admin: {
      summary: '👑 Administrador',
      description: 'Acceso completo al sistema',
      value: {
        email: 'admin@testimonialcms.com',
        password: 'admin123!'
      }
    },
    operator: {
      summary: '⚙️ Operador',
      description: 'Puede moderar testimonios de todos los usuarios',
      value: {
        email: 'operator@testimonialcms.com',
        password: 'operator123!'
      }
    },
    contributor: {
      summary: '👤 Contribuidor',
      description: 'Puede gestionar sus propios testimonios',
      value: {
        email: 'contributor@dominio.com',
        password: 'contributor123!'
      }
    }
  }
})
@ApiResponse({
    status: 201,
    description: 'Contribuidor registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
@ApiResponse({
  status: 401,
  description: 'Credenciales inválidas'
})
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}

  @UseGuards(JwtAuthGuard)
@Get('profile')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Perfil de usuario',
  description: 'Obtiene la información completa del perfil del usuario autenticado'
})
@ApiResponse({
  status: 200,
  description: 'Perfil obtenido exitosamente',
  schema: {
    example: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'usuario@gmail.com',
      rol: 'CONTRIBUTOR'
    }
  }
})
@ApiResponse({
  status: 401,
  description: 'No autorizado - Token inválido o expirado'
})
@ApiResponse({
  status: 404,
  description: 'Usuario no encontrado'
})
profile(@Req() req: any) {
  return this.authService.profile(req.user);
}
}