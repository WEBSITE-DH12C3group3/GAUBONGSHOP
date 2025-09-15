import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`; // 👈 lấy từ environment

  constructor(private http: HttpClient) {}

  // Lấy danh mục nổi bật
  getFeaturedCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/featured`);
  }

  // Lấy tất cả danh mục
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // Lấy chi tiết 1 danh mục
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }
}
