import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { GlobalValidationPipe } from './infra/validators/pipes/global-validation.pipe';
import { HttpExceptionFilter } from './infra/validators/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"; 

async function bootstrap() {
  dotenv.config();
  const port = process.env.PORT || 3000;
  const localUrl = `http://localhost:${port}`;

  const backendUrl = process.env.RENDER_BACKEND_URL || localUrl;
  const frontendUrl = process.env.VERCEL_FRONTEND_URL || 'http://localhost:3001';
  
  const app = await NestFactory.create(AppModule, { cors: true });
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Configuración de Swagger especializado para Edtech
  const config = new DocumentBuilder()
    .setTitle('Testimonial CMS - TestiGo')
    .setDescription(`
## 📚 CMS Especializado para Instituciones Educativas

Sistema diseñado para recopilar, organizar y publicar testimonios de impacto de programas educativos. 
Gestiona historias reales de estudiantes y programas con moderación integrada y analítica de engagement.
Soporta múltiples formatos multimedia y ofrece integración sencilla mediante embeds y API pública.

### 🌐 Despliegues
- **🚀 TestiGo - Backend**: [Render](${backendUrl})
- **⚡ TestiGo - Frontend**: [Vercel](${frontendUrl})
- **💻 Desarrollo Local**: [localhost:${port}](${localUrl}/api/v1/docs)
    `)
    .setVersion('1.0')
    .addServer(`${backendUrl}/api/`, '🚀 CMS de Testimonios - Backend (Render)')
    .addServer(`${frontendUrl}/api`, '⚡ CMS de Testimonios - Frontend (Vercel)') 
    .addServer(`${localUrl}/api/`, '💻 Desarrollo Local')
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
├── API Local: ${localUrl}/api
├── Docs: ${localUrl}/api/docs
├── Frontend: ${frontendUrl}
└── Backend: ${backendUrl}
==========================================================
  `);
}

bootstrap();