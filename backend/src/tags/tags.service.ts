import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const tag = this.tagRepository.create(createTagDto);
    return this.tagRepository.save(tag);
  }

  async findAll() {
    return this.tagRepository.find();
  }
  
  async findOne(id: string) {
    const tag = await this.tagRepository.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException(`Tag con ID ${id} no encontrado`);
    }
    return tag;
  }
  
  async update(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);
    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  async remove(id: string) {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
    return { message: 'Tag eliminado con éxito' };
  }
}
