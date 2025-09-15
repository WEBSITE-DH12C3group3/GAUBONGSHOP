// src/app/shared/services/category-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../../models/category.model';
import { Page } from '../../models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryAdminService {
  private apiUrl = `${environment.apiUrl}/admin/categories`; // ✅

  constructor(private http: HttpClient) {}

getAll(page: number = 0, size: number = 10): Observable<Page<Category>> {
  return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
    map((raw: any): Page<Category> => {
      const content: Category[] = Array.isArray(raw?.content) ? raw.content : (raw?.items ?? []);
      return {
        content,                        // ✅ bắt buộc
        items: content,                 // ✅ bắt buộc
        number: raw?.number ?? raw?.page ?? page,
        size: raw?.size ?? size,
        totalPages: raw?.totalPages ?? 1,
        totalElements: raw?.totalElements ?? content.length
      };
    })
  );
}

  getById(id: number): Observable<Category> { return this.http.get<Category>(`${this.apiUrl}/${id}`); }
  create(category: Category): Observable<Category> { return this.http.post<Category>(this.apiUrl, category); }
  update(id: number, category: Category): Observable<Category> { return this.http.put<Category>(`${this.apiUrl}/${id}`, category); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
