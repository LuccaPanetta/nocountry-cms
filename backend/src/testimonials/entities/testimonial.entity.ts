// src/testimonials/entities/testimonial.entity.ts
import { User } from '../../users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToOne,
  JoinColumn,
  JoinTable
} from 'typeorm'; // Cambiado: OneToMany → OneToOne
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Multimedia } from '../../multimedia/entities/multimedia.entity';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

export enum TestimonialStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('testimonios')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  contenido: string;

  @Column({ nullable: true })
  autorNombre: string;

  @Column({ nullable: true })
  titulo: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  empresa: string;

  @Column({ nullable: true })
  cargo: string;
  
/*   @Column({ nullable: true })
  imageUrl: string; */

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    default: TestimonialStatus.PENDING,
  })
  status: TestimonialStatus;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.testimonials, {
    cascade: true,
  })
  @JoinTable({
    name: 'testimonial_tags',
    joinColumn: { name: 'testimonialId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags: Tag[];

  // ✅ CAMBIO: De OneToMany a OneToOne
  @OneToOne(() => Multimedia, multimedia => multimedia.testimonio, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true, // Un testimonio puede no tener multimedia
    eager: true, // Para cargar automáticamente
  })
  @JoinColumn({ name: 'multimedia_id' }) // Nueva columna en la tabla testimonios
  multimedia?: Multimedia;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  // ✅ ACTUALIZA los métodos helpers para usar la nueva relación OneToOne
  getImagenPrincipal(): Multimedia | undefined {
    return this.multimedia?.tipo === MultimediaType.IMAGE ? this.multimedia : undefined;
  }

  getVideos(): Multimedia[] {
    return this.multimedia?.tipo === MultimediaType.VIDEO ? [this.multimedia] : [];
  }

  getImagenes(): Multimedia[] {
    return this.multimedia?.tipo === MultimediaType.IMAGE ? [this.multimedia] : [];
  }

  getVideoUrl(): string | null {
    return this.multimedia?.tipo === MultimediaType.VIDEO ? this.multimedia.url : this.videoUrl;
  }

  /* getImageUrl(): string | null {
    return this.multimedia?.tipo === MultimediaType.IMAGE ? this.multimedia.url : this.imageUrl;
  } */
}