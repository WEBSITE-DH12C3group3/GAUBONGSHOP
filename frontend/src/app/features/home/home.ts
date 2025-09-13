import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { CategoryService } from '../../shared/services/category.service';
import { ProductService } from '../../shared/services/product.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  featuredCategories: Category[] = [];
  newProducts: any[] = [];
  isLoading = true;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef   // 👈 inject ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFeaturedCategoriesWithProducts();
    this.loadNewProducts();
  }

  loadFeaturedCategoriesWithProducts() {
    this.categoryService.getFeaturedCategories().subscribe({
      next: (categories) => {
        this.featuredCategories = categories;
        this.isLoading = false;
        this.cdr.detectChanges();   // 👈 ép Angular update view
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục nổi bật:', error);
        this.isLoading = false;
        this.cdr.detectChanges();   // 👈 để view thoát loading
      }
    });
  }

  private async checkCategoryHasProducts(category: Category): Promise<Category | null> {
    try {
      const response = await firstValueFrom(
        this.productService.getProductsByCategory(category.id, 1)
      );
      if (response && response.items && response.items.length > 0) {
        return category;
      }

      return null;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra danh mục ${category.name}:`, error);
      return null;
    }
  }

  loadNewProducts() {
  this.productService.getNewProducts(3).subscribe({
    next: (response) => {
      this.newProducts = response.items || []; // 👈 lấy từ items
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Lỗi khi tải sản phẩm mới:', error);
      this.cdr.detectChanges();
    }
  });
}

}
