import { Role } from './role.model';

export interface User {
  id: number;
  username?: string;
  email: string;
  phone?: string;

  /** Danh sách nhóm (optional để không phá chỗ khác) */
  roles?: Role[];
}
