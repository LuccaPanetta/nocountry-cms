import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

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
  autorNombre: string; // Nombre del cliente 

  @Column({ nullable: true })
  videoUrl: string; // Link de video 

  @Column({ nullable: true })
  imageUrl: string; // Link de imagen 

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    default: TestimonialStatus.PENDING,
  })
  status: TestimonialStatus; // Estado de moderación

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

}
