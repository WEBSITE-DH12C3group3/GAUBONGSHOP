import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductAdminService } from '../../shared/services/product-admin.service';
import { CategoryAdminService } from '../../shared/services/category_admin.service';
import { BrandAdminService } from '../../shared/services/brand-admin.service';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './products-admin.html',
  styleUrls: ['./products-admin.css']
})
export class ProductsAdminComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  brands: any[] = [];

  keyword = '';
  categoryId: number | null = null;
  brandId: number | null = null;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  showModal = false;
  isEditMode = false;
  currentProduct: any = {
    name: '',
    categoryId: null,
    brandId: null,
    price: 0,
    stock: 0,
    description: ''
  };

  constructor(
    private productService: ProductAdminService,
    private categoryService: CategoryAdminService,
    private brandService: BrandAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.searchProducts();
  }

  loadCategories(page: number = 0, size: number = 10) {
    this.categoryService.getAll(page, size).subscribe({
      next: (res) => {
        this.categories = res.content;
        this.cdr.detectChanges();   // 👈 đảm bảo UI cập nhật
      },
      error: (err) => console.error('Lỗi khi tải danh mục:', err)
    });
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (res) => {
        this.brands = res.items || res;
        this.cdr.detectChanges();   // 👈
      },
      error: (err) => console.error('Lỗi khi tải thương hiệu:', err)
    });
  }

  searchProducts() {
    this.productService.listPaged(
      this.keyword,
      this.categoryId ?? undefined,
      this.brandId ?? undefined,
      this.page,
      this.size
    ).subscribe({
      next: (res) => {
        this.products = res.items;
        this.page = res.page;
        this.size = res.size;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
        this.cdr.detectChanges();   // 👈
      },
      error: (err) => console.error('Lỗi khi tải sản phẩm:', err)
    });
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.searchProducts();
    }
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentProduct = {
      name: '',
      categoryId: null,
      brandId: null,
      price: 0,
      stock: 0,
      description: ''
    };
    this.showModal = true;
    this.cdr.detectChanges();   // 👈
  }

  openEditModal(product: any) {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.showModal = true;
    this.cdr.detectChanges();   // 👈
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();   // 👈
  }

  saveProduct() {
    if (this.isEditMode) {
      this.productService.update(this.currentProduct.id, this.currentProduct).subscribe({
        next: () => {
          this.closeModal();
          this.searchProducts();
        },
        error: (err) => console.error('Lỗi khi cập nhật sản phẩm:', err)
      });
    } else {
      this.productService.create(this.currentProduct).subscribe({
        next: () => {
          this.closeModal();
          this.searchProducts();
        },
        error: (err) => console.error('Lỗi khi thêm sản phẩm:', err)
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.searchProducts();
          this.cdr.detectChanges();   // 👈
        },
        error: (err) => console.error('Lỗi khi xóa sản phẩm:', err)
      });
    }
  }
}
