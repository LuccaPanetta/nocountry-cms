// src/database/tags-categories.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class TagsCategoriesSeed {
  private readonly logger = new Logger(TagsCategoriesSeed.name);

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) { }

  async seed() {
    try {
      const [tagsTableExists, categoriesTableExists] = await Promise.all([
        this.checkIfTableExists('tags'),
        this.checkIfTableExists('categorias')
      ]);

      if (!tagsTableExists || !categoriesTableExists) {
        this.logger.warn('⚠️ Las tablas de tags o categorías no existen. Saltando seeding...');
        return;
      }

      this.logger.log('🌱 CREANDO TAGS Y CATEGORÍAS...');

      const [tags, categories] = await Promise.all([
        this.createTags(),
        this.createCategories(),
      ]);

      await this.tagRepository.save(tags);
      await this.categoryRepository.save(categories);

      this.logger.log(`✅ ${tags.length} tags y ${categories.length} categorías creados`);
    } catch (error) {
      this.logger.error('❌ Error durante el seeding de tags y categorías:', error);
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
      return false;
    }
  }

  private async createTags(): Promise<Tag[]> {
    const tagsData = [
      // Tecnología (10 tags)
      { name: 'tecnología', description: 'Testimonios relacionados con tecnología' },
      { name: 'software', description: 'Testimonios sobre software y aplicaciones' },
      { name: 'soporte-técnico', description: 'Testimonios sobre soporte técnico' },
      { name: 'ciberseguridad', description: 'Testimonios sobre seguridad informática' },
      { name: 'cloud-computing', description: 'Testimonios sobre servicios en la nube' },
      { name: 'inteligencia-artificial', description: 'Testimonios sobre IA y machine learning' },
      { name: 'automatización', description: 'Testimonios sobre procesos automatizados' },
      { name: 'mobile', description: 'Testimonios sobre aplicaciones móviles' },
      { name: 'web-development', description: 'Testimonios sobre desarrollo web' },
      { name: 'devops', description: 'Testimonios sobre prácticas DevOps' },
      
      // Negocios (8 tags)
      { name: 'empresa', description: 'Testimonios empresariales' },
      { name: 'startup', description: 'Testimonios de startups' },
      { name: 'pyme', description: 'Testimonios de pequeñas y medianas empresas' },
      { name: 'consultoría', description: 'Testimonios de servicios de consultoría' },
      { name: 'fintech', description: 'Testimonios del sector financiero tecnológico' },
      { name: 'b2b', description: 'Testimonios de negocios entre empresas' },
      { name: 'b2c', description: 'Testimonios de negocios con consumidores finales' },
      { name: 'saas', description: 'Testimonios sobre Software como Servicio' },
      
      // Experiencia de usuario (7 tags)
      { name: 'facilidad-uso', description: 'Testimonios sobre facilidad de uso' },
      { name: 'ui-ux', description: 'Testimonios sobre experiencia de usuario' },
      { name: 'satisfacción-cliente', description: 'Testimonios de satisfacción del cliente' },
      { name: 'onboarding', description: 'Testimonios sobre proceso de incorporación' },
      { name: 'soporte-24-7', description: 'Testimonios sobre soporte continuo' },
      { name: 'tiempo-respuesta', description: 'Testimonios sobre rapidez en respuestas' },
      { name: 'escalabilidad', description: 'Testimonios sobre capacidad de crecimiento' },
      
      // Recomendaciones y métricas (8 tags)
      { name: 'recomendación', description: 'Testimonios de recomendación' },
      { name: 'caso-éxito', description: 'Testimonios de casos de éxito' },
      { name: 'roi', description: 'Testimonios sobre retorno de inversión' },
      { name: 'ahorro-tiempo', description: 'Testimonios sobre ahorro de tiempo' },
      { name: 'reducción-costos', description: 'Testimonios sobre reducción de costos' },
      { name: 'productividad', description: 'Testimonios sobre aumento de productividad' },
      { name: 'innovación', description: 'Testimonios sobre innovación' },
      { name: 'transformación-digital', description: 'Testimonios sobre transformación digital' },
      
      // Especializados (6 tags)
      { name: 'ecommerce', description: 'Testimonios de comercio electrónico' },
      { name: 'marketing-digital', description: 'Testimonios de marketing digital' },
      { name: 'educación-online', description: 'Testimonios de educación en línea' },
      { name: 'salud-tecnológica', description: 'Testimonios de tecnología en salud' },
      { name: 'logística', description: 'Testimonios de soluciones logísticas' },
      { name: 'sostenibilidad', description: 'Testimonios sobre sostenibilidad y tecnología verde' },
      
      // Adicionales para llegar a 30+
      { name: 'integración', description: 'Testimonios sobre integración de sistemas' },
      { name: 'personalización', description: 'Testimonios sobre soluciones personalizadas' },
      { name: 'colaboración', description: 'Testimonios sobre herramientas de colaboración' },
      { name: 'analítica-datos', description: 'Testimonios sobre análisis de datos' },
      { name: 'migración', description: 'Testimonios sobre migración de sistemas' },
    ];

    const tags: Tag[] = [];
    for (const tagData of tagsData) {
      let tag = await this.tagRepository.findOne({
        where: { name: tagData.name }
      });

      if (!tag) {
        tag = this.tagRepository.create(tagData);
        await this.tagRepository.save(tag);
        this.logger.log(`✅ Tag creado: ${tagData.name}`);
      } else {
        this.logger.log(`✅ Tag ya existe: ${tagData.name}`);
      }

      tags.push(tag);
    }

    return tags;
  }

  private async createCategories(): Promise<Category[]> {
    const categoriesData: Partial<Category>[] = [
      { 
        name: 'producto', 
        description: 'Testimonios sobre productos específicos'
      },
      { 
        name: 'evento', 
        description: 'Testimonios de eventos y conferencias'
      },
      { 
        name: 'cliente', 
        description: 'Testimonios de experiencias de clientes'
      },
      { 
        name: 'industria', 
        description: 'Testimonios específicos por industria'
      }
    ];

    const categories: Category[] = [];
    for (const categoryData of categoriesData) {
      let category = await this.categoryRepository.findOne({
        where: { name: categoryData.name }
      });

      if (!category) {
        category = this.categoryRepository.create(categoryData);
        await this.categoryRepository.save(category);
        this.logger.log(`✅ Categoría creada: ${categoryData.name}`);
      }

      categories.push(category);
    }

    return categories;
  }
}