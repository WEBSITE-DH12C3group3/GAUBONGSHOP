import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment } from '../../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Lấy danh sách review theo sản phẩm
   * Backend: GET /api/reviews/products/{productId}
   */
  getReviewsByProduct(productId: number): Observable<{ items: Comment[] }> {
    return this.http.get<{ items: Comment[] }>(`${this.apiUrl}/products/${productId}`);
  }

  /**
   * 🔹 Thêm review mới cho sản phẩm
   * Backend: POST /api/reviews/products/{productId}
   */
  addReview(productId: number, review: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/products/${productId}`, review);
  }

  /**
   * 🔹 Xoá review theo ID (nếu admin/customer có quyền)
   * Backend: DELETE /api/reviews/{reviewId}
   */
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${reviewId}`);
  }
}
