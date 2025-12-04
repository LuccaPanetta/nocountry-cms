import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from '../interfaces/user-role.enum';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  nombre: string;

  @Column({ type: 'varchar', length: 80 })
  apellido: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONTRIBUTOR, // porque visitante NO se registra
  })
  rol: UserRole;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
