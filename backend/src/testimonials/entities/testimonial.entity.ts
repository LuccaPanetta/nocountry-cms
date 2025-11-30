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
  OneToMany, 
  JoinColumn, 
  JoinTable 
} from 'typeorm';
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
  videoUrl: string; // ✅ Mantener por compatibilidad

  @Column({ nullable: true })
  imageUrl: string; // ✅ Mantener por compatibilidad

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    default: TestimonialStatus.PENDING,
  })
  status: TestimonialStatus; 

  // Relación con categoría
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  // Relación ManyToMany con tags
  @ManyToMany(() => Tag, { cascade: true }) 
  @JoinTable({
    name: 'testimonial_tags', 
    joinColumn: {
      name: 'testimonialId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[]; 
  
  // Relación OneToMany con multimedia (nueva estructura)
  @OneToMany(() => Multimedia, multimedia => multimedia.testimonio, { 
    cascade: true,
    onDelete: 'CASCADE',
    eager: false
  })
  multimedias: Multimedia[];

  // Relación opcional con usuario (si el testimonio viene de un usuario registrado)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  // Métodos helpers para acceder a multimedia
  getImagenPrincipal(): Multimedia | undefined {
    return this.multimedias?.find(m => m.tipo === MultimediaType.IMAGE);
  }

  getVideos(): Multimedia[] {
    return this.multimedias?.filter(m => m.tipo === MultimediaType.VIDEO) || [];
  }

  getImagenes(): Multimedia[] {
    return this.multimedias?.filter(m => m.tipo === MultimediaType.IMAGE) || [];
  }

  // Método para compatibilidad con la estructura anterior
  getVideoUrl(): string | null {
    const video = this.multimedias?.find(m => m.tipo === MultimediaType.VIDEO);
    return video ? video.url : this.videoUrl;
  }

  // Método para compatibilidad con la estructura anterior
  getImageUrl(): string | null {
    const image = this.multimedias?.find(m => m.tipo === MultimediaType.IMAGE);
    return image ? image.url : this.imageUrl;
  }
}