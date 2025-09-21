import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { SessionFavoriteService } from './session-favorite.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private sessionFavorite: SessionFavoriteService
  ) {}

  /** Lấy danh sách yêu thích */
  getFavorites(): Observable<any> {
    const user = this.auth.getUser();
    if (this.auth.isLoggedIn() && user) {
      return this.http.get(`${this.apiUrl}/${user.id}`, {
        headers: this.getAuthHeaders()
      });
    } else {
      return of(this.sessionFavorite.getSessionFavorites());
    }
  }

  /** Thêm sản phẩm vào yêu thích */
  addFavorite(productId: number): Observable<any> {
    const user = this.auth.getUser();
    if (this.auth.isLoggedIn() && user) {
      return this.http.post(
        `${this.apiUrl}/${user.id}/${productId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } else {
      this.sessionFavorite.addSessionFavorite(productId);
      return of(true);
    }
  }

  /** Kiểm tra sản phẩm có trong yêu thích chưa */
  isFavorite(productId: number): Observable<boolean> {
    const user = this.auth.getUser();
    if (this.auth.isLoggedIn() && user) {
      return this.http.get<boolean>(
        `${this.apiUrl}/${user.id}/${productId}/exists`,
        { headers: this.getAuthHeaders() }
      );
    } else {
      const favs = this.sessionFavorite.getSessionFavorites();
      return of(favs.includes(productId));
    }
  }

  /** Xóa sản phẩm khỏi danh sách yêu thích */
  removeFavorite(productId: number): Observable<any> {
    const user = this.auth.getUser();
    if (this.auth.isLoggedIn() && user) {
      return this.http.delete(
        `${this.apiUrl}/${user.id}/${productId}`,
        { headers: this.getAuthHeaders() }
      );
    } else {
      this.sessionFavorite.removeSessionFavorite(productId);
      return of(true);
    }
  }

  /** Headers có token (dùng cho API cần auth) */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken() || ''}`
    });
  }
}
