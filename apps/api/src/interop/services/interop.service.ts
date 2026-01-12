import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { InteropAudit } from '../entities/interop-audit.entity';
import { InteropCache } from '../entities/interop-cache.entity';
import { DispatchInteropDto } from '../dto/dispatch-interop.dto';
import { InteropResponseDto } from '../dto/interop-response.dto';
import { InteropStatusEnum } from '../enums/interop-status.enum';
import { PayloadTypeEnum } from '../enums/payload-type.enum';

import { FhirAdapter } from '../adapters/fhir.adapter';
import { Hl7Adapter } from '../adapters/hl7.adapter';
import { CdaAdapter } from '../adapters/cda.adapter';
import { RestAdapter } from '../adapters/rest.adapter';
import { SoapAdapter } from '../adapters/soap.adapter';
import { IInteropAdapter } from '../interfaces/adapter.interface';

@Injectable()
export class InteropService {
  private readonly logger = new Logger(InteropService.name);
  private readonly adapters: Map<PayloadTypeEnum, IInteropAdapter> = new Map();
  private readonly CACHE_TTL_MINUTES = 60; // 1 hora de TTL

  constructor(
    @InjectRepository(InteropAudit)
    private readonly auditRepository: Repository<InteropAudit>,

    @InjectRepository(InteropCache)
    private readonly cacheRepository: Repository<InteropCache>,

    private readonly fhirAdapter: FhirAdapter,
    private readonly hl7Adapter: Hl7Adapter,
    private readonly cdaAdapter: CdaAdapter,
    private readonly restAdapter: RestAdapter,
    private readonly soapAdapter: SoapAdapter,
  ) {
    // Registrar todos los adaptadores en el mapa
    this.adapters.set(PayloadTypeEnum.FHIR, this.fhirAdapter);
    this.adapters.set(PayloadTypeEnum.HL7, this.hl7Adapter);
    this.adapters.set(PayloadTypeEnum.CDA, this.cdaAdapter);
    this.adapters.set(PayloadTypeEnum.REST, this.restAdapter);
    this.adapters.set(PayloadTypeEnum.SOAP, this.soapAdapter);
  }

  /**
   * Despachar información de interoperabilidad
   */
  async dispatch(
    dispatchDto: DispatchInteropDto,
    requestId: string,
    userId: string,
    clientIp?: string,
  ): Promise<InteropResponseDto> {
    const startTime = Date.now();
    const traceId = uuidv4();

    this.logger.log(
      `[DISPATCH] Starting - RequestId: ${requestId}, TraceId: ${traceId}, PayloadType: ${dispatchDto.payloadType}`,
    );

    try {
      // Verificar idempotencia
      const existingAudit = await this.checkIdempotency(requestId);
      if (existingAudit) {
        this.logger.warn(
          `[IDEMPOTENCY] Request already processed: ${requestId}`,
        );
        return this.buildResponseFromAudit(existingAudit);
      }

      // Verificar si existe en cache
      const cachedData = await this.getCachedData(
        dispatchDto.tipoDocumento,
        dispatchDto.numeroDocumento,
        dispatchDto.payloadType,
      );

      if (cachedData) {
        this.logger.log(`[CACHE HIT] Using cached data for ${requestId}`);

        // Incrementar contador de hits
        await this.incrementCacheHit(cachedData.id);

        const latencyMs = Date.now() - startTime;

        // Persistir auditoría de cache hit
        await this.saveAudit({
          requestId,
          traceId,
          userId,
          clientIp,
          dispatchDto,
          status: InteropStatusEnum.SENT,
          responsePayload: cachedData.cached_data,
          latencyMs,
          wasCached: true,
          wasValidated: true,
          targetEndpoint: 'CACHE',
        });

        return {
          requestId,
          status: InteropStatusEnum.SENT,
          traceId,
          errors: [],
          meta: {
            latencyMs,
            validated: true,
            cached: true,
            resultCount: 1,
          },
        };
      }

      // Obtener el adaptador correcto
      const adapter = this.getAdapter(dispatchDto.payloadType);

      // Validar datos con el adaptador
      const isValid = await adapter.validate(
        dispatchDto.tipoDocumento,
        dispatchDto.numeroDocumento,
      );

      if (!isValid) {
        throw new BadRequestException(
          `Validation failed for ${dispatchDto.payloadType}`,
        );
      }

      // Transformar datos al formato específico
      const transformedPayload = await adapter.transform(
        dispatchDto.tipoDocumento,
        dispatchDto.numeroDocumento,
      );

      //  Despachar a sistema externo
      const dispatchResult = await adapter.dispatch(transformedPayload);

      const latencyMs = Date.now() - startTime;

      //  DETERMINAR ESTADO
      const status = dispatchResult.success
        ? InteropStatusEnum.SENT
        : InteropStatusEnum.FAILED;

      //  PERSISTIR AUDITORÍA
      await this.saveAudit({
        requestId,
        traceId,
        userId,
        clientIp,
        dispatchDto,
        status,
        requestPayload: transformedPayload,
        responsePayload: dispatchResult.data,
        errors: dispatchResult.errors || [],
        latencyMs: dispatchResult.latencyMs,
        wasCached: false,
        wasValidated: isValid,
        targetEndpoint: dispatchResult.targetEndpoint,
      });

      //  GUARDAR EN CACHE (solo si fue exitoso)
      if (dispatchResult.success) {
        await this.saveCachedData(
          dispatchDto.tipoDocumento,
          dispatchDto.numeroDocumento,
          dispatchDto.payloadType,
          dispatchResult.data,
        );
      }

      //  CONSTRUIR RESPUESTA
      return {
        requestId,
        status,
        traceId,
        errors: dispatchResult.errors || [],
        meta: {
          latencyMs,
          validated: isValid,
          cached: false,
          resultCount: dispatchResult.success ? 1 : 0,
        },
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(
        `[DISPATCH ERROR] RequestId: ${requestId} - ${error.message}`,
        error.stack,
      );

      // Persistir auditoría de error
      await this.saveAudit({
        requestId,
        traceId,
        userId,
        clientIp,
        dispatchDto,
        status: InteropStatusEnum.FAILED,
        errors: [error.message],
        latencyMs,
        wasCached: false,
        wasValidated: false,
      });

      return {
        requestId,
        status: InteropStatusEnum.FAILED,
        traceId,
        errors: [error.message],
        meta: {
          latencyMs,
          validated: false,
          cached: false,
        },
      };
    }
  }

  /**
   * Verificar idempotencia: Si el requestId ya existe, retornar resultado previo
   */
  private async checkIdempotency(
    requestId: string,
  ): Promise<InteropAudit | null> {
    return await this.auditRepository.findOne({
      where: { request_id: requestId },
    });
  }

  /**
   * Obtener datos del cache
   */
  private async getCachedData(
    tipoDocumento: string,
    numeroDocumento: string,
    payloadType: PayloadTypeEnum,
  ): Promise<InteropCache | null> {
    const cached = await this.cacheRepository.findOne({
      where: {
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        payload_type: payloadType,
      },
    });

    // Verificar si el cache no ha expirado
    if (cached && new Date(cached.expires_at) > new Date()) {
      return cached;
    }

    // Si expiró, eliminarlo
    if (cached) {
      await this.cacheRepository.delete(cached.id);
    }

    return null;
  }

  /**
   * Incrementar contador de hits del cache
   */
  private async incrementCacheHit(cacheId: string): Promise<void> {
    await this.cacheRepository.increment({ id: cacheId }, 'hit_count', 1);
  }

  /**
   * Guardar datos en cache
   */
  private async saveCachedData(
    tipoDocumento: string,
    numeroDocumento: string,
    payloadType: PayloadTypeEnum,
    data: any,
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.CACHE_TTL_MINUTES);

      // Verificar si ya existe para actualizar
      const existing = await this.cacheRepository.findOne({
        where: {
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento,
          payload_type: payloadType,
        },
      });

      if (existing) {
        await this.cacheRepository.update(existing.id, {
          cached_data: data,
          expires_at: expiresAt,
        });
      } else {
        await this.cacheRepository.save({
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento,
          payload_type: payloadType,
          cached_data: data,
          expires_at: expiresAt,
          hit_count: 0,
        });
      }

      this.logger.log(
        `[CACHE SAVED] ${tipoDocumento}-${numeroDocumento}-${payloadType} until ${expiresAt}`,
      );
    } catch (error) {
      this.logger.error(`[CACHE SAVE ERROR] ${error.message}`);
      // No fallar la operación principal si el cache falla
    }
  }

  /**
   * Guardar auditoría
   */
  private async saveAudit(params: {
    requestId: string;
    traceId: string;
    userId: string;
    clientIp?: string;
    dispatchDto: DispatchInteropDto;
    status: InteropStatusEnum;
    requestPayload?: any;
    responsePayload?: any;
    errors?: string[];
    latencyMs: number;
    wasCached: boolean;
    wasValidated: boolean;
    targetEndpoint?: string;
  }): Promise<void> {
    try {
      await this.auditRepository.save({
        request_id: params.requestId,
        trace_id: params.traceId,
        userId: params.userId,
        tipo_documento: params.dispatchDto.tipoDocumento,
        numero_documento: params.dispatchDto.numeroDocumento,
        payload_type: params.dispatchDto.payloadType,
        channel: params.dispatchDto.channel,
        status: params.status,
        request_payload: params.requestPayload,
        response_payload: params.responsePayload,
        errors: params.errors || [],
        latency_ms: params.latencyMs,
        was_cached: params.wasCached,
        was_validated: params.wasValidated,
        target_endpoint: params.targetEndpoint,
        client_ip: params.clientIp,
      });

      this.logger.log(`[AUDIT SAVED] RequestId: ${params.requestId}`);
    } catch (error) {
      this.logger.error(`[AUDIT SAVE ERROR] ${error.message}`, error.stack);
      // No fallar la operación principal si la auditoría falla
    }
  }

  /**
   * Obtener adaptador según el tipo de payload
   */
  private getAdapter(payloadType: PayloadTypeEnum): IInteropAdapter {
    const adapter = this.adapters.get(payloadType);
    if (!adapter) {
      throw new BadRequestException(
        `No adapter found for payload type: ${payloadType}`,
      );
    }
    return adapter;
  }

  /**
   * Construir respuesta desde auditoría existente (idempotencia)
   */
  private buildResponseFromAudit(audit: InteropAudit): InteropResponseDto {
    return {
      requestId: audit.request_id,
      status: audit.status as InteropStatusEnum,
      traceId: audit.trace_id,
      errors: audit.errors || [],
      meta: {
        latencyMs: audit.latency_ms,
        validated: audit.was_validated,
        cached: audit.was_cached,
      },
    };
  }

  /**
   * Limpiar cache expirado (tarea de mantenimiento)
   */
  async cleanExpiredCache(): Promise<number> {
    const result = await this.cacheRepository.delete({
      expires_at: LessThan(new Date()),
    });

    const deletedCount = result.affected || 0;
    this.logger.log(`[CACHE CLEANUP] Removed ${deletedCount} expired entries`);
    return deletedCount;
  }

  /**
   * Obtener estadísticas de auditoría
   */
  async getAuditStats(userId?: string): Promise<any> {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (userId) {
      query.where('audit.userId = :userId', { userId });
    }

    const [totalRequests, successfulRequests, failedRequests, cachedRequests] =
      await Promise.all([
        query.getCount(),
        query
          .clone()
          .andWhere('audit.status = :status', {
            status: InteropStatusEnum.SENT,
          })
          .getCount(),
        query
          .clone()
          .andWhere('audit.status = :status', {
            status: InteropStatusEnum.FAILED,
          })
          .getCount(),
        query
          .clone()
          .andWhere('audit.was_cached = :cached', { cached: true })
          .getCount(),
      ]);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      cachedRequests,
      successRate:
        totalRequests > 0
          ? ((successfulRequests / totalRequests) * 100).toFixed(2)
          : 0,
      cacheHitRate:
        totalRequests > 0
          ? ((cachedRequests / totalRequests) * 100).toFixed(2)
          : 0,
    };
  }
}
