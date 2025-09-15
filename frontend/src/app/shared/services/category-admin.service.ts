import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';
import { Page } from '../../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryAdminService {
  private apiUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private http: HttpClient) {}

  // 🔹 Lấy danh sách category (có phân trang + filter/search nếu backend hỗ trợ)
  getAll(params?: any): Observable<Page<Category>> {
    return this.http.get<Page<Category>>(this.apiUrl, { params });
  }

  // 🔹 Lấy chi tiết 1 category
  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Tạo mới category
  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  // 🔹 Cập nhật category
  update(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  // 🔹 Xóa category
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
