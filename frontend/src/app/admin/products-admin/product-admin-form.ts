import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductAdminService } from '../../shared/services/product-admin.service';
import { CategoryAdminService } from '../../shared/services/category_admin.service';
import { BrandAdminService } from '../../shared/services/brand-admin.service';

import { Page } from '../../models/page.model';
import { Product, ProductAttribute } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import { UploadService } from '../../shared/services/upload.service';
interface AttrRow {
  attributeId: number | null;
  attributeName?: string;
  value: string;
}

@Component({
  selector: 'app-product-admin-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, NgOptimizedImage],
  templateUrl: './product-admin-form.html',
  styleUrls: ['./product-admin-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductAdminFormComponent implements OnInit {
  assetBase = 'http://localhost:8080';

  isEdit = false;
  uploading = false;
  id?: number;
     
  // form model
  product: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    categoryId: null as any,
    brandId: null as any
  };

  // dropdowns
  categories: { id:number; name:string }[] = [];
  brands: { id:number; name:string }[] = [];
  attributesCatalog: { id: number; name: string }[] = [];

  // dynamic attributes rows
  attrRows: AttrRow[] = [];

  // ui
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private api: ProductAdminService,
    private catAdmin: CategoryAdminService,
    private uploadService: UploadService,
    private brandAdmin: BrandAdminService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) || undefined;
    this.isEdit = !!this.id;

    this.loadDropdowns();

    if (this.isEdit && this.id) {
      this.loading = true; this.cdr.detectChanges();
      this.api.getDetail(this.id).subscribe({
        next: (d: Product) => {
          this.product = {
            id: d.id,
            name: d.name,
            description: d.description,
            price: d.price,
            stock: d.stock,
            imageUrl: d.imageUrl,
            categoryId: d.categoryId ?? this.findIdByName(this.categories, d.categoryName),
            brandId: d.brandId ?? this.findIdByName(this.brands, d.brandName)
          };
          this.attrRows = (d.attributes ?? []).map(a => ({
            attributeId: a.attributeId,
            attributeName: a.attributeName,
            value: a.value
          }));
          this.loading = false; this.cdr.detectChanges();
        },
        error: (e) => { console.error(e); this.loading = false; this.cdr.detectChanges(); }
      });
    } else {
      // new
      this.attrRows = [{ attributeId: null, value: '' }];
    }
  }

  private loadDropdowns(): void {
    // Categories
    this.catAdmin.getAll(0, 1000).subscribe({
    next: (res: Page<Category>) => {
        const list = res.items ?? res.content ?? [];
        this.categories = list.map((c: Category) => ({ id: c.id, name: c.name }));
        this.cdr.detectChanges();
    },
    error: (e: unknown) => console.error(e)
    });

    // Brands
    this.brandAdmin.getAll(0, 1000).subscribe({
    next: (res: Page<Brand>) => {
        const list = res.items ?? res.content ?? [];
        this.brands = list.map((b: Brand) => ({ id: b.id, name: b.name }));
        this.cdr.detectChanges();
    },
    error: (e: unknown) => console.error(e)
    });

    // Attributes
    this.api.getAttributes().subscribe({
    next: (raw: any) => { // 👈 gõ kiểu any để tránh narrow thành never
        const arr = Array.isArray(raw)
        ? raw
        : (raw?.items ?? raw?.content ?? []);
        this.attributesCatalog = arr.map((x: any) => ({
        id: Number(x.id ?? x.attributeId),
        name: String(x.name ?? x.attributeName ?? '')
        }));
        this.cdr.detectChanges();
    },
    error: (e: unknown) => console.error(e)
    });

  }

  // helpers
  imageUrl(u?: string | null, placeholder = 'https://placehold.co/160x160'): string {
    if (!u || !u.trim()) return placeholder;
    return u.startsWith('http') ? u : this.assetBase + u;
  }

  private findIdByName(list: {id:number;name:string}[], name?: string|null): number|undefined {
    if (!name) return undefined;
    return list.find(x => x.name === name)?.id ?? undefined;
  }

  addAttrRow(): void {
    this.attrRows.push({ attributeId: null, value: '' });
    this.cdr.detectChanges();
  }

  removeAttrRow(i: number): void {
    this.attrRows.splice(i, 1);
    if (this.attrRows.length === 0) this.attrRows.push({ attributeId: null, value: '' });
    this.cdr.detectChanges();
  }

  onAttrChange(row: AttrRow): void {
    row.attributeName = this.attributesCatalog.find(a => a.id === row.attributeId)?.name;
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    this.uploading = true; this.cdr.detectChanges();
    this.uploadService.upload(file).subscribe({
      next: (res) => {
        // BE trả "/uploads/xxx.jpg" -> bind thẳng
        this.product.imageUrl = res.url;
        this.uploading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error(e);
        this.uploading = false;
        this.cdr.detectChanges();
        // có thể show toast ở đây
      }
    });
  }

  

  save(): void {
    // validate cơ bản
    if (!this.product.name || !this.product.price || !this.product.categoryId || !this.product.brandId) {
      this.error = 'Vui lòng nhập tên, giá và chọn danh mục/brand.'; this.cdr.detectChanges(); return;
    }

    const attrs = this.attrRows
      .filter(r => r.attributeId && (r.value ?? '').toString().trim().length > 0)
      .map(r => ({ attributeId: r.attributeId, value: r.value }));

    const body: any = {
      name: this.product.name,
      description: this.product.description,
      price: this.product.price,
      imageUrl: this.product.imageUrl,
      stock: this.product.stock ?? 0,
      categoryId: this.product.categoryId,
      brandId: this.product.brandId,
      attributes: attrs
    };

    this.saving = true; this.cdr.detectChanges();

    const obs = this.isEdit && this.id
      ? this.api.updateFull(this.id, body)      // ✅ thử update full (fallback update cơ bản)
      : this.api.createFull(body);              // ✅ tạo mới full

    obs.subscribe({
      next: () => {
        this.saving = false; this.cdr.detectChanges();
        this.router.navigate(['/admin/products']);
      },
      error: (e) => { console.error(e); this.saving = false; this.error = 'Lưu thất bại'; this.cdr.detectChanges(); }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
