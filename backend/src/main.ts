import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './infra/validators/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {

  dotenv.config();
  const port = process.env.PORT || 3000;
  const localUrl = `http://localhost:${port}`;

  const backendUrl = process.env.RENDER_BACKEND_URL || localUrl;
  const frontendUrl = process.env.VERCEL_FRONTEND_URL || 'http://localhost:3001';

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Testimonial CMS - TestiGo')
    .setDescription(`
## 📚 CMS Especializado para Instituciones Educativas

Sistema diseñado para recopilar, organizar y publicar testimonios de impacto de programas educativos. 
Gestiona historias reales de estudiantes y programas con moderación integrada y analítica de engagement.
Soporta múltiples formatos multimedia y ofrece integración sencilla mediante embeds y API pública.

### 🌐 Despliegues
- **💻 Desarrollo Local**: [localhost:${port}](${localUrl}/api/v1/docs)
- **🚀 TestiGo - Backend**: [Render](${backendUrl})
- **⚡ TestiGo - Frontend**: [Vercel](${frontendUrl})
    `)
    .setVersion('1.0')
    .addServer(`${localUrl}`, '💻 Desarrollo Local')
    .addServer(`${backendUrl}`, '🚀 CMS de Testimonios - Backend (Render)')
    .addServer(`${frontendUrl}`, '⚡ CMS de Testimonios - Frontend (Vercel)')
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

  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'Testimonial CMS - Edtech',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
    },
  });

  await app.listen(port);

  console.log(`
==========================================================
📚 Testimonial CMS - Edtech
==========================================================
📍 Puerto: ${port}
🌍 Ambiente: ${process.env.NODE_ENV || 'development'}

🔗 Accesos:
├── API Local: ${localUrl}/api/v1
├── Docs: ${localUrl}/api/v1/docs
├── Frontend: ${frontendUrl}
└── Backend: ${backendUrl}
==========================================================
  `);
}

bootstrap();