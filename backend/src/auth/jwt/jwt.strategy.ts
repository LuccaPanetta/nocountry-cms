// src/auth/jwt/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno (.env)');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT Payload recibido:', payload); // ✅ Debug

    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    // ✅ Usa SOLO 'rol' (en español) para consistencia
    const userRol = payload.rol;

    if (!userRol) {
      throw new UnauthorizedException('Token no contiene información de rol');
    }

    return { 
      id: payload.sub, 
      email: payload.email, 
      rol: userRol // ← Asegúrate que sea 'rol'
    };
  }
}