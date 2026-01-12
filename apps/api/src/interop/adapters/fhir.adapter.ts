import { Injectable, Logger } from '@nestjs/common';
import {
  IInteropAdapter,
  AdapterResult,
} from '../interfaces/adapter.interface';
import { PayloadTypeEnum } from '../enums/payload-type.enum';

@Injectable()
export class FhirAdapter implements IInteropAdapter {
  private readonly logger = new Logger(FhirAdapter.name);
  readonly payloadType = PayloadTypeEnum.FHIR;

  async validate(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<boolean> {
    this.logger.log(
      `[FHIR] Validating document: ${tipoDocumento} ${numeroDocumento}`,
    );

    if (!tipoDocumento || !numeroDocumento) {
      return false;
    }

    return true;
  }

  async transform(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<any> {
    this.logger.log(`[FHIR] Transforming to FHIR R4 format`);

    // Simulación de transformación a formato FHIR R4 (Patient resource)
    const fhirPayload = {
      resourceType: 'Patient',
      id: `${numeroDocumento}`,
      identifier: [
        {
          use: 'official',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: tipoDocumento,
                display: 'Document Number',
              },
            ],
          },
          system: 'urn:oid:2.16.840.1.113883.4.642.1.1',
          value: numeroDocumento,
        },
      ],
      active: true,
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'InteropModule',
      },
    };

    return fhirPayload;
  }

  async dispatch(payload: any): Promise<AdapterResult> {
    const startTime = Date.now();
    this.logger.log(`[FHIR] Dispatching to external FHIR server (MOCK)`);

    try {
      await this.simulateNetworkDelay(50, 150);

      const latencyMs = Date.now() - startTime;

      // Simulación: 95% de éxito
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        this.logger.log(`[FHIR] Dispatch successful in ${latencyMs}ms`);
        return {
          success: true,
          data: {
            id: payload.id,
            status: 'created',
            fhirVersion: 'R4',
          },
          latencyMs,
          targetEndpoint: 'https://fhir-server-mock.com/Patient',
        };
      } else {
        throw new Error('FHIR server returned 500');
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[FHIR] Dispatch failed: ${error.message}`);

      return {
        success: false,
        errors: [`FHIR dispatch error: ${error.message}`],
        latencyMs,
        targetEndpoint: 'https://fhir-server-mock.com/Patient',
      };
    }
  }

  private async simulateNetworkDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
