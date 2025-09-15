import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { Comment } from '../../models/comment.model';
import { Product } from '../../models/product.model';
import { ReviewService } from '../../shared/services/review.service'; // nếu bạn tách riêng review API

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
  product = signal<Product | null>(null);
  related: Product[] = [];
  reviews: Comment[] = [];
  activeTab = 'desc';
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private reviewService: ReviewService // hoặc dùng HttpClient trực tiếp nếu chưa có service
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const productId = +id;
      this.loadProduct(productId);
      this.loadRelated(productId);
      this.loadReviews(productId);
    }
  }

  /** 🔹 Load chi tiết sản phẩm */
  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (res) => this.product.set(res),
      error: (err) => console.error('❌ Lỗi load sản phẩm:', err)
    });
  }

  /** 🔹 Load sản phẩm liên quan */
  loadRelated(id: number): void {
    this.productService.getRelatedProducts(id, 4).subscribe({
      next: (res) => this.related = res.items || [],
      error: (err) => console.error('❌ Lỗi load sản phẩm liên quan:', err)
    });
  }

  /** 🔹 Load review */
  loadReviews(id: number): void {
    this.reviewService.getReviewsByProduct(id).subscribe({
      next: (res) => this.reviews = res.items || [],
      error: (err) => console.error('❌ Lỗi load đánh giá:', err)
    });
  }

  /** 🔹 Đổi tab hiển thị */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /** 🔹 Thêm vào giỏ hàng */
  addToCart(p: Product): void {
    console.log('🛒 Add to cart:', p, 'Quantity:', this.quantity);
    // TODO: gọi CartService để thêm vào giỏ hàng
  }

  /** 🔹 Tăng số lượng */
  increaseQuantity(): void {
    const product = this.product();
    if (product && this.quantity < product.stock) {
      this.quantity++;
    }
  }

  /** 🔹 Giảm số lượng */
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /** 🔹 Tạo mảng star để render */
  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  /** 🔹 Tính giá sau khi giảm */
  calculateDiscountPrice(price: number, discountPercent: number): number {
    if (discountPercent && discountPercent > 0) {
      return price * (1 - discountPercent / 100);
    }
    return price;
  }
}
