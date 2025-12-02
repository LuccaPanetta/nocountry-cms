// src/multimedia/entities/multimedia.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { MultimediaType } from '../enums/multimedia-type.enum';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';

@Entity('multimedias')
export class Multimedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion?: string;

  @Column({
    type: 'enum',
    enum: MultimediaType,
    default: MultimediaType.IMAGE,
  })
  tipo: MultimediaType;

  @Column({ nullable: true })
  publicId: string; // ID de Cloudinary

  // ✅ AGREGAR ESTE CAMPO:
  @Column({ 
    name: 'nombre_archivo', // Nombre de columna en la base de datos
    nullable: true 
  })
  nombreArchivo?: string; // Nombre original del archivo

  // ✅ RELACIÓN OneToOne (inversa)
  @OneToOne(() => Testimonial, testimonio => testimonio.multimedia, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'testimonio_id' })
  testimonio?: Testimonial;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}