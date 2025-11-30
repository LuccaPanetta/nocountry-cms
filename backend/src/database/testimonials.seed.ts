// database/seeds/testimonials.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial, TestimonialStatus } from '../testimonials/entities/testimonial.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TestimonialsSeed {
  private readonly logger = new Logger(TestimonialsSeed.name);
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    try {
      // ✅ EN DESARROLLO: Siempre resetear los testimonios
      if (this.isDevelopment) {
        this.logger.log('🔄 Modo desarrollo: Reiniciando testimonios...');
        await this.resetTestimonials();
      } else {
        // ✅ EN PRODUCCIÓN: Solo crear si no existen testimonios
        const testimonialCount = await this.testimonialRepository.count();
        if (testimonialCount > 0) {
          this.logger.log('✅ La base de datos ya tiene testimonios. Saltando seeding...');
          return;
        }
      }

      this.logger.log('🌱 Iniciando seeding de testimonios...');

      const testimonials = await this.createTestimonials();
      await this.testimonialRepository.save(testimonials);

      this.logger.log(`✅ Seeding completado: ${testimonials.length} testimonios creados`);
    } catch (error) {
      this.logger.error('❌ Error durante el seeding de testimonios:', error);
      throw error;
    }
  }

  private async resetTestimonials(): Promise<void> {
    try {
      // ✅ Eliminar todos los testimonios existentes
      await this.testimonialRepository.clear();
      this.logger.log('🗑️  Todos los testimonios eliminados');
    } catch (error) {
      this.logger.error('❌ Error al resetear los testimonios:', error);
      throw error;
    }
  }

  private async createTestimonials(): Promise<Testimonial[]> {
    // Obtener algunos usuarios para asociar testimonios
    const users = await this.userRepository.find({
      take: 8, // Tomar 8 usuarios para asociar testimonios
    });

    const testimonialsData: Partial<Testimonial>[] = [
      // Testimonios aprobados
      {
        contenido: 'Increíble servicio. El equipo de soporte fue muy profesional y resolvió todos mis problemas en tiempo récord. ¡Altamente recomendados!',
        autorNombre: 'Carlos Mendoza',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio1.mp4',
        user: users[0],
      },
      {
        contenido: 'Llevo más de 2 años usando esta plataforma y ha transformado completamente mi negocio. La facilidad de uso y las funcionalidades son excepcionales.',
        autorNombre: 'Ana López',
        status: TestimonialStatus.APPROVED,
        imageUrl: 'https://example.com/images/testimonio2.jpg',
        user: users[1],
      },
      {
        contenido: 'La mejor decisión que tomé para mi empresa. El ROI fue inmediato y el equipo de implementación fue excelente. ¡Gracias por todo!',
        autorNombre: 'Roberto Silva',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio3.mp4',
        user: users[2],
      },
      {
        contenido: 'Me encanta lo intuitiva que es la plataforma. En menos de una semana ya estaba operando con total normalidad. El soporte 24/7 es un plus increíble.',
        autorNombre: 'María González',
        status: TestimonialStatus.APPROVED,
        user: users[3],
      },

      // Testimonios pendientes
      {
        contenido: 'Buena experiencia en general, aunque tuve algunos problemas iniciales con la configuración. El soporte técnico me ayudó a resolverlos rápidamente.',
        autorNombre: 'José Ramírez',
        status: TestimonialStatus.PENDING,
        user: users[4],
      },
      {
        contenido: 'Interesante plataforma con mucho potencial. Estoy en proceso de evaluación pero hasta ahora todo va muy bien. Espero poder dar una reseña más completa pronto.',
        autorNombre: 'Laura Torres',
        status: TestimonialStatus.PENDING,
        imageUrl: 'https://example.com/images/testimonio6.jpg',
        user: users[5],
      },

      // Testimonios rechazados (para testing de moderación)
      {
        contenido: 'No cumplió con mis expectativas. El servicio fue regular y tuve varios inconvenientes.',
        autorNombre: 'Usuario Anónimo',
        status: TestimonialStatus.REJECTED,
        user: users[6],
      },
      {
        contenido: 'Prometen mucho pero no cumplen. No recomiendo este servicio para negocios serios.',
        autorNombre: 'Cliente Insatisfecho',
        status: TestimonialStatus.REJECTED,
        user: users[7],
      },

      // Más testimonios variados
      {
        contenido: 'La integración con otras herramientas fue perfecta. Ahorramos horas de trabajo manual cada semana. ¡Eficiencia al máximo!',
        autorNombre: 'Diego Herrera',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio9.mp4',
      },
      {
        contenido: 'Como freelancer, esta plataforma me ha permitido organizar mis proyectos de manera mucho más efectiva. Las métricas y reportes son muy útiles.',
        autorNombre: 'Sofía Castro',
        status: TestimonialStatus.APPROVED,
        imageUrl: 'https://example.com/images/testimonio10.jpg',
      },
      {
        contenido: 'Excelente relación calidad-precio. Hay funciones que no esperaba encontrar en este rango de precio. Muy satisfecho con la compra.',
        autorNombre: 'Miguel Ángel Ruiz',
        status: TestimonialStatus.PENDING,
      },
      {
        contenido: 'La curva de aprendizaje es mínima. En un par de horas ya estaba usando las funciones principales. Documentación clara y ejemplos prácticos.',
        autorNombre: 'Elena Morales',
        status: TestimonialStatus.APPROVED,
      },
      {
        contenido: 'El equipo de ventas fue muy honesto sobre las capacidades reales del producto. Aprecio la transparencia y el enfoque en el cliente.',
        autorNombre: 'Fernando Jiménez',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio13.mp4',
      },
      {
        contenido: 'Las actualizaciones constantes mantienen la plataforma siempre relevante. Se nota que escuchan el feedback de los usuarios.',
        autorNombre: 'Patricia Navarro',
        status: TestimonialStatus.PENDING,
        imageUrl: 'https://example.com/images/testimonio14.jpg',
      },
      {
        contenido: 'Perfecto para equipos remotos. La colaboración en tiempo real ha mejorado nuestra productividad en un 40%. Herramienta esencial hoy en día.',
        autorNombre: 'Ricardo Ortega',
        status: TestimonialStatus.APPROVED,
      },
    ];

    return this.testimonialRepository.create(testimonialsData);
  }
}