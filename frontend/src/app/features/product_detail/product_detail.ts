import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../shared/services/product.service';
import { ReviewService } from '../../shared/services/review.service';
import { FavoriteService } from '../../shared/services/favorite.service';
import { CartService } from '../../shared/services/cart.service';
import { flyToCart } from '../../shared/utils/fly-to-cart';

import { Comment } from '../../models/comment.model';
import { Product } from '../../models/product.model';

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
    private router: Router,
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
    private reviewService: ReviewService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Đồng bộ badge giỏ ngay khi vào trang chi tiết
    this.cartService.refreshCount();

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

  /** 🔹 Yêu thích */
  toggleFavorite(productId: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.isFavorite(productId)) {
      this.favoriteService.removeFavorite(productId).subscribe(() => {
        this.favoriteService.removeSessionFavorite(productId);
        this.cdr.detectChanges();
      });
    } else {
      this.favoriteService.addFavorite(productId).subscribe(() => {
        this.favoriteService.addSessionFavorite(productId);
        this.cdr.detectChanges();
      });
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoriteService.getSessionFavorites().includes(productId);
  }

  /** 🔹 Thêm vào giỏ hàng (kèm hiệu ứng bay) */
  addToCart(ev?: MouseEvent, fromImgEl?: HTMLImageElement): void {
    const p = this.product();
    if (!p?.id) return;

    // Chặn điều hướng nếu button nằm trong thẻ <a>
    ev?.preventDefault();
    ev?.stopPropagation();

    // Hiệu ứng bay vào giỏ (ưu tiên ảnh lớn)
    try {
      const srcEl = (ev?.currentTarget as HTMLElement) ?? undefined;
      if (fromImgEl) {
        flyToCart(fromImgEl);
      } else if (srcEl) {
        flyToCart(srcEl);
      }
    } catch {}

    // Truyền META để giỏ hàng guest hiện đủ thông tin (name/price/image)
    const meta = { name: p.name, price: p.price as any, imageUrl: p.imageUrl };

    this.cartService.add(p.id, Math.max(1, this.quantity || 1), meta).subscribe({
      next: () => {}, // count$ cập nhật trong service
      error: (e) => console.error('Không thêm được vào giỏ:', e),
    });
  }

  /** 🔹 Mua ngay: thêm vào giỏ (có meta) và chuyển thẳng /cart */
  buyNow(): void {
    const p = this.product();
    if (!p?.id) return;

    const meta = { name: p.name, price: p.price as any, imageUrl: p.imageUrl };

    this.cartService.add(p.id, Math.max(1, this.quantity || 1), meta).subscribe({
      next: () => this.router.navigate(['/cart']),
      error: (e) => console.error('Mua ngay thất bại:', e),
    });
  }

  /** 🔹 Tăng/giảm số lượng */
  increaseQuantity(): void {
    const p = this.product();
    if (p && this.quantity < (p.stock ?? Number.MAX_SAFE_INTEGER)) {
      this.quantity++;
    }
  }
  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
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
