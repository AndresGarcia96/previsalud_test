import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PayloadTypeEnum } from '../enums/payload-type.enum';

@Entity('interop_cache')
@Index(['tipo_documento', 'numero_documento', 'payload_type'], { unique: true })
export class InteropCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Clave del cache (combinación de documento + tipo payload)
  @Column({ type: 'text' })
  tipo_documento: string;

  @Column({ type: 'text' })
  numero_documento: string;

  @Column({
    type: 'enum',
    enum: PayloadTypeEnum,
  })
  payload_type: PayloadTypeEnum;

  // Datos cacheados
  @Column({ type: 'jsonb' })
  cached_data: any;

  // TTL (Time To Live)
  @Column({ type: 'timestamp' })
  expires_at: Date;

  // Número de veces que se ha usado este cache
  @Column({ type: 'int', default: 0 })
  hit_count: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
