import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { SessionFavoriteService } from './session-favorite.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/users';
  private readonly favoritesApi = 'http://localhost:8080/api/favorites';
  private isBrowser: boolean;
  private loggedIn$ = new BehaviorSubject<boolean>(false);

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

  /** Đăng ký */
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /** Đăng nhập + merge favorites */
  login(data: any): Observable<any> {
    return new Observable((observer) => {
      this.http.post<any>(`${this.apiUrl}/login`, data).subscribe({
        next: (res) => {
          if (res.token) this.saveToken(res.token);
          if (res.user) {
            this.saveUser(res.user);

            // ✅ Merge session favorites vào DB
            const sessionFavs = this.sessionFavorite.getSessionFavorites();
            sessionFavs.forEach(pid => {
              this.http.post(
                `${this.favoritesApi}/${res.user.id}/${pid}`,
                {},
                {
                  headers: new HttpHeaders({
                    Authorization: `Bearer ${res.token}`
                  })
                }
              ).subscribe({
                error: (err) => console.error('Merge favorite lỗi:', err)
              });
            });

            // Sau khi merge thì xóa session favorites
            this.sessionFavorite.clearSessionFavorites();
          }

          this.loggedIn$.next(true);
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /** Lấy user hiện tại từ API */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    });
  }

  /** Lưu user vào localStorage */
  saveUser(user: any) {
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /** Lấy user từ localStorage */
  getUser(): any {
    if (this.isBrowser) {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  /** Cập nhật profile */
  updateProfile(profile: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, profile, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    });
  }

  /** Đổi mật khẩu */
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    });
  }

  /** Lưu token */
  saveToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      this.loggedIn$.next(true);
    }
  }

  /** Lấy token */
  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  /** Lấy role */
  getRole(): string | null {
    const user = this.getUser();
    return user?.roles?.length > 0 ? user.roles[0].name : null;
  }

  /** Trạng thái login */
  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  /** Đăng xuất */
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.sessionFavorite.clearSessionFavorites(); // ✅ Reset session favorites
      this.loggedIn$.next(false);
    }
  }
}
