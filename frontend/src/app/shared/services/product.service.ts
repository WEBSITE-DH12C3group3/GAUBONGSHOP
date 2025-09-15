import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductResponse } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả sản phẩm (có phân trang)
   */
  getAllProducts(page: number = 0, size: number = 12): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy sản phẩm theo category (có phân trang)
   */
  getProductsByCategory(categoryId: number, page: number = 0, size: number = 12): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('categoryId', categoryId)
      .set('page', page)
      .set('size', size);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy sản phẩm mới nhất
   */
  getNewProducts(limit: number = 6): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', limit)
      .set('sort', 'createdAt,desc');

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy sản phẩm nổi bật
   */
  getFeaturedProducts(limit: number = 6): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', limit)
      .set('featured', true);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * Tìm kiếm sản phẩm theo tên / keyword
   */
  searchProducts(keyword: string, page: number = 0, size: number = 12): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);

    return this.http.get<ProductResponse>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }

  /**
   * Lấy chi tiết sản phẩm theo slug (SEO friendly)
   */
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }
}
