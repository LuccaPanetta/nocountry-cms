import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger.config';
import { CorsConfig } from './config/cors.config';
import { MainConfig } from './config/main.config';
import { GlobalValidationPipe } from './infra/validators/pipes/global-validation.pipe';
import { HttpExceptionFilter } from './infra/validators/http-exception.filter';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { HttpsRedirectMiddleware } from './common/middleware/https-redirect.middleware';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // Configuración inicial
  MainConfig.logStartupInfo();

  const app = await NestFactory.create(AppModule);

  // ✅ CONFIGURACIÓN MULTER PARA ARCHIVOS GRANDES (VIDEOS)
  app.use(json({ limit: '50mb' })); // Límite para JSON
  app.use(urlencoded({ extended: true, limit: '50mb' })); // Límite para URL encoded

  // Middleware específico para endpoints de upload
  app.use('/api/v1/cloudinary-test/upload/video', (req, res, next) => {
    // Aumentar límite de tamaño para videos (100MB)
    req.headers['content-length'] = '104857600';
    next();
  });

  app.use('/api/v1/testimonials/:id/video', (req, res, next) => {
    // Aumentar límite de tamaño para videos de testimonios (100MB)
    req.headers['content-length'] = '104857600';
    next();
  });

  // Middleware global
  app.use(new LoggingMiddleware().use);
  app.use(new HttpsRedirectMiddleware().use);

  // Configuración CORS
  app.enableCors(CorsConfig.createConfig());

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración Swagger
  const swaggerConfig = SwaggerConfig.createConfig();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, document, SwaggerConfig.createCustomOptions());

  // Iniciar aplicación
  await app.listen(MainConfig.port);
  
  // Log de información final
  MainConfig.logBootstrapInfo();
}

bootstrap();