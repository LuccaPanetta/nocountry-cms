import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  ManyToMany, 
  JoinColumn, 
  JoinTable 
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';

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

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

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


  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}