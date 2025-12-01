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
  videoUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    default: TestimonialStatus.PENDING,
  })
  status: TestimonialStatus; 

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' }) // ← Nombre real en la base de datos
  category: Category;

  @ManyToMany(() => Tag, { cascade: true, eager: true }) 
  @JoinTable({
    name: 'testimonial_tags', 
    joinColumn: {
      name: 'testimonial_id', 
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id', 
      referencedColumnName: 'id',
    },
  })
  tags: Tag[]; 

  @OneToMany(() => Multimedia, multimedia => multimedia.testimonio, { 
    cascade: true,
    onDelete: 'CASCADE'
  })
  multimedias: Multimedia[];

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'user_id' }) // ← Nombre real en la base de datos
  user?: User;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  getImagenPrincipal(): Multimedia | undefined {
    return this.multimedias?.find(m => m.tipo === MultimediaType.IMAGE);
  }

  getVideos(): Multimedia[] {
    return this.multimedias?.filter(m => m.tipo === MultimediaType.VIDEO) || [];
  }

  getImagenes(): Multimedia[] {
    return this.multimedias?.filter(m => m.tipo === MultimediaType.IMAGE) || [];
  }

  getVideoUrl(): string | null {
    const video = this.multimedias?.find(m => m.tipo === MultimediaType.VIDEO);
    return video ? video.url : this.videoUrl;
  }

  getImageUrl(): string | null {
    const image = this.multimedias?.find(m => m.tipo === MultimediaType.IMAGE);
    return image ? image.url : this.imageUrl;
  }
}