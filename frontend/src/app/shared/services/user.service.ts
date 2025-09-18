import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  // CHUẨN: env.apiUrl đã có '/api' => không lặp /api lần nữa
  private base = `${environment.apiUrl}/admin`;

  /**
   * Tìm user có phân trang + lọc theo roleId + loại trừ role (ví dụ ADMIN, CUSTOMER)
   * GET /admin/users?q=&page=&size=&roleId=&excludeRoles=ADMIN,CUSTOMER
   * -> Kỳ vọng BE trả { content, totalElements } theo Page
   */
  // GET /api/admin/users
    searchUsers(q = '', roleId?: number, excludeRoles: string[] = [], page = 0, size = 10) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q?.trim()) params = params.set('q', q.trim());
    if (roleId)     params = params.set('roleId', roleId);
    if (excludeRoles?.length) params = params.set('excludeRoles', excludeRoles.join(','));

    return this.http.get<{ content: any[]; totalElements: number }>(
        `${this.base}/users`,
        { params }
    );
    }

  /** Tạo tài khoản admin-side */
  createUser(payload: { username?: string; phone?: string; email: string; password: string; roleIds?: number[]; }) {
    // Ưu tiên endpoint: POST /admin/users  (body như trên). Tùy BE map vào User + gán roles.
    return this.http.post<User>(`${this.base}/users`, payload);
  }
}
