import * as dotenv from 'dotenv';

dotenv.config();

export class MainConfig {
  static readonly port = process.env.PORT || 3000;
  static readonly isProduction = process.env.NODE_ENV === 'production';
  static readonly protocol = this.isProduction ? 'https' : 'http';
  
  static getLocalUrl(): string {
    return `${this.protocol}://localhost:${this.port}`;
  }

  static getBackendUrl(): string {
    return process.env.RENDER_BACKEND_URL || 
      (this.isProduction ? 'https://tu-backend.onrender.com' : this.getLocalUrl());
  }

  static logStartupInfo() {
    console.log('🚀 Iniciando aplicación...');
    console.log('🔧 Configuración Servidores:', {
      NODE_ENV: process.env.NODE_ENV,
      protocol: this.protocol,
      localUrl: this.getLocalUrl(),
      backendUrl: this.getBackendUrl()
    });
  }

  static logBootstrapInfo() {
    console.log(`
==========================================================
📚 Testimonial CMS - TestiGo
✅ Aplicación iniciada correctamente
📍 Puerto: ${this.port}
🌍 Ambiente: ${this.isProduction ? 'production' : 'development'}
🔒 Protocolo: ${this.protocol}

🔗 Servidores Swagger:
├── 💻 Desarrollo: ${this.getLocalUrl()}/api/v1/docs  
└── 🚀 Producción: ${this.getBackendUrl()}/api/v1/docs

⚠️  IMPORTANTE: En producción usa siempre HTTPS
==========================================================`);
  }
}