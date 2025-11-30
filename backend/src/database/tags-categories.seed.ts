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
  ) {}

  async seed() {
    try {
      // ✅ VERIFICAR SI LAS TABLAS EXISTEN
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
    const tagsData: Partial<Tag>[] = [
      { name: 'tecnología', description: 'Testimonios relacionados con tecnología' },
      { name: 'servicio', description: 'Testimonios sobre calidad de servicio' },
      { name: 'soporte', description: 'Testimonios sobre soporte técnico' },
      { name: 'facilidad-uso', description: 'Testimonios sobre facilidad de uso' },
      { name: 'recomendación', description: 'Testimonios de recomendación' },
      { name: 'empresa', description: 'Testimonios empresariales' },
      { name: 'freelancer', description: 'Testimonios de freelancers' },
      { name: 'innovación', description: 'Testimonios sobre innovación' },
    ];

    return this.tagRepository.create(tagsData);
  }

  private async createCategories(): Promise<Category[]> {
    const categoriesData: Partial<Category>[] = [
      { name: 'tecnología', description: 'Testimonios de tecnología' },
      { name: 'servicios', description: 'Testimonios de servicios' },
      { name: 'productos', description: 'Testimonios de productos' },
      { name: 'consultoría', description: 'Testimonios de consultoría' },
      { name: 'educación', description: 'Testimonios educativos' },
    ];

    return this.categoryRepository.create(categoriesData);
  }
}