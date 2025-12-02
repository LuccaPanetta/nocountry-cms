// src/common/interceptors/transform-form-data.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformFormDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Solo procesar multipart/form-data
    if (request.headers['content-type']?.includes('multipart/form-data')) {
      this.transformFormData(request.body);
    }
    
    return next.handle();
  }

  private transformFormData(body: any) {
    // Transformar tagIds de string a array
    if (body.tagIds && typeof body.tagIds === 'string') {
      if (body.tagIds.startsWith('[') && body.tagIds.endsWith(']')) {
        // Si es JSON array string
        try {
          body.tagIds = JSON.parse(body.tagIds);
        } catch {
          // Si falla, mantener como string
        }
      } else if (body.tagIds.includes(',')) {
        // Si es lista separada por comas
        body.tagIds = body.tagIds.split(',').map((id: string) => id.trim());
      } else {
        // Si es un solo ID
        body.tagIds = [body.tagIds];
      }
    }

    // Convertir tipo a MultimediaType si es necesario
    if (body.tipo && typeof body.tipo === 'string') {
      body.tipo = body.tipo.toUpperCase();
    }
  }
}