// database/seeds/testimonials.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial, TestimonialStatus } from '../testimonials/entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class TestimonialsSeed {
  private readonly logger = new Logger(TestimonialsSeed.name);
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed() {
    try {
      if (this.isDevelopment) {
        this.logger.log('🔄 Modo desarrollo: Creando testimonios...');
      } else {
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

  private async createTestimonials(): Promise<Testimonial[]> {
    // Obtener datos necesarios
    const [users, allTags, allCategories] = await Promise.all([
      this.userRepository.find({ take: 8 }),
      this.tagRepository.find(),
      this.categoryRepository.find(),
    ]);

    // Función helper para encontrar tags de forma segura
    const findTags = (...tagNames: string[]): Tag[] => {
      return tagNames
        .map(name => allTags.find(tag => tag.name === name))
        .filter((tag): tag is Tag => tag !== undefined);
    };

    // Función helper para encontrar categoría de forma segura
    const findCategory = (categoryName: string): Category | undefined => {
      return allCategories.find(category => category.name === categoryName);
    };

    const testimonialsData: Partial<Testimonial>[] = [
      // Testimonios aprobados
      {
        contenido: 'Increíble servicio. El equipo de soporte fue muy profesional y resolvió todos mis problemas en tiempo récord. ¡Altamente recomendados!',
        autorNombre: 'Carlos Mendoza',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio1.mp4',
        user: users[0],
        category: findCategory('servicios'),
        tags: findTags('servicio', 'soporte', 'recomendación'),
      },
      {
        contenido: 'Llevo más de 2 años usando esta plataforma y ha transformado completamente mi negocio. La facilidad de uso y las funcionalidades son excepcionales.',
        autorNombre: 'Ana López',
        status: TestimonialStatus.APPROVED,
        imageUrl: 'https://example.com/images/testimonio2.jpg',
        user: users[1],
        category: findCategory('tecnología'),
        tags: findTags('tecnología', 'facilidad-uso', 'empresa'),
      },
      {
        contenido: 'La mejor decisión que tomé para mi empresa. El ROI fue inmediato y el equipo de implementación fue excelente. ¡Gracias por todo!',
        autorNombre: 'Roberto Silva',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio3.mp4',
        user: users[2],
        category: findCategory('consultoría'),
        tags: findTags('empresa', 'innovación'),
      },
      {
        contenido: 'Me encanta lo intuitiva que es la plataforma. En menos de una semana ya estaba operando con total normalidad. El soporte 24/7 es un plus increíble.',
        autorNombre: 'María González',
        status: TestimonialStatus.APPROVED,
        user: users[3],
        category: findCategory('tecnología'),
        tags: findTags('facilidad-uso', 'soporte'),
      },

      // Testimonios pendientes
      {
        contenido: 'Buena experiencia en general, aunque tuve algunos problemas iniciales con la configuración. El soporte técnico me ayudó a resolverlos rápidamente.',
        autorNombre: 'José Ramírez',
        status: TestimonialStatus.PENDING,
        user: users[4],
        category: findCategory('servicios'),
        tags: findTags('servicio', 'soporte'),
      },
      {
        contenido: 'Interesante plataforma con mucho potencial. Estoy en proceso de evaluación pero hasta ahora todo va muy bien. Espero poder dar una reseña más completa pronto.',
        autorNombre: 'Laura Torres',
        status: TestimonialStatus.PENDING,
        imageUrl: 'https://example.com/images/testimonio6.jpg',
        user: users[5],
        category: findCategory('tecnología'),
        tags: findTags('tecnología', 'innovación'),
      },

      // Testimonios rechazados (para testing de moderación)
      {
        contenido: 'No cumplió con mis expectativas. El servicio fue regular y tuve varios inconvenientes.',
        autorNombre: 'Usuario Anónimo',
        status: TestimonialStatus.REJECTED,
        user: users[6],
        category: findCategory('servicios'),
        tags: findTags('servicio'),
      },
      {
        contenido: 'Prometen mucho pero no cumplen. No recomiendo este servicio para negocios serios.',
        autorNombre: 'Cliente Insatisfecho',
        status: TestimonialStatus.REJECTED,
        user: users[7],
        category: findCategory('consultoría'),
        tags: findTags('empresa'),
      },

      // Más testimonios variados
      {
        contenido: 'La integración con otras herramientas fue perfecta. Ahorramos horas de trabajo manual cada semana. ¡Eficiencia al máximo!',
        autorNombre: 'Diego Herrera',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio9.mp4',
        category: findCategory('tecnología'),
        tags: findTags('tecnología', 'innovación'),
      },
      {
        contenido: 'Como freelancer, esta plataforma me ha permitido organizar mis proyectos de manera mucho más efectiva. Las métricas y reportes son muy útiles.',
        autorNombre: 'Sofía Castro',
        status: TestimonialStatus.APPROVED,
        imageUrl: 'https://example.com/images/testimonio10.jpg',
        category: findCategory('productos'),
        tags: findTags('freelancer', 'facilidad-uso'),
      },
      {
        contenido: 'Excelente relación calidad-precio. Hay funciones que no esperaba encontrar en este rango de precio. Muy satisfecho con la compra.',
        autorNombre: 'Miguel Ángel Ruiz',
        status: TestimonialStatus.PENDING,
        category: findCategory('productos'),
        tags: findTags('recomendación'),
      },
      {
        contenido: 'La curva de aprendizaje es mínima. En un par de horas ya estaba usando las funciones principales. Documentación clara y ejemplos prácticos.',
        autorNombre: 'Elena Morales',
        status: TestimonialStatus.APPROVED,
        category: findCategory('educación'),
        tags: findTags('facilidad-uso', 'educación'),
      },
      {
        contenido: 'El equipo de ventas fue muy honesto sobre las capacidades reales del producto. Aprecio la transparencia y el enfoque en el cliente.',
        autorNombre: 'Fernando Jiménez',
        status: TestimonialStatus.APPROVED,
        videoUrl: 'https://example.com/videos/testimonio13.mp4',
        category: findCategory('servicios'),
        tags: findTags('servicio', 'recomendación'),
      },
      {
        contenido: 'Las actualizaciones constantes mantienen la plataforma siempre relevante. Se nota que escuchan el feedback de los usuarios.',
        autorNombre: 'Patricia Navarro',
        status: TestimonialStatus.PENDING,
        imageUrl: 'https://example.com/images/testimonio14.jpg',
        category: findCategory('tecnología'),
        tags: findTags('tecnología', 'innovación'),
      },
      {
        contenido: 'Perfecto para equipos remotos. La colaboración en tiempo real ha mejorado nuestra productividad en un 40%. Herramienta esencial hoy en día.',
        autorNombre: 'Ricardo Ortega',
        status: TestimonialStatus.APPROVED,
        category: findCategory('tecnología'),
        tags: findTags('tecnología', 'empresa', 'innovación'),
      },
    ];

    return this.testimonialRepository.create(testimonialsData);
  }
}