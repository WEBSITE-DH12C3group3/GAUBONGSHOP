import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';
import { Page } from '../../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryAdminService {
  private apiUrl = 'http://localhost:8080/api/admin/categories';

  constructor(private http: HttpClient) {}

  // Lấy danh sách category (có phân trang)
  getAll(page: number = 0, size: number = 10): Observable<Page<Category>> {
    return this.http.get<Page<Category>>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  // Lấy 1 category theo id
  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // Thêm mới category
  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  // Cập nhật category
  update(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  // Xóa category
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
