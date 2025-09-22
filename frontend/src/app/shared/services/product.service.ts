import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductResponse } from '../../models/product.model';
import { FavoriteService } from './favorite.service';
import { SessionFavoriteService } from './session-favorite.service';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient,    private sessionFavorite: SessionFavoriteService
) { }

  /**
   * 🔹 Lấy danh sách sản phẩm (có phân trang, filter, search)
   */
  getAllProducts(
    page: number = 0,
    size: number = 12,
    keyword?: string,
    categoryId?: number,
    brandId?: number,
  ): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (keyword) params = params.set('keyword', keyword);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (brandId) params = params.set('brandId', brandId);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }


  /**
   * 🔹 Lấy sản phẩm theo category (có phân trang)
   */
  getProductsByCategory(
    categoryId: number,
    page: number = 0,
    size: number = 12
  ): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('categoryId', categoryId)
      .set('page', page)
      .set('size', size);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * 🔹 Lấy sản phẩm mới nhất (API `/products/latest`)
   */
  getNewProducts(limit: number = 6): Observable<any> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/latest`, { params });
  }

  /**
   * 🔹 Lấy sản phẩm nổi bật (nếu BE hỗ trợ filter featured)
   */
  getFeaturedProducts(limit: number = 6): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', limit)
      .set('featured', true);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * 🔹 Tìm kiếm sản phẩm theo tên / keyword
   */
  searchProducts(
    keyword: string,
    page: number = 0,
    size: number = 12
  ): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);

    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  /**
   * 🔹 Lấy chi tiết sản phẩm theo ID
   */
  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }

  /**
   * 🔹 Lấy sản phẩm liên quan cùng danh mục
   */
  getRelatedProducts(productId: number, limit: number = 4): Observable<any> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/${productId}/related`, { params });
  }

  /**
   * 🔹 Lấy chi tiết sản phẩm theo slug (SEO friendly)
   */
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }
// product.service.ts
getProductsByIds(ids: number[]): Observable<Product[]> {
  return this.http.get<Product[]>(`http://localhost:8080/api/products/by-ids?ids=${ids.join(',')}`);
}
// Lấy danh sách favorites trong session
getSessionFavorites(): number[] {
  return this.sessionFavorite.getSessionFavorites();
}

// Thêm vào favorites session
addSessionFavorite(productId: number) {
  this.sessionFavorite.addSessionFavorite(productId);
}

// Xóa khỏi favorites session
removeSessionFavorite(productId: number) {
  this.sessionFavorite.removeSessionFavorite(productId);
}


}
