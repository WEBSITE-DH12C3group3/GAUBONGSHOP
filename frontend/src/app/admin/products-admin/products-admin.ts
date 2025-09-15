import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductAdminService } from '../../shared/services/product-admin.service';
import { CategoryAdminService } from '../../shared/services/category-admin.service';
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

  // Filters
  keyword = '';
  categoryId: number | null = null;
  brandId: number | null = null;

  // Pagination
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  // Modal state
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
    private brandService: BrandAdminService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.searchProducts();
  }

  loadCategories(page: number = 0, size: number = 10) {
    this.categoryService.getAll({ page, size }).subscribe({
      next: (res) => {
        this.categories = res.content;       // ✅ dùng content thay vì items
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.page = res.number;
        this.size = res.size;
      },
      error: (err) => console.error('Lỗi khi tải danh mục:', err)
    });
  }



  // Load thương hiệu
  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (res) => {
        this.brands = res.items || res;
      },
      error: (err) => console.error('Lỗi khi tải thương hiệu:', err)
    });
  }

// Tìm kiếm sản phẩm
searchProducts() {
  this.productService.listPaged(this.keyword, this.categoryId ?? undefined, this.brandId ?? undefined, this.page, this.size)
    .subscribe({
      next: (res: any) => {
        this.products = res.items;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
      },
      error: (err: any) => console.error('Lỗi khi tải sản phẩm:', err)
    });
}


  // Đổi trang
  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.searchProducts();
    }
  }

  // Mở modal thêm sản phẩm
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
  }

  // Mở modal sửa sản phẩm
  openEditModal(product: any) {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.showModal = true;
  }

  // Đóng modal
  closeModal() {
    this.showModal = false;
  }

  // Lưu sản phẩm
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

  // Xóa sản phẩm
  deleteProduct(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.productService.delete(id).subscribe({
        next: () => this.searchProducts(),
        error: (err) => console.error('Lỗi khi xóa sản phẩm:', err)
      });
    }
  }
}
