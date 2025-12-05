// src/database/testimonials.seed.ts (VERSIÓN MEJORADA)
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Testimonial, TestimonialStatus } from '../testimonials/entities/testimonial.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { Multimedia } from '../multimedia/entities/multimedia.entity';
import { MultimediaType } from '../multimedia/enums/multimedia-type.enum';
import { EngagementMetric } from '../engagement/entities/engagement.entity';

@Injectable()
export class TestimonialsSeed {
  private readonly logger = new Logger(TestimonialsSeed.name);

  constructor(
   @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(Multimedia)  // ✅ AHORA ESTÁ DISPONIBLE
    private readonly multimediaRepository: Repository<Multimedia>,
    @InjectRepository(EngagementMetric) // ✅ AHORA ESTÁ DISPONIBLE
    private readonly engagementRepository: Repository<EngagementMetric>,
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
      // Verificar que todas las tablas existan
      await this.verifyTablesExist();

      this.logger.log('🌱 CREANDO TESTIMONIOS COMPLETOS CON RELACIONES...');

      // Obtener datos base primero
      const [users, allTags, allCategories] = await Promise.all([
        this.userRepository.find({ take: 8 }).catch(() => [] as User[]),
        this.tagRepository.find().catch(() => [] as Tag[]),
        this.categoryRepository.find().catch(() => [] as Category[])
      ]);

      if (users.length === 0) {
        this.logger.warn('⚠️ No hay usuarios disponibles para crear testimonios');
        return;
      }

      // Crear testimonios con todas sus relaciones
      const createdTestimonials = await this.createCompleteTestimonials(users, allTags, allCategories);
      
      if (createdTestimonials.length > 0) {
        this.logger.log(`✅ ${createdTestimonials.length} testimonios creados con relaciones completas`);
      }

      // Verificar que todo se creó correctamente
      await this.verifySeedResults();

    } catch (error) {
      this.logger.error('❌ Error durante el seeding de testimonios:', error);
    }
  }

  private async verifyTablesExist() {
    const tables = ['testimonios', 'multimedias', 'engagement_metrics', 'usuarios', 'tags', 'categorias'];
    
    for (const table of tables) {
      const exists = await this.checkIfTableExists(table);
      if (!exists) {
        throw new Error(`La tabla ${table} no existe. No se puede proceder con el seeding.`);
      }
    }
    
    this.logger.log('✅ Todas las tablas necesarias existen');
  }

  private async checkIfTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [tableName]
      );
      return result[0].exists;
    } catch (error) {
      return false;
    }
  }

  private async createCompleteTestimonials(
    users: User[], 
    allTags: Tag[], 
    allCategories: Category[]
  ): Promise<Testimonial[]> {
    // Helper functions
    const findTags = (...tagNames: string[]): Tag[] => {
      return tagNames
        .map(name => allTags.find(tag => tag.name === name))
        .filter((tag): tag is Tag => tag !== undefined);
    };

    const findCategory = (categoryName: string): Category | undefined => {
      return allCategories.find(category => category.name === categoryName);
    };

    // Datos de testimonios con todas las relaciones
    const testimonialsConfig = [
      // Testimonio 1: Aprobado con video y engagement alto
      {
        testimonial: {
          titulo: 'Soporte técnico excepcional',
          contenido: 'Increíble servicio. El equipo de soporte fue muy profesional y resolvió todos mis problemas en tiempo récord. ¡Altamente recomendados!',
          autorNombre: 'Carlos Mendoza',
          empresa: 'TechCorp Solutions',
          cargo: 'Director de IT',
          status: TestimonialStatus.APPROVED,
          user: users[0],
          category: findCategory('servicios'),
          tags: findTags('servicio', 'soporte', 'recomendación'),
        },
        multimedia: {
          tipo: MultimediaType.VIDEO,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          descripcion: 'Video testimonio de Carlos Mendoza sobre soporte técnico',
          nombreArchivo: 'testimonio-carlos-video.mp4',
          publicId: 'testimonios/carlos_mendoza_video'
        },
        engagement: {
          views: 250,
          embeds: 42
        }
      },
      // Testimonio 2: Aprobado con imagen y engagement medio
      {
        testimonial: {
          titulo: 'Transformación digital completa',
          contenido: 'Llevo más de 2 años usando esta plataforma y ha transformado completamente mi negocio. La facilidad de uso y las funcionalidades son excepcionales.',
          autorNombre: 'Ana López',
          empresa: 'Digital Innovations',
          cargo: 'CEO',
          status: TestimonialStatus.APPROVED,
          user: users[1],
          category: findCategory('tecnología'),
          tags: findTags('tecnología', 'facilidad-uso', 'empresa', 'innovación'),
        },
        multimedia: {
          tipo: MultimediaType.IMAGE,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          descripcion: 'Ana López, CEO de Digital Innovations',
          nombreArchivo: 'ana-lopez-testimonio.jpg',
          publicId: 'testimonios/ana_lopez_image'
        },
        engagement: {
          views: 189,
          embeds: 31
        }
      },
      // Testimonio 3: Aprobado con video y engagement alto
      {
        testimonial: {
          titulo: 'ROI inmediato y excelente implementación',
          contenido: 'La mejor decisión que tomé para mi empresa. El ROI fue inmediato y el equipo de implementación fue excelente. ¡Gracias por todo!',
          autorNombre: 'Roberto Silva',
          empresa: 'Silva Construcciones',
          cargo: 'Gerente General',
          status: TestimonialStatus.APPROVED,
          user: users[2],
          category: findCategory('consultoría'),
          tags: findTags('empresa', 'innovación', 'recomendación'),
        },
        multimedia: {
          tipo: MultimediaType.VIDEO,
          url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
          descripcion: 'Video testimonio de Roberto Silva sobre implementación',
          nombreArchivo: 'testimonio-roberto-video.mp4',
          publicId: 'testimonios/roberto_silva_video'
        },
        engagement: {
          views: 312,
          embeds: 55
        }
      },
      // Testimonio 4: Aprobado con imagen y engagement medio
      {
        testimonial: {
          titulo: 'Intuitiva y con soporte 24/7',
          contenido: 'Me encanta lo intuitiva que es la plataforma. En menos de una semana ya estaba operando con total normalidad. El soporte 24/7 es un plus increíble.',
          autorNombre: 'María González',
          empresa: 'Startup Ventures',
          cargo: 'Fundadora',
          status: TestimonialStatus.APPROVED,
          user: users[3],
          category: findCategory('tecnología'),
          tags: findTags('facilidad-uso', 'soporte', 'tecnología'),
        },
        multimedia: {
          tipo: MultimediaType.IMAGE,
          url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          descripcion: 'María González, Fundadora de Startup Ventures',
          nombreArchivo: 'maria-gonzalez-testimonio.jpg',
          publicId: 'testimonios/maria_gonzalez_image'
        },
        engagement: {
          views: 145,
          embeds: 22
        }
      },
      // Testimonio 5: PENDIENTE con video (el que mencionaste)
      {
        testimonial: {
          titulo: 'Probando funcionalidades avanzadas',
          contenido: 'Actualmente estamos probando las funcionalidades avanzadas. Hasta ahora la experiencia es positiva y el equipo de ventas muy atento.',
          autorNombre: 'Miguel Ángel Ruiz',
          empresa: 'Ruiz Tech Solutions',
          cargo: 'CTO',
          status: TestimonialStatus.PENDING,
          user: users[4],
          category: findCategory('tecnología'),
          tags: findTags('tecnología', 'soporte', 'empresa'),
        },
        multimedia: {
          tipo: MultimediaType.VIDEO,
          url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
          descripcion: 'Miguel Ángel Ruiz probando funcionalidades avanzadas',
          nombreArchivo: 'miguel-ruiz-video-testimonio.mp4',
          publicId: 'testimonios/miguel_ruiz_video'
        },
        engagement: {
          views: 75,
          embeds: 12
        }
      },
      // Testimonio 6: PENDIENTE sin multimedia
      {
        testimonial: {
          titulo: 'Buena experiencia con pequeños ajustes',
          contenido: 'Buena experiencia en general, aunque tuve algunos problemas iniciales con la configuración. El soporte técnico me ayudó a resolverlos rápidamente.',
          autorNombre: 'José Ramírez',
          empresa: 'Ramírez Consultores',
          cargo: 'Freelancer',
          status: TestimonialStatus.PENDING,
          user: users[5],
          category: findCategory('servicios'),
          tags: findTags('servicio', 'soporte', 'freelancer'),
        },
        engagement: {
          views: 48,
          embeds: 7
        }
      },
      // Testimonio 7: RECHAZADO
      {
        testimonial: {
          titulo: 'No cumplió expectativas',
          contenido: 'No cumplió con mis expectativas. El servicio fue regular y tuve varios inconvenientes que no fueron resueltos adecuadamente.',
          autorNombre: 'Usuario Anónimo',
          status: TestimonialStatus.REJECTED,
          user: users[6],
          category: findCategory('servicios'),
          tags: findTags('servicio'),
        },
        engagement: {
          views: 15,
          embeds: 2
        }
      },
    ];

    const createdTestimonials: Testimonial[] = [];

    // Crear cada testimonio con sus relaciones usando una transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const config of testimonialsConfig) {
        // 1. Crear el testimonio base
        const testimonial = this.testimonialRepository.create(config.testimonial);
        
        // 2. Crear multimedia si existe
        if (config.multimedia) {
          const multimedia = this.multimediaRepository.create(config.multimedia);
          await queryRunner.manager.save(Multimedia, multimedia);
          testimonial.multimedia = multimedia;
        }

        // 3. Crear engagement si existe
        if (config.engagement) {
          const engagement = this.engagementRepository.create(config.engagement);
          await queryRunner.manager.save(EngagementMetric, engagement);
          testimonial.engagement = engagement;
        }

        // 4. Guardar el testimonio completo
        await queryRunner.manager.save(Testimonial, testimonial);
        createdTestimonials.push(testimonial);

        this.logger.log(`✅ Testimonio creado: "${testimonial.titulo}" - Status: ${testimonial.status} - Multimedia: ${testimonial.multimedia ? 'Sí' : 'No'}`);
      }

      await queryRunner.commitTransaction();
      this.logger.log('🎉 Todos los testimonios creados exitosamente');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Error en transacción:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    return createdTestimonials;
  }

  private async verifySeedResults() {
    this.logger.log('\n📊 VERIFICANDO RESULTADOS DEL SEEDING...');
    
    try {
      // Contar total de testimonios
      const totalTestimonials = await this.testimonialRepository.count();
      this.logger.log(`✅ Total testimonios: ${totalTestimonials}`);
      
      // Contar testimonios por status
      const statusCounts = await this.testimonialRepository
        .createQueryBuilder('testimonio')
        .select('testimonio.status, COUNT(*) as count')
        .groupBy('testimonio.status')
        .getRawMany();
      
      statusCounts.forEach(({ status, count }) => {
        this.logger.log(`   ${status}: ${count}`);
      });
      
      // Contar testimonios con multimedia
      const testimonialsWithMultimedia = await this.testimonialRepository
        .createQueryBuilder('t')
        .innerJoin('t.multimedia', 'm')
        .getCount();
      this.logger.log(`✅ Testimonios con multimedia: ${testimonialsWithMultimedia}`);
      
      // Contar testimonios con engagement
      const testimonialsWithEngagement = await this.testimonialRepository
        .createQueryBuilder('t')
        .innerJoin('t.engagement', 'e')
        .getCount();
      this.logger.log(`✅ Testimonios con engagement: ${testimonialsWithEngagement}`);
      
      // Mostrar detalles del testimonio específico que mencionaste
      const specificTestimonial = await this.testimonialRepository.findOne({
        where: { titulo: 'Probando funcionalidades avanzadas' },
        relations: ['multimedia', 'engagement', 'category', 'tags'],
      });
      
      if (specificTestimonial) {
        this.logger.log(`\n🎯 TESTIMONIO ESPECÍFICO (ID: ${specificTestimonial.id}):`);
        this.logger.log(`   Título: ${specificTestimonial.titulo}`);
        this.logger.log(`   Status: ${specificTestimonial.status}`);
        this.logger.log(`   Autor: ${specificTestimonial.autorNombre}`);
        this.logger.log(`   Tiene multimedia: ${!!specificTestimonial.multimedia}`);
        if (specificTestimonial.multimedia) {
          this.logger.log(`   Multimedia tipo: ${specificTestimonial.multimedia.tipo}`);
          this.logger.log(`   Multimedia URL: ${specificTestimonial.multimedia.url}`);
        }
        this.logger.log(`   Tiene engagement: ${!!specificTestimonial.engagement}`);
        if (specificTestimonial.engagement) {
          this.logger.log(`   Views: ${specificTestimonial.engagement.views}`);
          this.logger.log(`   Embeds: ${specificTestimonial.engagement.embeds}`);
        }
      }
      
    } catch (error) {
      this.logger.error('❌ Error verificando resultados:', error);
    }
  }
}