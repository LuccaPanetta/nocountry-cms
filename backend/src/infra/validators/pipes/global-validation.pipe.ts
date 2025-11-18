import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        // Mapear errores a mensajes en español sencillos
        const messages = errors
          .map((err) => {
            if (err.constraints) {
              return Object.values(err.constraints).join(', ');
            }
            // nested errors
            return Object.values(err.children || {})
              .map((c: any) =>
                c.constraints ? Object.values(c.constraints).join(', ') : '',
              )
              .join(', ');
          })
          .filter(Boolean);
        return new BadRequestException({
          message: 'Errores de validación',
          errors: messages,
        });
      },
    });
  }
}
