import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

export class SwaggerConfig {
  private static isProduction = process.env.NODE_ENV === 'production';
  private static port = process.env.PORT || 3000;
  private static protocol = this.isProduction ? 'https' : 'http';
  private static localUrl = `${this.protocol}://localhost:${this.port}`;
  private static backendUrl = process.env.RENDER_BACKEND_URL || 
    (this.isProduction ? 'https://tu-backend.onrender.com' : this.localUrl);

  static createConfig() {
    return new DocumentBuilder()
      .setTitle('Testimonial CMS - TestiGo')
      .setDescription(this.getDescription())
      .setVersion('1.0')
      .addServer(this.localUrl, '💻 Desarrollo Local - Entorno de desarrollo')
      .addServer(this.backendUrl, '🚀 Producción - Entorno estable en Render')
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
  }

  static createCustomOptions(): SwaggerCustomOptions {
    return {
      customSiteTitle: 'Testimonial CMS - TestiGo Docs',
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        validatorUrl: null,
        tryItOutEnabled: true,
        configUrl: `${this.backendUrl}/api/v1/docs-json`,
        oauth2RedirectUrl: `${this.backendUrl}/api/v1/docs/oauth2-redirect.html`,
      },
    };
  }

  private static getDescription(): string {
    return `
## 📚 CMS Especializado para Instituciones Educativas

Sistema diseñado para recopilar, organizar y publicar testimonios de impacto de programas educativos. 
Gestiona historias reales de estudiantes y programas con moderación integrada y analítica de engagement.

### 🌐 Servidores Disponibles
- **💻 Desarrollo Local**: Ideal para desarrollo y testing
- **🚀 Producción**: Entorno estable en Render
    `;
  }

  static getBackendUrl(): string {
    return this.backendUrl;
  }

  static getLocalUrl(): string {
    return this.localUrl;
  }
}