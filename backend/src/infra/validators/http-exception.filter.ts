import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Error interno del servidor' };

    let errorMessage: string | string[];

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      errorMessage = (exceptionResponse as any).message || (exceptionResponse as any).error || 'Error desconocido';
    } else {
      errorMessage = 'Error desconocido';
    }

    res.status(status).json({
      statusCode: status,
      mensaje: errorMessage,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}