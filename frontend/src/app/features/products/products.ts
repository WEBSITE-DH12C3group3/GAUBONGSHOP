// products.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService } from '../../shared/services/category.service';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  paginatedProducts: any[] = [];
  categories: any[] = [];
  categoryId: number | null = null;
  selectedCategory: any = null;
  isLoading = true;
  viewMode: 'grid' | 'list' = 'grid';
  showSortDropdown = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;
  
  // Filters
  selectedCategories: number[] = [];
  selectedPriceRange: string | null = null;
  selectedRating: number | null = null;
  
  // Sort options
  currentSort = 'newest';
  sortOptions = [
    { value: 'newest', text: 'Mới nhất' },
    { value: 'price-asc', text: 'Giá: Thấp đến cao' },
    { value: 'price-desc', text: 'Giá: Cao đến thấp' },
    { value: 'name-asc', text: 'Tên: A-Z' },
    { value: 'name-desc', text: 'Tên: Z-A' }
  ];
  
  priceRanges = [
    { id: '0-100000', label: 'Dưới 100.000₫' },
    { id: '100000-500000', label: '100.000₫ - 500.000₫' },
    { id: '500000-1000000', label: '500.000₫ - 1.000.000₫' },
    { id: '1000000+', label: 'Trên 1.000.000₫' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['category'] ? Number(params['category']) : null;
      this.loadProducts();
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.content || [];

        if (this.categoryId) {
          this.selectedCategory = this.categories.find(c => c.id === this.categoryId) || null;
          this.selectedCategories = [this.categoryId];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
        this.categories = [];
      }
    });
  }



  loadProducts() {
    this.isLoading = true;

    if (this.categoryId) {
      this.productService.getProductsByCategory(this.categoryId, 0).subscribe({
        next: (res) => {
          this.products = res.items ?? [];
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
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
          this.products = res.items ?? [];
          this.applyFilters();
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

  applyFilters() {
    // Apply category filter
    if (this.selectedCategories.length > 0) {
      this.filteredProducts = this.products.filter(p => 
        this.selectedCategories.includes(p.categoryId)
      );
    } else {
      this.filteredProducts = [...this.products];
    }
    
    // Apply price filter
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-');
      this.filteredProducts = this.filteredProducts.filter(p => {
        if (max === '+') {
          return p.price >= parseInt(min);
        } else {
          return p.price >= parseInt(min) && p.price <= parseInt(max);
        }
      });
    }
    
    // Apply rating filter
    if (this.selectedRating) {
      this.filteredProducts = this.filteredProducts.filter(p => 
        (p.rating || 4) >= this.selectedRating!
      );
    }
    
    // Apply sorting
    this.applySorting();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.updatePaginatedProducts();
  }

  applySorting() {
    switch (this.currentSort) {
      case 'newest':
        this.filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }

  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Pagination methods
  setPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Filter methods
  toggleCategoryFilter(categoryId: number) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.applyFilters();
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  selectPriceRange(rangeId: string) {
    this.selectedPriceRange = rangeId;
    this.applyFilters();
  }

  selectRating(rating: number) {
    this.selectedRating = rating;
    this.applyFilters();
  }

  clearFilters() {
    this.selectedCategories = [];
    this.selectedPriceRange = null;
    this.selectedRating = null;
    this.applyFilters();
  }

  // Sort methods
  toggleSortDropdown() {
    this.showSortDropdown = !this.showSortDropdown;
  }

  changeSort(sortValue: string) {
    this.currentSort = sortValue;
    this.showSortDropdown = false;
    this.applyFilters();
  }

  getSortOptionText(): string {
    const option = this.sortOptions.find(o => o.value === this.currentSort);
    return option ? option.text : 'Mới nhất';
  }

  // View mode methods
  changeViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // Helper methods
  getStarsArray(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star');
    }
    
    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt');
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('far fa-star');
    }
    
    return stars;
  }
}