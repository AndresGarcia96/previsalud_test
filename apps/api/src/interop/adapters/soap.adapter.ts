import { Injectable, Logger } from '@nestjs/common';
import {
  IInteropAdapter,
  AdapterResult,
} from '../interfaces/adapter.interface';
import { PayloadTypeEnum } from '../enums/payload-type.enum';

@Injectable()
export class SoapAdapter implements IInteropAdapter {
  private readonly logger = new Logger(SoapAdapter.name);
  readonly payloadType = PayloadTypeEnum.SOAP;

  async validate(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<boolean> {
    this.logger.log(
      `[SOAP] Validating document: ${tipoDocumento} ${numeroDocumento}`,
    );
    return !!tipoDocumento && !!numeroDocumento;
  }

  async transform(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<any> {
    this.logger.log(`[SOAP] Transforming to SOAP 1.2 format`);

    // Simulación de envelope SOAP 1.2
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:pat="http://healthcare.example.com/patient">
  <soap:Header>
    <pat:Authentication>
      <pat:Token>MOCK_TOKEN_${Date.now()}</pat:Token>
    </pat:Authentication>
  </soap:Header>
  <soap:Body>
    <pat:GetPatientDataRequest>
      <pat:DocumentType>${tipoDocumento}</pat:DocumentType>
      <pat:DocumentNumber>${numeroDocumento}</pat:DocumentNumber>
      <pat:IncludeClinicalHistory>true</pat:IncludeClinicalHistory>
      <pat:RequestTimestamp>${new Date().toISOString()}</pat:RequestTimestamp>
    </pat:GetPatientDataRequest>
  </soap:Body>
</soap:Envelope>`;

    return {
      soapVersion: '1.2',
      operation: 'GetPatientData',
      envelope: soapEnvelope,
    };
  }

  async dispatch(payload: any): Promise<AdapterResult> {
    const startTime = Date.now();
    this.logger.log(`[SOAP] Dispatching SOAP request (MOCK)`);

    try {
      await this.simulateNetworkDelay(120, 300);

      const latencyMs = Date.now() - startTime;
      const isSuccess = Math.random() > 0.07;

      if (isSuccess) {
        this.logger.log(`[SOAP] Dispatch successful in ${latencyMs}ms`);

        const soapResponse = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <GetPatientDataResponse>
      <Status>Success</Status>
      <PatientFound>true</PatientFound>
      <RecordCount>${Math.floor(Math.random() * 5) + 1}</RecordCount>
    </GetPatientDataResponse>
  </soap:Body>
</soap:Envelope>`;

        return {
          success: true,
          data: {
            soapVersion: payload.soapVersion,
            operation: payload.operation,
            response: soapResponse,
          },
          latencyMs,
          targetEndpoint: 'https://soap-service-mock.com/PatientService',
        };
      } else {
        throw new Error('SOAP Fault: Server processing error');
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[SOAP] Dispatch failed: ${error.message}`);

      return {
        success: false,
        errors: [`SOAP dispatch error: ${error.message}`],
        latencyMs,
        targetEndpoint: 'https://soap-service-mock.com/PatientService',
      };
    }
  }

  private async simulateNetworkDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
