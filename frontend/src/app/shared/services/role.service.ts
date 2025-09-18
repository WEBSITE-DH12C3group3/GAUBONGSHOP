import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  // Roles
  listRoles() { return this.http.get<Role[]>(`${this.base}/roles`); }
  createRole(name: string) { return this.http.post<Role>(`${this.base}/roles`, { name }); }
  updateRole(id: number, name: string) { return this.http.put<Role>(`${this.base}/roles/${id}`, { name }); }
  deleteRole(id: number) { return this.http.delete<void>(`${this.base}/roles/${id}`); }

  // Permissions (giữ nguyên nếu cần)
  listAllPermissions() { return this.http.get<Permission[]>(`${this.base}/permissions`); }
  getRolePermissions(roleId: number) { return this.http.get<Permission[]>(`${this.base}/roles/${roleId}/permissions`); }
  setRolePermissions(roleId: number, ids: number[]) { return this.http.put<void>(`${this.base}/roles/${roleId}/permissions`, ids); }

  /**
   * Lấy danh sách user trong 1 role (có phân trang + tìm tên/email)
   * Ưu tiên endpoint: GET /admin/roles/{id}/users?page=&size=&q=
   * Nếu BE chưa có, fallback sang /admin/users?roleId={id}
   */
    // src/app/shared/services/role.service.ts
    listRoleUsers(roleId: number, page = 0, size = 10, q = '') {
    return this.http.get<{ content: any[]; totalElements: number }>(
        `${this.base}/roles/${roleId}/users`,
        { params: { page, size, q } as any }
    );
    }



  // Members (thêm/xoá)
  addUserToRole(userId: number, roleId: number) {
    return this.http.post<void>(`${this.base}/user-roles?userId=${userId}&roleId=${roleId}`, {});
  }
  removeUserFromRole(userId: number, roleId: number) {
    return this.http.delete<void>(`${this.base}/user-roles?userId=${userId}&roleId=${roleId}`);
  }
}
