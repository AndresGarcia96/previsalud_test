import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'user/entities/user.entity';
import { PayloadTypeEnum } from '../enums/payload-type.enum';
import { ChannelEnum } from '../enums/channel.enum';
import { InteropStatusEnum } from '../enums/interop-status.enum';

@Entity('interop_audit')
export class InteropAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Trazabilidad: Request ID e IDs de seguimiento
  @Column({ type: 'uuid', unique: true })
  request_id: string;

  @Column({ type: 'uuid' })
  trace_id: string;

  // Usuario que realizó la operación
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  // Datos del documento/paciente
  @Column({ type: 'text' })
  tipo_documento: string;

  @Column({ type: 'text' })
  numero_documento: string;

  // Tipo de payload y canal
  @Column({
    type: 'enum',
    enum: PayloadTypeEnum,
  })
  payload_type: PayloadTypeEnum;

  @Column({
    type: 'enum',
    enum: ChannelEnum,
  })
  channel: ChannelEnum;

  // Estado de la operación
  @Column({
    type: 'enum',
    enum: InteropStatusEnum,
  })
  status: InteropStatusEnum;

  // Payload enviado (JSON)
  @Column({ type: 'jsonb', nullable: true })
  request_payload: any;

  // Respuesta recibida (JSON)
  @Column({ type: 'jsonb', nullable: true })
  response_payload: any;

  // Errores (si aplica)
  @Column({ type: 'jsonb', nullable: true })
  errors: any[];

  // Metadatos de rendimiento
  @Column({ type: 'int', nullable: true })
  latency_ms: number;

  @Column({ type: 'boolean', default: false })
  was_cached: boolean;

  @Column({ type: 'boolean', default: true })
  was_validated: boolean;

  // URL o endpoint destino
  @Column({ type: 'text', nullable: true })
  target_endpoint: string;

  // IP del cliente (opcional)
  @Column({ type: 'text', nullable: true })
  client_ip: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
