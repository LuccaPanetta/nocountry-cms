// database/seeds/tags-categories.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async seed() {
    try {
      this.logger.log('🌱 Iniciando seeding de tags y categorías...');

      const [tags, categories] = await Promise.all([
        this.createTags(),
        this.createCategories(),
      ]);

      await this.tagRepository.save(tags);
      await this.categoryRepository.save(categories);

      this.logger.log(`✅ Tags y categorías creados: ${tags.length} tags, ${categories.length} categorías`);
    } catch (error) {
      this.logger.error('❌ Error durante el seeding de tags y categorías:', error);
      throw error;
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