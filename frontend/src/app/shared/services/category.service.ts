import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryResponse } from '../../models/category.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // Lấy danh mục nổi bật
  getFeaturedCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/featured`);
  }

  // Lấy tất cả danh mục (trả về object có content)
  getCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(this.apiUrl);
  }

  // Lấy chi tiết 1 danh mục
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<Category[]> {
  return this.http.get<CategoryResponse>(this.apiUrl).pipe(
    map(res => res?.content ?? [])
  );
}
}
