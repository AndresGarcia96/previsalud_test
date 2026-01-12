import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { InteropService } from './interop.service';
import { InteropAudit } from '../entities/interop-audit.entity';
import { InteropCache } from '../entities/interop-cache.entity';
import { FhirAdapter } from '../adapters/fhir.adapter';
import { Hl7Adapter } from '../adapters/hl7.adapter';
import { CdaAdapter } from '../adapters/cda.adapter';
import { RestAdapter } from '../adapters/rest.adapter';
import { SoapAdapter } from '../adapters/soap.adapter';

import { DispatchInteropDto } from '../dto/dispatch-interop.dto';
import { PayloadTypeEnum } from '../enums/payload-type.enum';
import { ChannelEnum } from '../enums/channel.enum';
import { InteropStatusEnum } from '../enums/interop-status.enum';

describe('InteropService', () => {
  let service: InteropService;
  let auditRepository: Repository<InteropAudit>;
  let cacheRepository: Repository<InteropCache>;

  // Mocks de repositorios
  const mockAuditRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  };

  const mockCacheRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    delete: jest.fn(),
  };

  // Mocks de adaptadores
  const mockFhirAdapter = {
    payloadType: PayloadTypeEnum.FHIR,
    validate: jest.fn(),
    transform: jest.fn(),
    dispatch: jest.fn(),
  };

  const mockHl7Adapter = {
    payloadType: PayloadTypeEnum.HL7,
    validate: jest.fn(),
    transform: jest.fn(),
    dispatch: jest.fn(),
  };

  const mockCdaAdapter = {
    payloadType: PayloadTypeEnum.CDA,
    validate: jest.fn(),
    transform: jest.fn(),
    dispatch: jest.fn(),
  };

  const mockRestAdapter = {
    payloadType: PayloadTypeEnum.REST,
    validate: jest.fn(),
    transform: jest.fn(),
    dispatch: jest.fn(),
  };

  const mockSoapAdapter = {
    payloadType: PayloadTypeEnum.SOAP,
    validate: jest.fn(),
    transform: jest.fn(),
    dispatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteropService,
        {
          provide: getRepositoryToken(InteropAudit),
          useValue: mockAuditRepository,
        },
        {
          provide: getRepositoryToken(InteropCache),
          useValue: mockCacheRepository,
        },
        {
          provide: FhirAdapter,
          useValue: mockFhirAdapter,
        },
        {
          provide: Hl7Adapter,
          useValue: mockHl7Adapter,
        },
        {
          provide: CdaAdapter,
          useValue: mockCdaAdapter,
        },
        {
          provide: RestAdapter,
          useValue: mockRestAdapter,
        },
        {
          provide: SoapAdapter,
          useValue: mockSoapAdapter,
        },
      ],
    }).compile();

    service = module.get<InteropService>(InteropService);
    auditRepository = module.get<Repository<InteropAudit>>(
      getRepositoryToken(InteropAudit),
    );
    cacheRepository = module.get<Repository<InteropCache>>(
      getRepositoryToken(InteropCache),
    );

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('dispatch - Idempotencia', () => {
    it('debe retornar respuesta existente si el requestId ya fue procesado', async () => {
      // Arrange
      const requestId = uuidv4();
      const userId = uuidv4();
      const dispatchDto: DispatchInteropDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        payloadType: PayloadTypeEnum.FHIR,
        channel: ChannelEnum.API,
      };

      const existingAudit: Partial<InteropAudit> = {
        request_id: requestId,
        trace_id: uuidv4(),
        status: InteropStatusEnum.SENT,
        errors: [],
        latency_ms: 50,
        was_validated: true,
        was_cached: false,
      };

      mockAuditRepository.findOne.mockResolvedValue(existingAudit);

      // Act
      const result = await service.dispatch(dispatchDto, requestId, userId);

      // Assert
      expect(result.requestId).toBe(requestId);
      expect(result.status).toBe(InteropStatusEnum.SENT);
      expect(mockAuditRepository.findOne).toHaveBeenCalledWith({
        where: { request_id: requestId },
      });
      expect(mockAuditRepository.findOne).toHaveBeenCalledTimes(1);

      // No debe llamar a los adaptadores
      expect(mockFhirAdapter.validate).not.toHaveBeenCalled();
      expect(mockFhirAdapter.transform).not.toHaveBeenCalled();
      expect(mockFhirAdapter.dispatch).not.toHaveBeenCalled();
    });

    it('debe procesar nueva solicitud si el requestId no existe', async () => {
      // Arrange
      const requestId = uuidv4();
      const userId = uuidv4();
      const dispatchDto: DispatchInteropDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        payloadType: PayloadTypeEnum.FHIR,
        channel: ChannelEnum.API,
      };

      const transformedPayload = {
        resourceType: 'Patient',
        id: '1234567890',
      };

      const dispatchResult = {
        success: true,
        data: { id: '1234567890', status: 'created' },
        latencyMs: 45,
        targetEndpoint: 'https://fhir-server-mock.com/Patient',
      };

      mockAuditRepository.findOne.mockResolvedValue(null); // No existe auditoría previa
      mockCacheRepository.findOne.mockResolvedValue(null); // No hay cache
      mockFhirAdapter.validate.mockResolvedValue(true);
      mockFhirAdapter.transform.mockResolvedValue(transformedPayload);
      mockFhirAdapter.dispatch.mockResolvedValue(dispatchResult);
      mockAuditRepository.save.mockResolvedValue({});
      mockCacheRepository.findOne.mockResolvedValue(null); // Para saveCachedData
      mockCacheRepository.save.mockResolvedValue({});

      // Act
      const result = await service.dispatch(dispatchDto, requestId, userId);

      // Assert
      expect(result.requestId).toBe(requestId);
      expect(result.status).toBe(InteropStatusEnum.SENT);
      expect(result.errors).toEqual([]);
      expect(result.meta.validated).toBe(true);
      expect(result.meta.cached).toBe(false);

      // Verificar llamadas a adaptador
      expect(mockFhirAdapter.validate).toHaveBeenCalledWith('CC', '1234567890');
      expect(mockFhirAdapter.transform).toHaveBeenCalledWith(
        'CC',
        '1234567890',
      );
      expect(mockFhirAdapter.dispatch).toHaveBeenCalledWith(transformedPayload);

      // Verificar que se guardó auditoría
      expect(mockAuditRepository.save).toHaveBeenCalled();
    });
  });

  describe('dispatch - Validación', () => {
    it('debe fallar si la validación del adaptador falla', async () => {
      // Arrange
      const requestId = uuidv4();
      const userId = uuidv4();
      const dispatchDto: DispatchInteropDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '123', // Documento muy corto
        payloadType: PayloadTypeEnum.FHIR,
        channel: ChannelEnum.API,
      };

      mockAuditRepository.findOne.mockResolvedValue(null);
      mockCacheRepository.findOne.mockResolvedValue(null);
      mockFhirAdapter.validate.mockResolvedValue(false); // Validación falla
      mockAuditRepository.save.mockResolvedValue({});

      // Act
      const result = await service.dispatch(dispatchDto, requestId, userId);

      // Assert
      expect(result.status).toBe(InteropStatusEnum.FAILED);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.meta.validated).toBe(false);

      // No debe llamar a transform ni dispatch si la validación falla
      expect(mockFhirAdapter.transform).not.toHaveBeenCalled();
      expect(mockFhirAdapter.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('dispatch - Cache', () => {
    it('debe retornar datos del cache si están disponibles', async () => {
      // Arrange
      const requestId = uuidv4();
      const userId = uuidv4();
      const dispatchDto: DispatchInteropDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        payloadType: PayloadTypeEnum.FHIR,
        channel: ChannelEnum.API,
      };

      const cachedData: Partial<InteropCache> = {
        id: uuidv4(),
        tipo_documento: 'CC',
        numero_documento: '1234567890',
        payload_type: PayloadTypeEnum.FHIR,
        cached_data: { patient: 'data' },
        expires_at: new Date(Date.now() + 3600000), // Expira en 1 hora
        hit_count: 5,
      };

      mockAuditRepository.findOne.mockResolvedValue(null); // No es idempotente
      mockCacheRepository.findOne.mockResolvedValue(cachedData); // Hay cache
      mockCacheRepository.increment.mockResolvedValue({});
      mockAuditRepository.save.mockResolvedValue({});

      // Act
      const result = await service.dispatch(dispatchDto, requestId, userId);

      // Assert
      expect(result.status).toBe(InteropStatusEnum.SENT);
      expect(result.meta.cached).toBe(true);
      expect(result.meta.validated).toBe(true);

      // Verificar que se incrementó el contador de hits
      expect(mockCacheRepository.increment).toHaveBeenCalledWith(
        { id: cachedData.id },
        'hit_count',
        1,
      );

      // No debe llamar a los adaptadores
      expect(mockFhirAdapter.validate).not.toHaveBeenCalled();
      expect(mockFhirAdapter.transform).not.toHaveBeenCalled();
      expect(mockFhirAdapter.dispatch).not.toHaveBeenCalled();
    });

    it('debe procesar normalmente si el cache ha expirado', async () => {
      // Arrange
      const requestId = uuidv4();
      const userId = uuidv4();
      const dispatchDto: DispatchInteropDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        payloadType: PayloadTypeEnum.FHIR,
        channel: ChannelEnum.API,
      };

      const expiredCache: Partial<InteropCache> = {
        id: uuidv4(),
        expires_at: new Date(Date.now() - 3600000), // Expiró hace 1 hora
      };

      mockAuditRepository.findOne.mockResolvedValue(null);
      mockCacheRepository.findOne.mockResolvedValue(expiredCache);
      mockCacheRepository.delete.mockResolvedValue({ affected: 1 });
      mockFhirAdapter.validate.mockResolvedValue(true);
      mockFhirAdapter.transform.mockResolvedValue({ data: 'transformed' });
      mockFhirAdapter.dispatch.mockResolvedValue({
        success: true,
        data: {},
        latencyMs: 50,
      });
      mockAuditRepository.save.mockResolvedValue({});
      mockCacheRepository.save.mockResolvedValue({});

      // Act
      const result = await service.dispatch(dispatchDto, requestId, userId);

      // Assert
      expect(result.meta.cached).toBe(false);
      expect(mockCacheRepository.delete).toHaveBeenCalledWith(expiredCache.id);
      expect(mockFhirAdapter.dispatch).toHaveBeenCalled();
    });
  });

  describe('cleanExpiredCache', () => {
    it('debe eliminar entradas de cache expiradas', async () => {
      // Arrange
      mockCacheRepository.delete.mockResolvedValue({ affected: 15 });

      // Act
      const result = await service.cleanExpiredCache();

      // Assert
      expect(result).toBe(15);
      expect(mockCacheRepository.delete).toHaveBeenCalled();
    });
  });

  describe('getAuditStats', () => {
    it('debe retornar estadísticas correctas', async () => {
      // Arrange
      const mockQueryBuilder = {
        getCount: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(100) // totalRequests
        .mockResolvedValueOnce(95) // successfulRequests
        .mockResolvedValueOnce(5) // failedRequests
        .mockResolvedValueOnce(30); // cachedRequests

      mockAuditRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getAuditStats();

      expect(result.totalRequests).toBe(100);
      expect(result.successfulRequests).toBe(95);
      expect(result.failedRequests).toBe(5);
      expect(result.cachedRequests).toBe(30);
      expect(result.successRate).toBe('95.00');
      expect(result.cacheHitRate).toBe('30.00');
    });
  });
});
