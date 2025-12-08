import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToOne, 
  UpdateDateColumn
} from 'typeorm';
import { Testimonial } from '../../testimonials/entities/testimonial.entity';

@Entity('engagement_metrics')
export class EngagementMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Testimonial, (testimonial) => testimonial.engagement, { onDelete: 'CASCADE' })
  testimonial: Testimonial;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  embeds: number; 

  @UpdateDateColumn()
  ultimaActualizacion: Date;
}
