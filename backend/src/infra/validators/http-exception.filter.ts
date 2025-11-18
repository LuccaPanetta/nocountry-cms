import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const error = exception.getResponse();
      res.status(status).json({
        statusCode: status,
        mensaje: (error as any).message || (error as any).mensaje || 'Error',
        path: req.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Unexpected error
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      mensaje: 'Error interno del servidor',
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
