import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product_detail.html',
  styleUrls: ['./product_detail.css'],
  imports: [
    CommonModule,
    RouterLink,
    DecimalPipe,
    DatePipe,
    SlicePipe
  ]
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  related: any[] = [];
  reviews: Comment[] = [];
  activeTab = 'desc';
  quantity = 1;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
      this.loadRelated(id);
      this.loadReviews(id);
    }
  }

  // Load sản phẩm chi tiết
  loadProduct(id: string): void {
    this.http.get<any>(`http://localhost:8080/api/products/${id}`)
      .subscribe({
        next: (res) => this.product.set(res),
        error: (err) => console.error('Lỗi load sản phẩm:', err)
      });
  }

  // Load sản phẩm liên quan
  loadRelated(id: string): void {
    this.http.get<{ items: any[] }>(`http://localhost:8080/api/products/${id}/related?limit=4`)
      .subscribe({
        next: (res) => this.related = res.items || [],
        error: (err) => console.error('Lỗi load sản phẩm liên quan:', err)
      });
  }

  // Load review
  loadReviews(id: string): void {
    this.http.get<{ items: Comment[] }>(`http://localhost:8080/api/reviews/products/${id}`)
      .subscribe({
        next: (res) => this.reviews = res.items || [],
        error: (err) => console.error('Lỗi load đánh giá:', err)
      });
  }

  // Đổi tab hiển thị
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Thêm vào giỏ hàng
  addToCart(p: any): void {
    console.log('Add to cart:', p, 'Quantity:', this.quantity);
    // TODO: gọi CartService để thêm vào giỏ
  }

  // Tăng số lượng
  increaseQuantity(): void {
    const product = this.product();
    if (product && this.quantity < product.stock) {
      this.quantity++;
    }
  }

  // Giảm số lượng
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Tạo mảng star để render
  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  // Tính giá sau khi giảm
  calculateDiscountPrice(price: number, discountPercent: number): number {
    if (discountPercent && discountPercent > 0) {
      return price * (1 - discountPercent / 100);
    }
    return price;
  }
}
