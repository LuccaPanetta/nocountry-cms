import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './infra/validators/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  dotenv.config();
  const port = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // ✅ DETECTAR PROTOCOLO CORRECTO AUTOMÁTICAMENTE
  const protocol = isProduction ? 'https' : 'http';
  const localUrl = `${protocol}://localhost:${port}`;
  
  // ✅ FORZAR HTTPS EN PRODUCCIÓN PARA RENDER
  const backendUrl = process.env.RENDER_BACKEND_URL || 
                    (isProduction ? `https://tu-backend.onrender.com` : `http://localhost:${port}`);

  console.log('🚀 Iniciando aplicación...');
  console.log('🔧 Configuración Servidores:', {
    NODE_ENV: process.env.NODE_ENV,
    protocol,
    localUrl,
    backendUrl
  });

  const app = await NestFactory.create(AppModule);

  // ✅ CORS CONFIGURADO CORRECTAMENTE
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000', // HTTPS local
    'https://localhost:3001', // HTTPS local
    backendUrl,
    process.env.RENDER_BACKEND_URL,
  ].filter((origin): origin is string => !!origin); // ✅ Elimina valores undefined

  // ✅ AGREGAR URL ACTUAL COMO ORIGEN PERMITIDO
  if (!allowedOrigins.includes(backendUrl)) {
    allowedOrigins.push(backendUrl);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // ✅ SWAGGER CONFIGURADO PARA HTTPS EN PRODUCCIÓN
  const config = new DocumentBuilder()
    .setTitle('Testimonial CMS - TestiGo')
    .setDescription(`
## 📚 CMS Especializado para Instituciones Educativas

Sistema diseñado para recopilar, organizar y publicar testimonios de impacto de programas educativos. 
Gestiona historias reales de estudiantes y programas con moderación integrada y analítica de engagement.

### 🌐 Servidores Disponibles
- **💻 Desarrollo Local**: Ideal para desarrollo y testing
- **🚀 Producción**: Entorno estable en Render
    `)
    .setVersion('1.0')
    // ✅ USAR PROTOCOLO CORRECTO EN CADA SERVIDOR
    .addServer(localUrl, '💻 Desarrollo Local - Entorno de desarrollo')
    .addServer(backendUrl, '🚀 Producción - Entorno estable en Render')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token requerido para roles Admin y Editor',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ✅ CONFIGURACIÓN SWAGGER MEJORADA
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'Testimonial CMS - TestiGo Docs',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      validatorUrl: null,
      tryItOutEnabled: true,
      // ✅ CONFIGURACIÓN PARA EVITAR MIXED CONTENT
      configUrl: `${backendUrl}/api/v1/docs-json`,
      oauth2RedirectUrl: `${backendUrl}/api/v1/docs/oauth2-redirect.html`,
    },
  });

  // ✅ MIDDLEWARE PARA FORZAR HTTPS EN PRODUCCIÓN
  if (isProduction) {
    app.use((req, res, next) => {
      // Verificar si la request viene por HTTP y redirigir a HTTPS
      if (req.headers['x-forwarded-proto'] !== 'https' && !req.secure) {
        const httpsUrl = `https://${req.headers.host}${req.url}`;
        console.log(`🔒 Redirigiendo a HTTPS: ${httpsUrl}`);
        return res.redirect(301, httpsUrl);
      }
      next();
    });
  }

  // ✅ MIDDLEWARE PARA LOGGING
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} | Origin: ${origin} | Protocol: ${req.protocol}`);
    next();
  });

  await app.listen(port);

  console.log(`
==========================================================
📚 Testimonial CMS - TestiGo
✅ Aplicación iniciada correctamente
📍 Puerto: ${port}
🌍 Ambiente: ${isProduction ? 'production' : 'development'}
🔒 Protocolo: ${protocol}

🔗 Servidores Swagger:
├── 💻 Desarrollo: ${localUrl}/api/v1/docs  
└── 🚀 Producción: ${backendUrl}/api/v1/docs

⚠️  IMPORTANTE: En producción usa siempre HTTPS
==========================================================`);
}

bootstrap();