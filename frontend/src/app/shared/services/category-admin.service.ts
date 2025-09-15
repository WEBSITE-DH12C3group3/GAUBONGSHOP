import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryAdminService {
  private apiUrl = `${environment.apiUrl}/admin/categories`; // 👈 API cho admin

  constructor(private http: HttpClient) {}

  // Lấy danh sách danh mục (có phân trang & tìm kiếm nếu backend hỗ trợ)
  getCategories(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Lấy chi tiết 1 danh mục
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // Tạo mới danh mục
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  // Cập nhật danh mục
  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  // Xóa danh mục
  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
