import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private isBrowser: boolean;
  private loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser && this.getToken()) this.loggedIn$.next(true);
  }

  // ============= Auth API =============
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return new Observable((observer) => {
      this.http.post<any>(`${this.apiUrl}/login`, data).subscribe({
        next: (res) => {
          if (res.token) this.saveToken(res.token);
          if (res.user) this.saveUser(res.user);
          // ⬇️ lưu permissions backend trả về
          if (Array.isArray(res.permissions)) this.savePermissions(res.permissions);
          this.loggedIn$.next(true);
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }),
    });
  }

  // ============= Local storage helpers =============
  saveUser(user: User) {
    if (!this.isBrowser) return;
    localStorage.setItem('user', JSON.stringify(user));
  }
  getUser(): User | null {
    if (!this.isBrowser) return null;
    const s = localStorage.getItem('user');
    try { return s ? JSON.parse(s) : null; } catch { return null; }
  }

  saveToken(token: string) {
    if (!this.isBrowser) return;
    localStorage.setItem('token', token);
  }
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  // ⬇️ permissions
  savePermissions(perms: string[]) {
    if (!this.isBrowser) return;
    localStorage.setItem('permissions', JSON.stringify(perms ?? []));
  }
  permissions(): string[] {
    if (!this.isBrowser) return [];
    const s = localStorage.getItem('permissions');
    try { return s ? JSON.parse(s) : []; } catch { return []; }
  }

  // ============= Helpers cho FE =============
  getRole(): string | null {
    const u = this.getUser();
    // tuỳ backend, roles có thể là mảng {id,name}; lấy name đầu tiên
    const name = u?.roles?.[0]?.name ?? null;
    return name;
  }

  hasPermission(p: string): boolean {
    return this.permissions().includes(p);
  }
  hasAny(need: string[]): boolean {
    const mine = this.permissions();
    return need.some(p => mine.includes(p));
  }
  hasAll(need: string[]): boolean {
    const mine = this.permissions();
    return need.every(p => mine.includes(p));
  }

  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }
  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');     // ⬅️ nhớ xoá
    this.loggedIn$.next(false);
  }

    updateProfile(profile: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, profile, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }),
    });
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }),
    });
  }

}
