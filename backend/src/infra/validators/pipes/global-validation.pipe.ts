// src/common/pipes/global-validation.pipe.ts
import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  private readonly logger = new Logger(GlobalValidationPipe.name);

  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        this.logger.warn('❌ Errores de validación detectados:', {
          errorsCount: errors.length,
          errors: errors.map(err => ({
            field: err.property,
            errors: err.constraints,
            value: err.value
          }))
        });

        const formattedErrors = this.formatErrors(errors);
        
        return new BadRequestException({
          statusCode: 400,
          message: 'Errores de validación en la solicitud',
          errors: formattedErrors,
          timestamp: new Date().toISOString(),
          path: '', // Se llenará en el filtro
        });
      },
    });
  }

  private formatErrors(errors: ValidationError[]): any[] {
    return errors.map(error => {
      const constraints = error.constraints || {};
      
      return {
        field: error.property,
        value: error.value,
        errors: Object.keys(constraints).map(key => ({
          code: key,
          message: this.translateConstraint(key, constraints[key], error.property, error.value)
        })),
        children: error.children ? this.formatErrors(error.children) : []
      };
    });
  }

  private translateConstraint(
    constraint: string, 
    message: string, 
    field: string, 
    value: any
  ): string {
    const translations: Record<string, string> = {
      'isString': `El campo '${field}' debe ser texto`,
      'isNotEmpty': `El campo '${field}' es requerido`,
      'isEmail': `El campo '${field}' debe ser un email válido`,
      'isUrl': `El campo '${field}' debe ser una URL válida`,
      'isUUID': `El campo '${field}' debe ser un UUID válido`,
      'isEnum': `El campo '${field}' tiene un valor no permitido: '${value}'`,
      'minLength': `El campo '${field}' debe tener al menos ${message.split(' ')[3]} caracteres`,
      'maxLength': `El campo '${field}' no puede exceder ${message.split(' ')[3]} caracteres`,
      'matches': `El campo '${field}' tiene un formato inválido`,
      'isArray': `El campo '${field}' debe ser un array`,
      'arrayMinSize': `El campo '${field}' debe tener al menos ${message.split(' ')[3]} elementos`,
      'arrayMaxSize': `El campo '${field}' no puede exceder ${message.split(' ')[3]} elementos`,
    };

    return translations[constraint] || message;
  }
}