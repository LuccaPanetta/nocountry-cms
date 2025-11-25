import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} | Origin: ${origin} | Protocol: ${req.protocol}`);
    next();
  }
}