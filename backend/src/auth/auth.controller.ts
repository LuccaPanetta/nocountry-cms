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
    summary: 'Registro de usuario',
    description: 'Crea una nueva cuenta de usuario en el sistema'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'usuario@ejemplo.com',
        role: 'contributor',
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
        password: 'admin123'
      }
    },
    operator: {
      summary: '⚙️ Operador',
      description: 'Puede moderar testimonios de todos los usuarios',
      value: {
        email: 'operator@testimonialcms.com',
        password: 'operator123'
      }
    },
    contributor: {
      summary: '👤 Contribuidor',
      description: 'Puede gestionar sus propios testimonios',
      value: {
        email: 'contributor@testimonialcms.com',
        password: 'contributor123'
      }
    }
  }
})
@ApiResponse({
  status: 200,
  description: 'Login exitoso',
  schema: {
    examples: {
      admin: {
        summary: 'Login como Admin',
        value: {
          id: 1,
          nombre: 'Admin',
          apellido: 'Sistema',
          email: 'admin@testimonialcms.com',
          role: 'admin',
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          permissions: ['all']
        }
      },
      operator: {
        summary: 'Login como Operator',
        value: {
          id: 2,
          nombre: 'Operador',
          apellido: 'Sistema',
          email: 'operator@testimonialcms.com',
          role: 'operator',
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          permissions: ['moderate', 'read_all', 'manage_testimonials']
        }
      },
      contributor: {
        summary: 'Login como Contributor',
        value: {
          id: 3,
          nombre: 'Contribuidor',
          apellido: 'Ejemplo',
          email: 'contributor@testimonialcms.com',
          role: 'contributor',
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          permissions: ['create', 'read_own', 'update_own']
        }
      }
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
    description: 'Obtiene la información del perfil del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    schema: {
      examples: {
        admin: {
          summary: 'Perfil Admin',
          value: {
            id: 1,
            nombre: 'Admin',
            apellido: 'Sistema',
            email: 'admin@testimonialcms.com',
            role: 'admin',
            permissions: ['all'],
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        },
        operator: {
          summary: 'Perfil Operator',
          value: {
            id: 2,
            nombre: 'Operador',
            apellido: 'Sistema',
            email: 'operator@testimonialcms.com',
            role: 'operator',
            permissions: ['moderate', 'read_all', 'manage_testimonials'],
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        },
        contributor: {
          summary: 'Perfil Contributor',
          value: {
            id: 3,
            nombre: 'Contribuidor',
            apellido: 'Ejemplo',
            email: 'contributor@testimonialcms.com',
            role: 'contributor',
            permissions: ['create', 'read_own', 'update_own'],
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado'
  })
  profile(@Req() req: any) {
    return this.authService.profile(req.user);
  }
}