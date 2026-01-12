import { ApiProperty } from '@nestjs/swagger';
import { InteropStatusEnum } from '../enums/interop-status.enum';

export class InteropMetaDto {
  @ApiProperty({
    description: 'Latencia de la operación en milisegundos',
    example: 12,
  })
  latencyMs: number;

  @ApiProperty({
    description: 'Indica si los datos fueron validados correctamente',
    example: true,
  })
  validated: boolean;

  @ApiProperty({
    description: 'Indica si la respuesta fue obtenida desde caché',
    example: false,
  })
  cached: boolean;

  @ApiProperty({
    description: 'Número de resultados procesados (opcional)',
    example: 1,
    required: false,
  })
  resultCount?: number;
}

export class InteropResponseDto {
  @ApiProperty({
    description: 'ID único de la solicitud (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  requestId: string;

  @ApiProperty({
    description: 'Estado de la operación',
    enum: InteropStatusEnum,
    example: InteropStatusEnum.SENT,
  })
  status: InteropStatusEnum;

  @ApiProperty({
    description: 'ID de trazabilidad end-to-end (UUID)',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  traceId: string;

  @ApiProperty({
    description: 'Lista de errores (vacía si la operación fue exitosa)',
    type: [String],
    example: [],
  })
  errors: string[];

  @ApiProperty({
    description: 'Metadatos de la operación',
    type: InteropMetaDto,
  })
  meta: InteropMetaDto;
}
