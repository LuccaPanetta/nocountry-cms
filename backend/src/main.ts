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
  
  const localUrl = `http://localhost:${port}`;
  const backendUrl = process.env.RENDER_BACKEND_URL || `https://tu-backend.onrender.com`; // Asegúrate de que sea HTTPS

  console.log('🚀 Iniciando aplicación...');
  console.log('🔧 Configuración Servidores:', {
    NODE_ENV: process.env.NODE_ENV,
    localUrl,
    backendUrl
  });

  const app = await NestFactory.create(AppModule);

  // ✅ CORS CONFIGURADO PARA MULTIPLES ORIGENS
 app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    process.env.RENDER_BACKEND_URL
  ],
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

  // ✅ SWAGGER CON MULTIPLES SERVIDORES FUNCIONALES
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
    // ✅ AMBOS SERVIDORES CON DESCRIPCIONES CLARAS
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

  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'Testimonial CMS - Edtech',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      // ✅ CONFIGURACIÓN PARA MULTIPLES SERVIDORES
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      validatorUrl: null,
      tryItOutEnabled: true,
      // ✅ CONFIGURACIÓN CRÍTICA: Especifica qué servidor usar por defecto
      urls: [
        {
          url: `${localUrl}/api/v1/docs-json`,
          name: '💻 Desarrollo Local'
        },
        {
          url: `${backendUrl}/api/v1/docs-json`, 
          name: '🚀 Producción'
        }
      ]
    },
    customJs: `
      // Script para manejar correctamente los servidores
      window.onload = function() {
        const select = document.querySelector('#servers');
        if (select) {
          select.addEventListener('change', function(e) {
            const selectedUrl = e.target.value;
            console.log('Servidor seleccionado:', selectedUrl);
          });
        }
      }
    `,
  });

  // ✅ MIDDLEWARE PARA LOGGING DE CORS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} | Origin: ${origin}`);
    
    // Headers CORS explícitos para Swagger
    if (origin && origin.includes('localhost') || origin?.includes('render.com')) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    }
    
    next();
  });

  await app.listen(port);

  console.log(`
==========================================================
📚 Testimonial CMS - Edtech
✅ Aplicación iniciada correctamente
📍 Puerto: ${port}
🌍 Ambiente: ${isProduction ? 'production' : 'development'}

🔗 Servidores Swagger:
├── 💻 Desarrollo: ${localUrl}/api/v1/docs  
└── 🚀 Producción: ${backendUrl}/api/v1/docs
==========================================================`);
}

bootstrap();