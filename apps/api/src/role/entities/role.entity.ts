import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesEnum } from 'utils/enums/roles/roles.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: RolesEnum })
  name: RolesEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
