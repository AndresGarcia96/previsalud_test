import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from 'role/entities/role.entity';

import { IdentificationTypeEnum } from 'utils/enums/id_type/identification_type.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  last_name: string;

  @Column({
    type: 'enum',
    enum: IdentificationTypeEnum,
  })
  id_type: IdentificationTypeEnum;

  @Column({ type: 'text', unique: true })
  id_number: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ type: 'bigint', nullable: true })
  cellphone: number;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  verification_code: number;

  @ManyToMany(() => Role, {
    eager: true,
    cascade: true,
  })
  @JoinTable({ name: 'User_Roles' })
  role: Role[];

  @Column({ nullable: true })
  residence_department: string;

  @Column({ nullable: true })
  residence_city: string;

  @Column({ nullable: true })
  residence_address: string;

  @Column({ nullable: true })
  residence_neighborhood: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
