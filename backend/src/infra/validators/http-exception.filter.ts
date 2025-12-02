// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log detallado del error
    this.logError(exception, request);

    const { status, errorResponse } = this.getErrorResponse(exception, request);

    response.status(status).json(errorResponse);
  }

  private logError(exception: unknown, request: Request) {
    const method = request.method;
    const url = request.url;
    const body = request.body;
    const user = (request as any).user?.id || 'anonymous';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      
      this.logger.warn(`⚠️  ${method} ${url} - ${status} - User: ${user}`, {
        status,
        error: response,
        body,
        user,
        timestamp: new Date().toISOString(),
      });
    } else {
      this.logger.error(`🔥 ${method} ${url} - ERROR NO MANEJADO - User: ${user}`, {
        error: exception,
        stack: (exception as Error).stack,
        body,
        user,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private getErrorResponse(exception: unknown, request: Request): {
    status: number;
    errorResponse: any;
  } {
    // Manejo de ValidationPipe errors
    if (
      exception instanceof HttpException &&
      exception.getStatus() === HttpStatus.BAD_REQUEST
    ) {
      const response = exception.getResponse();
      
      if (typeof response === 'object' && response['errors']) {
        return {
          status: HttpStatus.BAD_REQUEST,
          errorResponse: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Errores de validación en la solicitud',
            errors: response['errors'],
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
          },
        };
      }
    }

    // Error estándar HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return {
        status,
        errorResponse: {
          statusCode: status,
          message: typeof response === 'string' 
            ? response 
            : (response as any).message || 'Error del servidor',
          ...(typeof response === 'object' && { details: response }),
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Error no manejado
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errorResponse: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno del servidor',
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          error: (exception as Error).message,
        }),
      },
    };
  }
}