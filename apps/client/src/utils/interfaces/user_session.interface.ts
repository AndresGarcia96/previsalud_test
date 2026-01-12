import { IRole } from './role.interface';

export interface IUserSession {
  id: string;
  name: string;
  last_name: string;
  id_number: string;
  email: string;
  role: IRole[];
}
