import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { SessionFavoriteService } from './session-favorite.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly favoritesApi = `${environment.apiUrl}/favorites`; // ✅ dùng backticks để interpolate
  private readonly loggedIn$ = new BehaviorSubject<boolean>(false);
  private readonly isBrowser: boolean;

  constructor(
    private readonly http: HttpClient,
    private readonly sessionFavorite: SessionFavoriteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser && this.getToken()) {
      this.loggedIn$.next(true);
    }
  }

  // ================= Auth API =================

  /** Đăng ký */
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /** Đăng nhập + merge favorites + lưu permissions */
  login(data: any): Observable<any> {
    return new Observable((observer) => {
      this.http.post<any>(`${this.apiUrl}/login`, data).subscribe({
        next: (res) => {
          // Lưu token
          if (res?.token) this.saveToken(res.token);

          // Lưu user
          if (res?.user) {
            this.saveUser(res.user);
          }

          // Lưu permissions từ backend
          if (Array.isArray(res?.permissions)) {
            this.savePermissions(res.permissions);
          }

          // Merge session favorites vào DB (nếu có user & token)
          if (res?.user?.id && res?.token) {
            const sessionFavs = this.sessionFavorite.getSessionFavorites();
            sessionFavs.forEach((pid: number | string) => {
              this.http
                .post(
                  `${this.favoritesApi}/${res.user.id}/${pid}`,
                  {},
                  { headers: this.authHeaders(res.token) }
                )
                .subscribe({ error: (err) => console.error('Merge favorite lỗi:', err) });
            });
            // Xoá session favorites sau khi merge
            this.sessionFavorite.clearSessionFavorites();
          }

          this.loggedIn$.next(true);
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /** Lấy user hiện tại từ API */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: this.authHeaders(this.getToken()),
    });
  }

  /** Cập nhật profile */
  updateProfile(profile: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, profile, {
      headers: this.authHeaders(this.getToken()),
    });
  }

  /** Đổi mật khẩu */
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data, {
      headers: this.authHeaders(this.getToken()),
    });
  }

  // ============= Local storage helpers =============

  /** Lưu user vào localStorage */
  saveUser(user: User | any) {
    if (!this.isBrowser) return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  /** Lấy user từ localStorage */
  getUser(): User | null {
    if (!this.isBrowser) return null;
    const s = localStorage.getItem('user');
    try {
      return s ? (JSON.parse(s) as User) : null;
    } catch {
      return null;
    }
  }

  /** Lưu token */
  saveToken(token: string) {
    if (!this.isBrowser) return;
    localStorage.setItem('token', token);
  }

  /** Lấy token */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  /** Lưu permissions */
  savePermissions(perms: string[]) {
    if (!this.isBrowser) return;
    localStorage.setItem('permissions', JSON.stringify(perms ?? []));
  }

  /** Lấy permissions */
  permissions(): string[] {
    if (!this.isBrowser) return [];
    const s = localStorage.getItem('permissions');
    try {
      return s ? (JSON.parse(s) as string[]) : [];
    } catch {
      return [];
    }
  }

  // ============= Helpers cho FE =============

  /** Lấy role name đầu tiên (tuỳ cấu trúc backend) */
  getRole(): string | null {
    const u: any = this.getUser();
    // hỗ trợ cả trường hợp roles: [{id, name}] hoặc roles: string[]
    const name =
      (u?.roles?.[0]?.name as string) ??
      (Array.isArray(u?.roles) && typeof u.roles[0] === 'string' ? u.roles[0] : null);
    return name ?? null;
  }

  hasPermission(p: string): boolean {
    return this.permissions().includes(p);
  }

  hasAny(need: string[]): boolean {
    const mine = this.permissions();
    return need.some((p) => mine.includes(p));
  }

  hasAll(need: string[]): boolean {
    const mine = this.permissions();
    return need.every((p) => mine.includes(p));
  }

  /** Trạng thái login (sync) */
  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  /** Trạng thái login (observable) */
  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  /** Đăng xuất */
  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    this.sessionFavorite.clearSessionFavorites(); // giữ nguyên logic nhánh tbingu
    this.loggedIn$.next(false);
  }

  // ============= Private =============

  /** Tạo Authorization headers an toàn */
  private authHeaders(token: string | null | undefined): HttpHeaders {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }
}
