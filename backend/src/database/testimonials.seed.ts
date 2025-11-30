// src/database/testimonials.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Testimonial, TestimonialStatus } from '../testimonials/entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class TestimonialsSeed {
  private readonly logger = new Logger(TestimonialsSeed.name);

  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    try {
      // ✅ VERIFICAR SI LA TABLA EXISTE
      const tableExists = await this.checkIfTableExists('testimonios');
      if (!tableExists) {
        this.logger.warn('⚠️ La tabla testimonios no existe. Saltando seeding...');
        return;
      }

      this.logger.log('🌱 CREANDO TESTIMONIOS...');

      const testimonials = await this.createTestimonials();
      
      if (testimonials.length > 0) {
        await this.testimonialRepository.save(testimonials);
        this.logger.log(`✅ ${testimonials.length} testimonios creados`);
      } else {
        this.logger.warn('⚠️ No se crearon testimonios (posible falta de datos relacionados)');
      }
    } catch (error) {
      this.logger.error('❌ Error durante el seeding de testimonios:', error);
    }
  }
  private async checkIfTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [tableName]
      );
      return result[0].exists;
    } catch (error) {
      this.logger.warn(`⚠️ No se pudo verificar la existencia de la tabla ${tableName}:`, error);
      return false;
    }
  }

  private async createTestimonials(): Promise<Testimonial[]> {
    try {
      // Obtener datos necesarios con tipos explícitos
      const [users, allTags, allCategories] = await Promise.all([
        this.userRepository.find({ take: 8 }).catch(() => [] as User[]),
        this.tagRepository.find().catch(() => [] as Tag[]),
        this.categoryRepository.find().catch(() => [] as Category[])
      ]);

      // Log de datos disponibles
      this.logger.log(`📊 Datos disponibles - Usuarios: ${users.length}, Tags: ${allTags.length}, Categorías: ${allCategories.length}`);

      // Verificar que existen usuarios, tags y categorías
      if (users.length === 0) {
        this.logger.warn('⚠️ No hay usuarios disponibles para asociar testimonios');
        return [];
      }
      if (allTags.length === 0) {
        this.logger.warn('⚠️ No hay tags disponibles para asociar testimonios');
      }
      if (allCategories.length === 0) {
        this.logger.warn('⚠️ No hay categorías disponibles para asociar testimonios');
      }

      // ✅ CORREGIDO: Función helper para encontrar tags de forma segura
      const findTags = (...tagNames: string[]): Tag[] => {
        if (allTags.length === 0) return [];
        
        return tagNames
          .map(name => allTags.find(tag => tag.name === name))
          .filter((tag): tag is Tag => tag !== undefined);
      };

      // ✅ CORREGIDO: Función helper para encontrar categoría de forma segura
      const findCategory = (categoryName: string): Category | undefined => {
        if (allCategories.length === 0) return undefined;
        
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
      ];

      // Filtrar testimonios que tengan al menos un usuario disponible
      const validTestimonials = testimonialsData.filter(testimonial => 
        testimonial.user !== undefined
      );

      if (validTestimonials.length < testimonialsData.length) {
        this.logger.warn(`⚠️ Se omitieron ${testimonialsData.length - validTestimonials.length} testimonios por falta de usuarios`);
      }

      // Filtrar testimonios que no tengan categoría (opcional, dependiendo de tus requisitos)
      const testimonialsWithCategory = validTestimonials.filter(testimonial => 
        testimonial.category !== undefined
      );

      if (testimonialsWithCategory.length < validTestimonials.length) {
        this.logger.warn(`⚠️ Se omitieron ${validTestimonials.length - testimonialsWithCategory.length} testimonios por falta de categorías`);
      }

      this.logger.log(`📝 Testimonios a crear: ${testimonialsWithCategory.length}`);

      return this.testimonialRepository.create(testimonialsWithCategory);

    } catch (error) {
      this.logger.error('❌ Error creando testimonios:', error);
      return [];
    }
  }
}