import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  // ví dụ env.apiUrl = 'http://localhost:8080/api'
  private base = `${environment.apiUrl}/admin`;

  // -------- Roles --------
  listRoles() {
    return this.http.get<Role[]>(`${this.base}/roles`);
  }
  createRole(name: string) {
    return this.http.post<Role>(`${this.base}/roles`, { name });
  }
  updateRole(id: number, name: string) {
    return this.http.put<Role>(`${this.base}/roles/${id}`, { name });
  }
  deleteRole(id: number) {
    return this.http.delete<void>(`${this.base}/roles/${id}`);
  }

  // -------- Permissions --------
    listAllPermissions() {
    return this.http.get<Permission[]>(`${this.base}/permissions`);
    }


  getRolePermissions(roleId: number) {
    return this.http.get<Permission[]>(`${this.base}/roles/${roleId}/permissions`);
  }

  /** GỬI MẢNG THUẦN: [1,2,4,5] — KHÔNG bọc { ids } */
    setRolePermissions(roleId: number, ids: number[]) {
    return this.http.put<void>(`${this.base}/roles/${roleId}/permissions`, ids);
    }


  // -------- Members (tuỳ BE có endpoint này) --------
  addUserToRole(userId: number, roleId: number) {
    return this.http.post<void>(`${this.base}/user-roles?userId=${userId}&roleId=${roleId}`, {});
  }
  removeUserFromRole(userId: number, roleId: number) {
    return this.http.delete<void>(`${this.base}/user-roles?userId=${userId}&roleId=${roleId}`);
  }
}
