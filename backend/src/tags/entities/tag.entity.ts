// src/tags/entities/tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string; 
  
  @CreateDateColumn()
  creadoEn: Date;

@ManyToMany(() => Testimonial, (testimonial) => testimonial.tags)
testimonials: Testimonial[];

}