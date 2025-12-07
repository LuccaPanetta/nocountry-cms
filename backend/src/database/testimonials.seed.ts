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
  ) { }

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
    // Dentro del método createCompleteTestimonials, agrega fechas variadas:
const testimonialsConfig = [
  // Testimonio 1: Cambiar 'servicios' por 'producto'
  {
    testimonial: {
      titulo: 'Soporte técnico excepcional',
      contenido: 'Increíble servicio. El equipo de soporte fue muy profesional y resolvió todos mis problemas en tiempo récord. ¡Altamente recomendados!',
      autorNombre: 'Carlos Mendoza',
      empresa: 'TechCorp Solutions',
      cargo: 'Director de IT',
      status: TestimonialStatus.APPROVED,
      user: users[0],
      category: findCategory('producto'), // Cambiado de 'servicios' a 'producto'
      tags: findTags('servicio', 'soporte', 'recomendación'),
      creadoEn: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=gT0bDtIK20s',
      descripcion: 'Video testimonio de Carlos Mendoza sobre soporte técnico',
      nombreArchivo: 'testimonio-carlos-video.mp4',
      publicId: 'testimonios/carlos_mendoza_video'
    },
    engagement: {
      views: 250,
      embeds: 42
    }
  },
  // Testimonio 2: Cambiar 'tecnología' por 'producto'
  {
    testimonial: {
      titulo: 'Transformación digital completa',
      contenido: 'Llevo más de 2 años usando esta plataforma y ha transformado completamente mi negocio. La facilidad de uso y las funcionalidades son excepcionales.',
      autorNombre: 'Ana López',
      empresa: 'Digital Innovations',
      cargo: 'CEO',
      status: TestimonialStatus.APPROVED,
      user: users[1],
      category: findCategory('producto'), // Cambiado de 'tecnología' a 'producto'
      tags: findTags('tecnología', 'facilidad-uso', 'empresa', 'innovación'),
      creadoEn: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.IMAGE,
      url: 'https://juancarlosabaunza.com/wp-content/uploads/2018/11/transformacion-digital-empresas.jpg',
      descripcion: 'Ana López, CEO de Digital Innovations',
      nombreArchivo: 'ana-lopez-testimonio.jpg',
      publicId: 'testimonios/ana_lopez_image'
    },
    engagement: {
      views: 189,
      embeds: 31
    }
  },
  // Testimonio 3: Cambiar 'consultoría' por 'cliente'
  {
    testimonial: {
      titulo: 'ROI inmediato y excelente implementación',
      contenido: 'La mejor decisión que tomé para mi empresa. El ROI fue inmediato y el equipo de implementación fue excelente. ¡Gracias por todo!',
      autorNombre: 'Roberto Silva',
      empresa: 'Silva Construcciones',
      cargo: 'Gerente General',
      status: TestimonialStatus.APPROVED,
      user: users[2],
      category: findCategory('cliente'), // Cambiado de 'consultoría' a 'cliente'
      tags: findTags('empresa', 'innovación', 'recomendación'),
      creadoEn: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=EUUeewvlA00',
      descripcion: 'Video testimonio de Roberto Silva sobre implementación',
      nombreArchivo: 'testimonio-roberto-video.mp4',
      publicId: 'testimonios/roberto_silva_video'
    },
    engagement: {
      views: 312,
      embeds: 55
    }
  },
  // Testimonio 4: Cambiar 'tecnología' por 'producto'
  {
    testimonial: {
      titulo: 'Intuitiva y con soporte 24/7',
      contenido: 'Me encanta lo intuitiva que es la plataforma. En menos de una semana ya estaba operando con total normalidad. El soporte 24/7 es un plus increíble.',
      autorNombre: 'María González',
      empresa: 'Startup Ventures',
      cargo: 'Fundadora',
      status: TestimonialStatus.IN_REVIEW,
      user: users[3],
      category: findCategory('producto'), // Cambiado de 'tecnología' a 'producto'
      tags: findTags('facilidad-uso', 'soporte', 'tecnología'),
      creadoEn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
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
  // Testimonio 5: Cambiar 'tecnología' por 'producto'
  {
    testimonial: {
      titulo: 'Probando funcionalidades avanzadas',
      contenido: 'Actualmente estamos probando las funcionalidades avanzadas. Hasta ahora la experiencia es positiva y el equipo de ventas muy atento.',
      autorNombre: 'Miguel Ángel Ruiz',
      empresa: 'Ruiz Tech Solutions',
      cargo: 'CTO',
      status: TestimonialStatus.PENDING,
      user: users[4],
      category: findCategory('producto'), // Cambiado de 'tecnología' a 'producto'
      tags: findTags('tecnología', 'soporte', 'empresa'),
      creadoEn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=ydSmoueDYY4',
      descripcion: 'Miguel Ángel Ruiz probando funcionalidades avanzadas',
      nombreArchivo: 'miguel-ruiz-video-testimonio.mp4',
      publicId: 'testimonios/miguel_ruiz_video'
    },
    engagement: {
      views: 75,
      embeds: 12
    }
  },
  // Testimonio 6: Cambiar 'servicios' por 'producto'
  {
    testimonial: {
      titulo: 'Buena experiencia con pequeños ajustes',
      contenido: 'Buena experiencia en general, aunque tuve algunos problemas iniciales con la configuración. El soporte técnico me ayudó a resolverlos rápidamente.',
      autorNombre: 'José Ramírez',
      empresa: 'Ramírez Consultores',
      cargo: 'Freelancer',
      status: TestimonialStatus.APPROVED,
      user: users[5],
      category: findCategory('producto'), // Cambiado de 'servicios' a 'producto'
      tags: findTags('servicio', 'soporte', 'freelancer'),
      creadoEn: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 48,
      embeds: 7
    }
  },
  // Testimonio 7: Cambiar 'servicios' por 'cliente'
  {
    testimonial: {
      titulo: 'No cumplió expectativas',
      contenido: 'No cumplió con mis expectativas. El servicio fue regular y tuve varios inconvenientes que no fueron resueltos adecuadamente.',
      autorNombre: 'Usuario Anónimo',
      status: TestimonialStatus.REJECTED,
      user: users[6],
      category: findCategory('cliente'), // Cambiado de 'servicios' a 'cliente'
      tags: findTags('servicio'),
      creadoEn: new Date(Date.now() - 550 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 15,
      embeds: 2
    }
  },
  // Testimonio 8: Ya es 'producto' ✓
  {
    testimonial: {
      titulo: 'Solución ERP que revoluciona la administración',
      contenido: 'Nuestro sistema ERP anterior era obsoleto y lento. Esta solución nos ha permitido automatizar el 80% de los procesos administrativos, reduciendo errores y ahorrando tiempo valioso.',
      autorNombre: 'Fernando Rojas',
      empresa: 'Manufacturas Rojas S.A.',
      cargo: 'Gerente de Operaciones',
      status: TestimonialStatus.APPROVED,
      user: users[7],
      category: findCategory('producto'),
      tags: findTags('software', 'automatización', 'ahorro-tiempo', 'empresa'),
      creadoEn: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=OeFeok-vBbk',
      descripcion: 'Demo del sistema ERP en funcionamiento',
      nombreArchivo: 'producto-erp-solution.mp4',
      publicId: 'testimonios/producto_erp_solution'
    },
    engagement: {
      views: 420,
      embeds: 58
    }
  },
  // Testimonio 9: Ya es 'producto' ✓
  {
    testimonial: {
      titulo: 'Plataforma de marketing todo en uno',
      contenido: 'Como agencia de marketing, necesitábamos una herramienta que integrara todas nuestras necesidades. Esta plataforma combina email marketing, automatización y análisis en una sola interfaz.',
      autorNombre: 'Carolina Montes',
      empresa: 'Agencia Creativa Plus',
      cargo: 'Directora de Marketing',
      status: TestimonialStatus.IN_REVIEW,
      user: users[8],
      category: findCategory('producto'),
      tags: findTags('marketing-digital', 'saas', 'integración', 'analítica-datos'),
      creadoEn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.IMAGE,
      url: 'https://juancarlosabaunza.com/wp-content/uploads/2018/11/transformacion-digital-empresas.jpg',
      descripcion: 'Dashboard de la plataforma de marketing',
      nombreArchivo: 'producto-marketing-platform.jpg',
      publicId: 'testimonios/producto_marketing_platform'
    },
    engagement: {
      views: 195,
      embeds: 27
    }
  },
  // Testimonio 10: Ya es 'producto' ✓
  {
    testimonial: {
      titulo: 'Software de diseño intuitivo para no diseñadores',
      contenido: 'No tengo formación en diseño, pero con esta herramienta puedo crear gráficos profesionales para mis redes sociales. Las plantillas y la interfaz son extremadamente amigables.',
      autorNombre: 'Lucía Fernández',
      empresa: 'Emprendedora Digital',
      cargo: 'Content Creator',
      status: TestimonialStatus.APPROVED,
      user: users[0],
      category: findCategory('producto'),
      tags: findTags('software', 'facilidad-uso', 'diseño', 'creatividad'),
      creadoEn: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 310,
      embeds: 42
    }
  },
  // Testimonio 11: Ya es 'producto' ✓
  {
    testimonial: {
      titulo: 'Sistema de reservas que multiplicó nuestras ventas',
      contenido: 'Desde que implementamos este sistema de reservas online, nuestras ventas han aumentado un 65%. La integración con nuestro calendario y el pago online son impecables.',
      autorNombre: 'Diego Castro',
      empresa: 'Restaurante La Tradición',
      cargo: 'Gerente',
      status: TestimonialStatus.APPROVED,
      user: users[1],
      category: findCategory('producto'),
      tags: findTags('ecommerce', 'software', 'ventas', 'integración'),
      creadoEn: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=HhIi8x-7g8g',
      descripcion: 'Sistema de reservas en acción',
      nombreArchivo: 'producto-booking-system.mp4',
      publicId: 'testimonios/producto_booking_system'
    },
    engagement: {
      views: 280,
      embeds: 36
    }
  },
  // Testimonio 12: Ya es 'producto' ✓
  {
    testimonial: {
      titulo: 'Herramienta de colaboración remota indispensable',
      contenido: 'Con nuestro equipo trabajando desde 5 países diferentes, esta herramienta de colaboración ha sido fundamental. Las videollamadas de alta calidad y el tablero compartido son excelentes.',
      autorNombre: 'Martín Gómez',
      empresa: 'Global Remote Team',
      cargo: 'Team Lead',
      status: TestimonialStatus.PENDING,
      user: users[2],
      category: findCategory('producto'),
      tags: findTags('colaboración', 'software', 'remoto', 'productividad'),
      creadoEn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.IMAGE,
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      descripcion: 'Equipo colaborando remotamente',
      nombreArchivo: 'producto-collaboration-tool.jpg',
      publicId: 'testimonios/producto_collaboration_tool'
    },
    engagement: {
      views: 165,
      embeds: 23
    }
  },
  // Testimonio 13: Ya es 'evento' ✓
  {
    testimonial: {
      titulo: 'Summit de Innovación Tecnológica 2024',
      contenido: 'El evento más inspirador del año. Las charlas sobre IA y blockchain fueron especialmente reveladoras. El networking con otros profesionales fue invaluable para nuestro crecimiento.',
      autorNombre: 'André Santos',
      empresa: 'TechVision Consulting',
      cargo: 'Consultor Senior',
      status: TestimonialStatus.APPROVED,
      user: users[3],
      category: findCategory('evento'),
      tags: findTags('innovación', 'tecnología', 'networking', 'aprendizaje'),
      creadoEn: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=VYOjWnS4cMY',
      descripcion: 'Resumen del Summit de Innovación',
      nombreArchivo: 'evento-innovation-summit.mp4',
      publicId: 'testimonios/evento_innovation_summit'
    },
    engagement: {
      views: 520,
      embeds: 68
    }
  },
  // Testimonio 14: Ya es 'evento' ✓
  {
    testimonial: {
      titulo: 'Workshop de Desarrollo Ágil',
      contenido: 'Como desarrollador con 10 años de experiencia, aprendí técnicas nuevas que ya estoy aplicando en mi equipo. Los ejercicios prácticos fueron especialmente útiles.',
      autorNombre: 'Pablo Navarro',
      empresa: 'Dev Solutions Inc.',
      cargo: 'Senior Developer',
      status: TestimonialStatus.APPROVED,
      user: users[4],
      category: findCategory('evento'),
      tags: findTags('web-development', 'devops', 'workshop', 'aprendizaje'),
      creadoEn: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 240,
      embeds: 31
    }
  },
  // Testimonio 15: Ya es 'evento' ✓
  {
    testimonial: {
      titulo: 'Conferencia de Sostenibilidad Digital',
      contenido: 'Evento eye-opening sobre cómo la tecnología puede ser más sostenible. Las soluciones presentadas para reducir la huella de carbono digital fueron innovadoras y prácticas.',
      autorNombre: 'Valeria Romero',
      empresa: 'EcoTech Solutions',
      cargo: 'Directora de Sostenibilidad',
      status: TestimonialStatus.IN_REVIEW,
      user: users[5],
      category: findCategory('evento'),
      tags: findTags('sostenibilidad', 'innovación', 'conferencia', 'tecnología'),
      creadoEn: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.IMAGE,
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      descripcion: 'Panel sobre sostenibilidad digital',
      nombreArchivo: 'evento-sostenibilidad.jpg',
      publicId: 'testimonios/evento_sostenibilidad'
    },
    engagement: {
      views: 180,
      embeds: 25
    }
  },
  // Testimonio 16: Ya es 'evento' ✓
  {
    testimonial: {
      titulo: 'Meetup de Emprendedores Tech',
      contenido: 'Espacio perfecto para conectar con otros emprendedores. Compartir experiencias y desafíos con personas que están en la misma etapa fue increíblemente valioso.',
      autorNombre: 'Santiago López',
      empresa: 'Startup Fintech',
      cargo: 'Fundador',
      status: TestimonialStatus.PENDING,
      user: users[6],
      category: findCategory('evento'),
      tags: findTags('startup', 'emprendimiento', 'meetup', 'networking'),
      creadoEn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 110,
      embeds: 16
    }
  },
  // Testimonio 17: Ya es 'evento' ✓
  {
    testimonial: {
      titulo: 'Expo de Soluciones Cloud 2024',
      contenido: 'La exposición más completa sobre soluciones en la nube que he visto. Pude comparar diferentes proveedores y ver demostraciones en vivo de las últimas tecnologías.',
      autorNombre: 'Renata Vargas',
      empresa: 'Cloud Advisors Group',
      cargo: 'Cloud Architect',
      status: TestimonialStatus.APPROVED,
      user: users[7],
      category: findCategory('evento'),
      tags: findTags('cloud-computing', 'expo', 'tecnología', 'soluciones'),
      creadoEn: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=mgiIqFZpZVg',
      descripcion: 'Recorrido por la Expo Cloud 2024',
      nombreArchivo: 'evento-cloud-expo.mp4',
      publicId: 'testimonios/evento_cloud_expo'
    },
    engagement: {
      views: 390,
      embeds: 49
    }
  },
  // Testimonio 18: Ya es 'cliente' ✓
  {
    testimonial: {
      titulo: 'Cliente desde el día uno',
      contenido: 'Soy cliente desde el lanzamiento y he visto cómo la plataforma ha evolucionado. Cada actualización trae mejoras significativas y el equipo siempre escucha el feedback.',
      autorNombre: 'Roberto Jiménez',
      empresa: 'Consultoría Digital RJ',
      cargo: 'Consultor Principal',
      status: TestimonialStatus.APPROVED,
      user: users[8],
      category: findCategory('cliente'),
      tags: findTags('fidelidad', 'evolución', 'feedback', 'servicio'),
      creadoEn: new Date(Date.now() - 440 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.IMAGE,
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      descripcion: 'Roberto Jiménez, cliente desde el inicio',
      nombreArchivo: 'cliente-desde-inicio.jpg',
      publicId: 'testimonios/cliente_desde_inicio'
    },
    engagement: {
      views: 275,
      embeds: 37
    }
  },
  // Testimonio 19: Ya es 'cliente' ✓
  {
    testimonial: {
      titulo: 'Solución a medida para necesidades específicas',
      contenido: 'Tenemos requerimientos muy específicos en nuestra industria. El equipo desarrolló una solución personalizada que se adapta perfectamente a nuestros procesos únicos.',
      autorNombre: 'Dra. Isabel Morales',
      empresa: 'Clínica Especializada',
      cargo: 'Directora Médica',
      status: TestimonialStatus.APPROVED,
      user: users[0],
      category: findCategory('cliente'),
      tags: findTags('personalización', 'servicio', 'salud-tecnológica', 'solución'),
      creadoEn: new Date(Date.now() - 980 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 320,
      embeds: 43
    }
  },
  // Testimonio 20: Ya es 'cliente' ✓
  {
    testimonial: {
      titulo: 'Migración sin dolor de cabeza',
      contenido: 'Migrar nuestros datos desde el sistema antiguo fue mi mayor preocupación. El equipo gestionó todo el proceso de forma impecable, sin interrupciones en nuestras operaciones.',
      autorNombre: 'Fernando Ortiz',
      empresa: 'Distribuidora Ortiz Hnos.',
      cargo: 'Gerente de Sistemas',
      status: TestimonialStatus.IN_REVIEW,
      user: users[1],
      category: findCategory('cliente'),
      tags: findTags('migración', 'soporte-técnico', 'implementación', 'servicio'),
      creadoEn: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=EUUeewvlA00',
      descripcion: 'Proceso de migración exitoso',
      nombreArchivo: 'cliente-migracion.mp4',
      publicId: 'testimonios/cliente_migracion'
    },
    engagement: {
      views: 205,
      embeds: 29
    }
  },
  // Testimonio 21: Ya es 'cliente' ✓
  {
    testimonial: {
      titulo: 'Respuesta en menos de 5 minutos',
      contenido: 'Tuve una emergencia a medianoche y pensé que tendría que esperar hasta la mañana. Para mi sorpresa, el soporte respondió en 4 minutos y resolvió el problema en 15.',
      autorNombre: 'Claudia Ríos',
      empresa: 'E-commerce 24/7',
      cargo: 'Operaciones Nocturnas',
      status: TestimonialStatus.APPROVED,
      user: users[2],
      category: findCategory('cliente'),
      tags: findTags('soporte-24-7', 'tiempo-respuesta', 'emergencia', 'excelencia'),
      creadoEn: new Date(Date.now() - 330 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 290,
      embeds: 39
    }
  },
  // Testimonio 22: Ya es 'cliente' ✓
  {
    testimonial: {
      titulo: 'Recomiendo sin dudarlo',
      contenido: 'He recomendado estos servicios a tres colegas y todos están igualmente satisfechos. Cuando un producto es bueno, se comparte naturalmente.',
      autorNombre: 'Ricardo Mendez',
      empresa: 'Estudio Contable Mendez',
      cargo: 'Contador Público',
      status: TestimonialStatus.PENDING,
      user: users[3],
      category: findCategory('cliente'),
      tags: findTags('recomendación', 'satisfacción-cliente', 'referidos', 'servicio'),
      creadoEn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.IMAGE,
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      descripcion: 'Cliente satisfecho recomendando el servicio',
      nombreArchivo: 'cliente-recomendacion.jpg',
      publicId: 'testimonios/cliente_recomendacion'
    },
    engagement: {
      views: 135,
      embeds: 19
    }
  },
  // Testimonio 23: Ya es 'industria' ✓
  {
    testimonial: {
      titulo: 'Revolución en la industria retail',
      contenido: 'En el retail, la competencia es feroz. Esta plataforma nos ha dado ventajas competitivas significativas, especialmente en análisis de inventario y predicción de demanda.',
      autorNombre: 'Laura Santana',
      empresa: 'Cadena de Tiendas Éxito',
      cargo: 'Directora de Tecnología',
      status: TestimonialStatus.APPROVED,
      user: users[4],
      category: findCategory('industria'),
      tags: findTags('retail', 'analítica-datos', 'ventaja-competitiva', 'innovación'),
      creadoEn: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=3ubpt4Wo2h0',
      descripcion: 'Solución retail en acción',
      nombreArchivo: 'industria-retail-solution.mp4',
      publicId: 'testimonios/industria_retail_solution'
    },
    engagement: {
      views: 380,
      embeds: 50
    }
  },
  // Testimonio 24: Ya es 'industria' ✓
  {
    testimonial: {
      titulo: 'Manufactura 4.0 hecha realidad',
      contenido: 'En nuestra planta manufacturera, la implementación de IoT y analítica predictiva ha reducido el tiempo de inactividad en un 40% y aumentado la calidad del producto.',
      autorNombre: 'Carlos Herrera',
      empresa: 'Manufactura Avanzada S.A.',
      cargo: 'Director de Producción',
      status: TestimonialStatus.APPROVED,
      user: users[5],
      category: findCategory('industria'),
      tags: findTags('manufactura', 'iot', 'automatización', 'calidad'),
      creadoEn: new Date(Date.now() - 840 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 265,
      embeds: 35
    }
  },
  // Testimonio 25: Ya es 'industria' ✓
  {
    testimonial: {
      titulo: 'Transformación en servicios financieros',
      contenido: 'En el sector financiero, la seguridad y cumplimiento son críticos. Esta solución no solo cumple con todas las regulaciones, sino que mejora la experiencia del cliente.',
      autorNombre: 'Sergio Ramírez',
      empresa: 'Banca Digital Segura',
      cargo: 'Director de Cumplimiento',
      status: TestimonialStatus.IN_REVIEW,
      user: users[6],
      category: findCategory('industria'),
      tags: findTags('fintech', 'ciberseguridad', 'regulación', 'experiencia-cliente'),
      creadoEn: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.IMAGE,
      url: 'https://juancarlosabaunza.com/wp-content/uploads/2018/11/transformacion-digital-empresas.jpg',
      descripcion: 'Transformación digital en banca',
      nombreArchivo: 'industria-banca-digital.jpg',
      publicId: 'testimonios/industria_banca_digital'
    },
    engagement: {
      views: 220,
      embeds: 30
    }
  },
  // Testimonio 26: Ya es 'industria' ✓
  {
    testimonial: {
      titulo: 'Agricultura de precisión con tecnología',
      contenido: 'En el sector agrícola, cada gota de agua cuenta. El sistema de monitoreo inteligente ha optimizado nuestro riego, reduciendo el consumo de agua en un 35% mientras aumenta el rendimiento.',
      autorNombre: 'Juan Pérez',
      empresa: 'AgroTech Solutions',
      cargo: 'Ingeniero Agrónomo',
      status: TestimonialStatus.PENDING,
      user: users[7],
      category: findCategory('industria'),
      tags: findTags('agricultura', 'iot', 'sostenibilidad', 'optimización'),
      creadoEn: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    multimedia: {
      tipo: MultimediaType.VIDEO,
      url: 'https://www.youtube.com/watch?v=kTY8xCziABo',
      descripcion: 'Tecnología en agricultura de precisión',
      nombreArchivo: 'industria-agricultura.mp4',
      publicId: 'testimonios/industria_agricultura'
    },
    engagement: {
      views: 175,
      embeds: 24
    }
  },
  // Testimonio 27: Ya es 'industria' ✓
  {
    testimonial: {
      titulo: 'Turismo inteligente post-pandemia',
      contenido: 'El sector turístico se ha reinventado. Nuestra plataforma de gestión turística ha permitido a operadores locales competir globalmente, ofreciendo experiencias personalizadas.',
      autorNombre: 'Marcela Torres',
      empresa: 'Turismo Inteligente S.A.',
      cargo: 'Directora de Innovación',
      status: TestimonialStatus.APPROVED,
      user: users[8],
      category: findCategory('industria'),
      tags: findTags('turismo', 'personalización', 'global', 'innovación'),
      creadoEn: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000),
    },
    engagement: {
      views: 310,
      embeds: 41
    }
  }
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