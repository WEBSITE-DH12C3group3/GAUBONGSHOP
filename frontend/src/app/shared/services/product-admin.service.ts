import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin/products`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách sản phẩm (phân trang, tìm kiếm, lọc)
   */
  listPaged(
    keyword?: string,
    categoryId?: number,
    brandId?: number,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (keyword) params = params.set('keyword', keyword);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (brandId) params = params.set('brandId', brandId);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  update(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
