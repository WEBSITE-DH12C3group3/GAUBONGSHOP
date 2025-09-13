import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categoryId: number | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef   // 👈 để ép Angular update UI
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['category'] ? Number(params['category']) : null;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.isLoading = true;

    if (this.categoryId) {
      this.productService.getProductsByCategory(this.categoryId, 0).subscribe({
        next: (res) => {
          console.log("DEBUG products by category:", res);
          this.products = res.items ?? [];
          this.isLoading = false;
          this.cdr.detectChanges(); // 👈 update view ngay
        },
        error: (err) => {
          console.error('Lỗi khi tải sản phẩm theo danh mục:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.productService.getAllProducts().subscribe({
        next: (res) => {
          console.log("DEBUG all products:", res);
          this.products = res.items ?? [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải tất cả sản phẩm:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
