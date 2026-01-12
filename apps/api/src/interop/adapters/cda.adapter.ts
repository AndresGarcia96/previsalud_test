import { Injectable, Logger } from '@nestjs/common';
import {
  IInteropAdapter,
  AdapterResult,
} from '../interfaces/adapter.interface';
import { PayloadTypeEnum } from '../enums/payload-type.enum';

@Injectable()
export class CdaAdapter implements IInteropAdapter {
  private readonly logger = new Logger(CdaAdapter.name);
  readonly payloadType = PayloadTypeEnum.CDA;

  async validate(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<boolean> {
    this.logger.log(
      `[CDA] Validating document: ${tipoDocumento} ${numeroDocumento}`,
    );
    return !!tipoDocumento && !!numeroDocumento;
  }

  async transform(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<any> {
    this.logger.log(`[CDA] Transforming to CDA R2 format`);

    // Simulación de documento CDA R2 (Clinical Document Architecture)
    const cdaDocument = {
      ClinicalDocument: {
        '@xmlns': 'urn:hl7-org:v3',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        realmCode: { '@code': 'CO' },
        typeId: {
          '@root': '2.16.840.1.113883.1.3',
          '@extension': 'POCD_HD000040',
        },
        templateId: { '@root': '2.16.840.1.113883.10.20.22.1.1' },
        id: { '@root': this.generateUUID() },
        code: {
          '@code': '34133-9',
          '@codeSystem': '2.16.840.1.113883.6.1',
          '@displayName': 'Summarization of Episode Note',
        },
        title: 'Clinical Document',
        effectiveTime: { '@value': this.getCDATimestamp() },
        confidentialityCode: {
          '@code': 'N',
          '@codeSystem': '2.16.840.1.113883.5.25',
        },
        recordTarget: {
          patientRole: {
            id: [
              {
                '@root': '2.16.840.1.113883.4.642.1.1',
                '@extension': numeroDocumento,
                '@assigningAuthorityName': tipoDocumento,
              },
            ],
          },
        },
      },
    };

    return {
      documentType: 'CDA R2',
      documentId: cdaDocument.ClinicalDocument.id['@root'],
      document: cdaDocument,
    };
  }

  async dispatch(payload: any): Promise<AdapterResult> {
    const startTime = Date.now();
    this.logger.log(`[CDA] Dispatching CDA document (MOCK)`);

    try {
      await this.simulateNetworkDelay(100, 250);

      const latencyMs = Date.now() - startTime;
      const isSuccess = Math.random() > 0.06;

      if (isSuccess) {
        this.logger.log(`[CDA] Dispatch successful in ${latencyMs}ms`);
        return {
          success: true,
          data: {
            documentId: payload.documentId,
            status: 'accepted',
            repository: 'CDA Repository Mock',
          },
          latencyMs,
          targetEndpoint: 'https://cda-repository-mock.com/submit',
        };
      } else {
        throw new Error('CDA validation failed at repository');
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[CDA] Dispatch failed: ${error.message}`);

      return {
        success: false,
        errors: [`CDA dispatch error: ${error.message}`],
        latencyMs,
        targetEndpoint: 'https://cda-repository-mock.com/submit',
      };
    }
  }

  private getCDATimestamp(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]
      .replace('T', '');
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private async simulateNetworkDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
