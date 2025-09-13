import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductResponse } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  /**
   * Lấy sản phẩm theo category (có phân trang)
   */
  getProductsByCategory(
    categoryId: number,
    page: number = 0,
    size: number = 12
  ): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('categoryId', categoryId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy sản phẩm mới nhất
   */
  getNewProducts(limit: number = 3): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', limit.toString())
      .set('sort', 'createdAt,desc');

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy tất cả sản phẩm (có phân trang)
   */
  getAllProducts(page: number = 0, size: number = 12): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }
}
