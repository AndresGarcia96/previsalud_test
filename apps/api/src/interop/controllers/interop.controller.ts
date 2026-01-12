import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { InteropService } from '../services/interop.service';
import { DispatchInteropDto } from '../dto/dispatch-interop.dto';
import { InteropResponseDto } from '../dto/interop-response.dto';
import { Auth } from 'auth/decorators/auth.decorator';
import { RolesEnum } from 'utils/enums/roles/roles.enum';

@ApiTags('Interoperability')
@ApiBearerAuth()
@Controller('interop')
export class InteropController {
  constructor(private readonly interopService: InteropService) {}

  @Post('dispatch')
  @HttpCode(HttpStatus.OK)
  @Auth(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({
    summary: 'Despachar información de interoperabilidad',
    description:
      'Envía información clínica/administrativa hacia plataformas externas con soporte para múltiples formatos (FHIR, HL7, CDA, REST, SOAP). Incluye validación, trazabilidad, idempotencia y cache.',
  })
  @ApiHeader({
    name: 'X-Request-Id',
    description:
      'ID único de la solicitud (UUID). Si no se proporciona, se genera automáticamente. Garantiza idempotencia.',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Operación procesada exitosamente',
    type: InteropResponseDto,
    examples: {
      success: {
        summary: 'Envío exitoso',
        value: {
          requestId: '550e8400-e29b-41d4-a716-446655440000',
          status: 'SENT',
          traceId: '660e8400-e29b-41d4-a716-446655440001',
          errors: [],
          meta: {
            latencyMs: 45,
            validated: true,
            cached: false,
            resultCount: 1,
          },
        },
      },
      cached: {
        summary: 'Respuesta desde cache',
        value: {
          requestId: '550e8400-e29b-41d4-a716-446655440000',
          status: 'SENT',
          traceId: '660e8400-e29b-41d4-a716-446655440001',
          errors: [],
          meta: {
            latencyMs: 8,
            validated: true,
            cached: true,
            resultCount: 1,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida - Error de validación',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'El tipo de documento es requerido',
          'El tipo de payload debe ser uno de: FHIR, HL7, CDA, REST, SOAP',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
  })
  @ApiResponse({
    status: 422,
    description: 'Error de validación específica del adaptador',
    schema: {
      example: {
        requestId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'FAILED',
        traceId: '660e8400-e29b-41d4-a716-446655440001',
        errors: ['Validation failed for FHIR'],
        meta: {
          latencyMs: 12,
          validated: false,
          cached: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
    schema: {
      example: {
        requestId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'FAILED',
        traceId: '660e8400-e29b-41d4-a716-446655440001',
        errors: ['Internal server error'],
        meta: {
          latencyMs: 5,
          validated: false,
          cached: false,
        },
      },
    },
  })
  async dispatch(
    @Body() dispatchDto: DispatchInteropDto,
    @Headers('x-request-id') requestId: string,
    @Req() request: Request,
  ): Promise<InteropResponseDto> {
    // Generar requestId si no se proporciona
    const finalRequestId = requestId || uuidv4();

    // Obtener userId del token JWT (viene del decorador @Auth)
    const user = request['user'];
    const userId = user?.sub || user?.id;

    // Obtener IP del cliente
    const clientIp =
      (request.headers['x-forwarded-for'] as string) ||
      request.socket.remoteAddress;

    return await this.interopService.dispatch(
      dispatchDto,
      finalRequestId,
      userId,
      clientIp,
    );
  }

  @Get('stats')
  @Auth(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @ApiOperation({
    summary: 'Obtener estadísticas de interoperabilidad',
    description:
      'Retorna métricas globales de uso del módulo de interoperabilidad: total de requests, tasa de éxito, uso de cache, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        totalRequests: 1250,
        successfulRequests: 1187,
        failedRequests: 63,
        cachedRequests: 420,
        successRate: '94.96',
        cacheHitRate: '33.60',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Solo administradores',
  })
  async getStats(): Promise<any> {
    return await this.interopService.getAuditStats();
  }

  @Post('cache/clean')
  @HttpCode(HttpStatus.OK)
  @Auth(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @ApiOperation({
    summary: 'Limpiar cache expirado',
    description:
      'Elimina todas las entradas de cache que han superado su TTL (Time To Live).',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache limpiado exitosamente',
    schema: {
      example: {
        message: 'Cache limpiado exitosamente',
        deletedEntries: 42,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Solo administradores',
  })
  async cleanExpiredCache(): Promise<any> {
    const deletedCount = await this.interopService.cleanExpiredCache();
    return {
      message: 'Cache limpiado exitosamente',
      deletedEntries: deletedCount,
    };
  }
}
