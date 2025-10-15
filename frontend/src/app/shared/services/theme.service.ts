import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay, catchError, of } from 'rxjs';
import { Theme, ThemeReq } from '../../models/theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private all$?: Observable<Theme[]>;

  /** Lấy toàn bộ chủ đề (kèm mảng categories PHẲNG) */
  getAll(): Observable<Theme[]> {
    if (!this.all$) {
      this.all$ = this.http
        .get<Theme[]>(`${this.base}/themes`)
        .pipe(
          shareReplay({ bufferSize: 1, refCount: true }),
          catchError(() => of([])) // tránh gãy UI khi BE lỗi
        );
    }
    return this.all$;
  }
  invalidateCache() { this.all$ = undefined; }

  // --- Admin giữ nguyên ---
  adminList(): Observable<Theme[]> {
    return this.http.get<Theme[]>(`${this.base}/admin/themes`);
  }
  create(req: ThemeReq): Observable<Theme> { this.invalidateCache(); return this.http.post<Theme>(`${this.base}/admin/themes`, req); }
  update(id: number, req: ThemeReq): Observable<Theme> { this.invalidateCache(); return this.http.put<Theme>(`${this.base}/admin/themes/${id}`, req); }
  delete(id: number): Observable<void> { this.invalidateCache(); return this.http.delete<void>(`${this.base}/admin/themes/${id}`); }

  // (tuỳ dùng) chi tiết theo slug
  getBySlug(slug: string): Observable<Theme> {
    return this.http.get<Theme>(`${this.base}/themes/${slug}`);
  }
}
