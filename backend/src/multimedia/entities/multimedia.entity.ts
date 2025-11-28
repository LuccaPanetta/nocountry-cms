import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';
import { MultimediaType } from '../enums/multimedia-type.enum';

@Entity('multimedias')
export class Multimedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'testimonio_id', type: 'uuid' })
  testimonioId: string;

  @ManyToOne(() => Testimonial, testimonial => testimonial.multimedias, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'testimonio_id' })
  testimonio: Testimonial;

  @Column({
    type: 'enum',
    enum: MultimediaType,
    default: MultimediaType.IMAGE
  })
  tipo: MultimediaType;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion: string;

  @Column({ name: 'public_id', type: 'varchar', nullable: true })
  publicId: string; // ID público de Cloudinary

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}