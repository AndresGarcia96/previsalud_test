import { Injectable, Logger } from '@nestjs/common';
import {
  IInteropAdapter,
  AdapterResult,
} from '../interfaces/adapter.interface';
import { PayloadTypeEnum } from '../enums/payload-type.enum';

@Injectable()
export class Hl7Adapter implements IInteropAdapter {
  private readonly logger = new Logger(Hl7Adapter.name);
  readonly payloadType = PayloadTypeEnum.HL7;

  async validate(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<boolean> {
    this.logger.log(
      `[HL7] Validating document: ${tipoDocumento} ${numeroDocumento}`,
    );
    return !!tipoDocumento && !!numeroDocumento;
  }

  async transform(
    tipoDocumento: string,
    numeroDocumento: string,
  ): Promise<any> {
    this.logger.log(`[HL7] Transforming to HL7 v2.x format`);

    // Simulación de mensaje HL7 v2.x (ADT^A01)
    const timestamp = this.getHL7Timestamp();
    const messageId = this.generateMessageId();

    const hl7Message = [
      `MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|${timestamp}||ADT^A01|${messageId}|P|2.5`,
      `EVN|A01|${timestamp}`,
      `PID|1||${numeroDocumento}^^^${tipoDocumento}||APELLIDO^NOMBRE||19800101|M|||DIRECCION^^CIUDAD^DEPTO^CODIGO^PAIS`,
      `PV1|1|I|UBICACION||||MEDICO^TRATANTE|||||||||||NUMERO_VISITA`,
    ].join('\r');

    return {
      messageType: 'ADT^A01',
      version: '2.5',
      messageId,
      rawMessage: hl7Message,
    };
  }

  async dispatch(payload: any): Promise<AdapterResult> {
    const startTime = Date.now();
    this.logger.log(`[HL7] Dispatching to HL7 interface engine (MOCK)`);

    try {
      await this.simulateNetworkDelay(80, 200);

      const latencyMs = Date.now() - startTime;
      const isSuccess = Math.random() > 0.08;

      if (isSuccess) {
        this.logger.log(`[HL7] Dispatch successful in ${latencyMs}ms`);
        return {
          success: true,
          data: {
            acknowledgment: 'AA', // Application Accept
            messageId: payload.messageId,
            hl7Version: payload.version,
          },
          latencyMs,
          targetEndpoint: 'mllp://hl7-server-mock:2575',
        };
      } else {
        throw new Error('HL7 acknowledgment returned AR (Application Reject)');
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[HL7] Dispatch failed: ${error.message}`);

      return {
        success: false,
        errors: [`HL7 dispatch error: ${error.message}`],
        latencyMs,
        targetEndpoint: 'mllp://hl7-server-mock:2575',
      };
    }
  }

  private getHL7Timestamp(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '')
      .split('.')[0];
  }

  private generateMessageId(): string {
    return `MSG${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  private async simulateNetworkDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
