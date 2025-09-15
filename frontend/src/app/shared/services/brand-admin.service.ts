// src/app/shared/services/brand-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandAdminService {
  private readonly apiUrl = `${environment.apiUrl}/brands`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách thương hiệu (có phân trang, tìm kiếm)
   */
  getBrands(q: string = '', page: number = 0, size: number = 10, sort: string = 'id,desc'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (q) {
      params = params.set('q', q);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Lấy chi tiết 1 brand theo id
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Tạo brand mới
   */
  create(brand: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, brand);
  }

  /**
   * Cập nhật brand
   */
  update(id: number, brand: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, brand);
  }

  /**
   * Xóa brand
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
