import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToOne, 
  JoinColumn,
  UpdateDateColumn
} from 'typeorm';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';

@Entity('engagement_metrics')
export class EngagementMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Testimonial, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'testimonialId' }) 
  testimonial: Testimonial;

  @Column({ default: 0 })
  views: number; 

  @Column({ default: 0 })
  embeds: number; 

  @UpdateDateColumn()
  ultimaActualizacion: Date;
}
