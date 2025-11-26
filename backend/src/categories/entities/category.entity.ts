import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('categorias')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; 

  @Column({ type: 'text', nullable: true })
  description: string; 
  
  @CreateDateColumn()
  creadoEn: Date;
}
