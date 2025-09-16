import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductAdminService } from '../../shared/services/product-admin.service';
import { CategoryAdminService } from '../../shared/services/category_admin.service';
import { BrandAdminService } from '../../shared/services/brand-admin.service';
import { Product } from '../../models/product.model';
import { Page } from '../../models/page.model';
import { Brand } from '../../models/brand.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, NgOptimizedImage],
  templateUrl: './products-admin.html',
  
  styleUrls: ['./products-admin.css']
})
export class ProductsAdminComponent implements OnInit {

  // dữ liệu
  items: Product[] = [];
  categories: { id:number; name:string }[] = [];
  brands: { id:number; name:string }[] = [];
  assetBase = 'http://localhost:8080';


  // filter
  keyword = '';
  categoryId: number | null = null;
  brandId: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // phân trang
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  // UI state
  loading = false;
  error: string | null = null;

  showModal = false;
  isEdit = false;
  current: Partial<Product> = this.emptyProduct();

  showDetail = false;
  detailItem: Product | null = null;

  constructor(
    private api: ProductAdminService,
    private catAdmin: CategoryAdminService,
    private brandAdmin: BrandAdminService,
    private cdr: ChangeDetectorRef            // ✅ inject CDR
  ) {}cd

    // Helper nối URL ảnh an toàn
  imageUrl(u?: string | null, placeholder = 'https://placehold.co/160x160'): string {
    if (!u || !u.trim()) return placeholder;
    return u.startsWith('http') ? u : this.assetBase + u;
  }

  ngOnInit(): void {
    this.loadFilters();
    this.fetch(0);
  }

  emptyProduct(): Partial<Product> {
    return {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      active: true as any
    } as any;
  }

  loadFilters(): void {
    // lấy tối đa 1000 item cho dropdown (tuỳ dữ liệu thực tế)
    this.catAdmin.getAll(0, 1000).subscribe({
      next: (res: Page<Category>) => {
        this.categories = (res?.content ?? []).map((c: Category) => ({ id: c.id, name: c.name }));
        this.cdr.detectChanges();       // ✅
      },
      error: (e: unknown) => { console.error('Lỗi load categories:', e); this.cdr.detectChanges(); }
    });

    this.brandAdmin.getAll(0, 1000).subscribe({
      next: (res: Page<Brand>) => {
        this.brands = (res?.content ?? []).map((b: Brand) => ({ id: b.id, name: b.name }));
        this.cdr.detectChanges();       // ✅
      },
      error: (e: unknown) => { console.error('Lỗi load brands:', e); this.cdr.detectChanges(); }
    });
  }

  fetch(page = this.page): void {
    this.loading = true; this.error = null;
    this.cdr.detectChanges();           // ✅ phản ánh trạng thái loading sớm

    this.api.listPaged(
      this.keyword || undefined,
      this.categoryId ?? undefined,
      this.brandId ?? undefined,
      page,
      this.size,
      this.minPrice ?? undefined,
      this.maxPrice ?? undefined
    ).subscribe({
      next: (res) => {
        this.items = res.items || [];
        this.totalPages = res.totalPages ?? 0;
        this.totalElements = res.totalElements ?? 0;
        this.page = res.page ?? 0;
        this.size = res.size ?? this.size;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
        this.loading = false;
        this.cdr.detectChanges();       // ✅
      },
      error: (err) => {
        this.error = 'Không thể tải dữ liệu sản phẩm';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();       // ✅
      }
    });
  }

  resetFilters(): void {
    this.keyword = '';
    this.categoryId = null;
    this.brandId = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.cdr.detectChanges();           // ✅
    this.fetch(0);
  }

  openCreate(): void {
    this.isEdit = false;
    this.current = this.emptyProduct();
    this.showModal = true;
    this.cdr.detectChanges();           // ✅
  }

  openEdit(p: Product): void {
    this.isEdit = true;
    this.current = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId ?? this.findCategoryIdByName(p.categoryName),
      brandId: p.brandId ?? this.findBrandIdByName(p.brandName)
    };
    this.showModal = true;
    this.cdr.detectChanges();           // ✅
  }

  openDetail(p: Product): void {
    this.detailItem = null;
    this.showDetail = true;
    this.cdr.detectChanges();           // ✅ mở drawer ngay

    this.api.getDetail(p.id).subscribe({
      next: (d) => { this.detailItem = d; this.cdr.detectChanges(); },   // ✅
      error: (e) => { console.error(e); this.detailItem = p; this.cdr.detectChanges(); } // ✅
    });
  }

  save(): void {
    const body: any = {
      name: this.current.name,
      description: this.current.description,
      price: this.current.price,
      imageUrl: this.current.imageUrl,
      stock: this.current.stock ?? 0,
      categoryId: this.current.categoryId ?? null,
      brandId: this.current.brandId ?? null
    };

    const obs = (this.isEdit && this.current.id)
      ? this.api.update(this.current.id as number, body)
      : this.api.create(body);

    obs.subscribe({
      next: () => {
        this.showModal = false;
        this.cdr.detectChanges();       // ✅ đóng modal ngay
        this.fetch();
      },
      error: (e) => { console.error('Lưu sản phẩm lỗi:', e); this.cdr.detectChanges(); } // ✅
    });
  }

  remove(p: Product): void {
    if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
    this.api.delete(p.id).subscribe({
      next: () => { this.fetch(); /* fetch tự detectChanges ở next */ },
      error: (e) => { console.error('Xoá lỗi:', e); this.cdr.detectChanges(); } // ✅
    });
  }

  private findCategoryIdByName(name?: string | null): number | undefined {
    if (!name) return undefined;
    const found = this.categories.find(c => c.name === name);
    return found?.id;
  }

  private findBrandIdByName(name?: string | null): number | undefined {
    if (!name) return undefined;
    const found = this.brands.find(b => b.name === name);
    return found?.id;
  }
}
