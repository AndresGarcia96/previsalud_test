import { PayloadTypeEnum } from '../enums/payload-type.enum';

export interface AdapterResult {
  success: boolean;
  data?: any;
  errors?: string[];
  latencyMs: number;
  targetEndpoint?: string;
}

export interface IInteropAdapter {
  readonly payloadType: PayloadTypeEnum;

  validate(tipoDocumento: string, numeroDocumento: string): Promise<boolean>;

  transform(tipoDocumento: string, numeroDocumento: string): Promise<any>;

  dispatch(payload: any): Promise<AdapterResult>;
}
