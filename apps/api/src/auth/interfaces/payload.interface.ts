import { IRole } from 'utils/interfaces/role.interface';

export interface Payload {
  sub: string;
  name: string;
  last_name: string;
  email: string;
  id_number: string;
  role: IRole[];
}
