// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { 
  AuthSwagger,
  RegisterSwagger,
  LoginSwagger, 
  ProfileSwagger 
} from './decorators';
import { Public } from './decorators/public.decorator';

@AuthSwagger()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @RegisterSwagger()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @LoginSwagger()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ✅ Ya no necesita @UseGuards(JwtAuthGuard) - es global
  @Get('profile')
  @ProfileSwagger()
  profile(@Req() req: any) {
    return this.authService.profile(req.user);
  }
}