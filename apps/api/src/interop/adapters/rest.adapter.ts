import { Injectable, Logger } from '@nestjs/common';
import {
  IInteropAdapter,
  AdapterResult,
} from '../interfaces/adapter.interface';
import { PayloadTypeEnum } from '../enums/payload-type.enum';

@Injectable()
export class RestAdapter implements IInteropAdapter {
  private readonly logger = new Logger(RestAdapter.name);
  readonly payloadType = PayloadTypeEnum.REST;

  async validate(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<boolean> {
    this.logger.log(
      `[REST] Validating document: ${tipoDocumento} ${numeroDocumento}`,
    );
    return !!tipoDocumento && !!numeroDocumento;
  }

  async transform(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<any> {
    this.logger.log(`[REST] Transforming to REST JSON format`);

    // Formato JSON estándar para API REST
    const restPayload = {
      patient: {
        documentType: tipoDocumento,
        documentNumber: numeroDocumento,
        requestedAt: new Date().toISOString(),
        source: 'InteropModule',
      },
      query: {
        action: 'retrieve_clinical_data',
        includeHistory: true,
        format: 'json',
      },
    };

    return restPayload;
  }

  async dispatch(payload: any): Promise<AdapterResult> {
    const startTime = Date.now();
    this.logger.log(`[REST] Dispatching to REST API (MOCK)`);

    try {
      // Simulación de llamada HTTP REST
      await this.simulateNetworkDelay(30, 100);

      const latencyMs = Date.now() - startTime;
      const isSuccess = Math.random() > 0.03;

      if (isSuccess) {
        this.logger.log(`[REST] Dispatch successful in ${latencyMs}ms`);
        return {
          success: true,
          data: {
            statusCode: 200,
            patient: payload.patient,
            clinicalData: {
              hasRecords: true,
              recordCount: Math.floor(Math.random() * 10) + 1,
            },
          },
          latencyMs,
          targetEndpoint: 'https://rest-api-mock.com/api/v1/patients',
        };
      } else {
        throw new Error('REST API returned 503 Service Unavailable');
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[REST] Dispatch failed: ${error.message}`);

      return {
        success: false,
        errors: [`REST dispatch error: ${error.message}`],
        latencyMs,
        targetEndpoint: 'https://rest-api-mock.com/api/v1/patients',
      };
    }
  }

  private async simulateNetworkDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
