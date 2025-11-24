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
        email: 'usuario@ejemplo.com',
        name: 'Juan Pérez',
        role: 'editor',
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
    description: 'Autentica un usuario y genera un token JWT'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        id: 1,
        email: 'usuario@ejemplo.com',
        name: 'Juan Pérez',
        role: 'editor',
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
  @ApiBearerAuth('JWT-auth') // 👈 Indica que requiere autenticación
  @ApiOperation({
    summary: 'Perfil de usuario',
    description: 'Obtiene la información del perfil del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    schema: {
      example: {
        id: 1,
        email: 'usuario@ejemplo.com',
        name: 'Juan Pérez',
        role: 'editor',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
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
