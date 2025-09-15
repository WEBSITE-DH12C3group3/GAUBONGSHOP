import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductResponse } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)
   */
  listPaged(
    keyword?: string,
    categoryId?: number,
    brandId?: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'id,desc'
  ): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (keyword) params = params.set('keyword', keyword);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (brandId) params = params.set('brandId', brandId);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy chi tiết 1 sản phẩm (admin view)
   */
  getDetail(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Thêm sản phẩm mới (basic)
   */
  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * Thêm sản phẩm đầy đủ (có attributes, images, reviews...)
   */
  createFull(product: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/full`, product);
  }

  /**
   * Cập nhật sản phẩm
   */
  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * Xóa sản phẩm
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
