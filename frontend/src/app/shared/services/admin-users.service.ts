import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface PermissionDto {
  id: number;
  name: string;         // ví dụ: manage_products
  description?: string; // ví dụ: Quản lý sản phẩm
}

export interface RoleDto {
  id: number;
  code?: string;        // ví dụ: ADMIN / MANAGER / CUSTOMER
  name: string;         // tên hiển thị
  description?: string;
  createdAt?: string;
  permissions?: PermissionDto[];
}

export interface AdminUserDto {
  id: number;
  email: string;
  username?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  roles?: { id: number; name: string; code?: string }[]; // 1 user – 1 role
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly rolesUrl = `${environment.apiUrl}/admin/roles`;
  private readonly permsUrl = `${environment.apiUrl}/admin/permissions`;
  private readonly usersUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // ===== Roles =====
  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.rolesUrl, { headers: this.headers() });
  }
  // Chấp nhận truyền permissions là string[] (tên quyền)
  createRole(data: { code?: string; name: string; description?: string; permissions: string[] }): Observable<RoleDto> {
    return this.http.post<RoleDto>(this.rolesUrl, data, { headers: this.headers() });
  }
  updateRole(id: number, data: { code?: string; name: string; description?: string; permissions: string[] }): Observable<RoleDto> {
    return this.http.put<RoleDto>(`${this.rolesUrl}/${id}`, data, { headers: this.headers() });
  }
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${id}`, { headers: this.headers() });
  }

  // ===== Permissions =====
  getPermissions(): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(this.permsUrl, { headers: this.headers() });
  }

    getRolePermissions(roleId: number): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(
      `${this.rolesUrl}/${roleId}/permissions`,
      { headers: this.headers() }
    );
  }

  // ===== Users =====
  getUsers(): Observable<AdminUserDto[]> {
    return this.http.get<any>(this.usersUrl, { headers: this.headers() })
      .pipe(map(res => res.content as AdminUserDto[]));
  }

  getUsersWithoutRole(): Observable<AdminUserDto[]> {
  return this.http.get<AdminUserDto[]>(`${this.usersUrl}/without-role`, { headers: this.headers() });
}

  createUser(payload: { email: string; password: string; username?: string; phone?: string; address?: string }): Observable<AdminUserDto> {
    return this.http.post<AdminUserDto>(this.usersUrl, payload, { headers: this.headers() });
  }
  assignRole(userId: number, roleId: number): Observable<void> {
    return this.http.post<void>(`${this.usersUrl}/${userId}/assign-role`, { roleId }, { headers: this.headers() });
  }

  unassignRole(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${userId}/role`, { headers: this.headers() });
  }

  // tiện: tạo user rồi gán role ngay
  createUserAndAssignRole(
    payload: { email: string; password: string; username?: string; phone?: string; address?: string },
    roleId: number
  ): Observable<AdminUserDto> {
    return this.createUser(payload).pipe(
      switchMap(u => this.assignRole(u.id, roleId).pipe(map(() => u)))
    );
  }
}
