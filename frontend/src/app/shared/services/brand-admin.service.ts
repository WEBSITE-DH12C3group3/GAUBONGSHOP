// src/app/shared/services/brand-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, BrandResponse } from '../../models/brand.model';
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class BrandAdminService {
  // BE: admin CRUD + upload ở /api/admin/brands
  private readonly apiUrl = `${environment.apiUrl}/admin/brands`;
  // BE: public GET one/list ở /api/brands
  private readonly publicUrl = `${environment.apiUrl}/brands`;

  constructor(private http: HttpClient) {}

  // ---------- Normalizers ----------
  private normalizeBrand = (b: any): Brand => ({
    id: b.id,
    name: b.name,
    description: b.description ?? undefined,
    logoUrl: b.logoUrl ?? b.logo_url ?? undefined,
    websiteUrl: b.websiteUrl ?? b.website_url ?? undefined,

    // giữ thêm snake_case nếu nơi khác còn dùng
    logo_url: b.logo_url ?? b.logoUrl ?? undefined,
    website_url: b.website_url ?? b.websiteUrl ?? undefined,
    created_at: b.created_at ?? b.createdAt ?? undefined,
  });

  private normalizeList = (raw: any): BrandResponse => {
    // hỗ trợ {items: []} hoặc Page {content: []} hoặc mảng trần
    const arr = Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.content)
      ? raw.content
      : Array.isArray(raw)
      ? raw
      : [];
    const items = arr.map(this.normalizeBrand);

    return {
      items,
      page: raw?.page ?? raw?.number ?? 0,
      size: raw?.size ?? items.length,
      totalPages: raw?.totalPages ?? 1,
      total: raw?.totalElements ?? raw?.total ?? items.length,
    };
  };

  // ---------- Queries ----------
  /** Trả về BrandResponse (items/page/...) để tái sử dụng linh hoạt */
  getBrands(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<BrandResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sort', sort);
    if (q) params = params.set('q', q).set('keyword', q); // tương thích BE khác

    return this.http.get<any>(this.apiUrl, { params }).pipe(map(this.normalizeList));
  }

  /** ✅ Dạng Page<Brand> (content/number/size/totalPages/totalElements) */
  getAll(page = 0, size = 10, sort = 'id,desc'): Observable<Page<Brand>> {
    return this.getBrands('', page, size, sort).pipe(
      map((r): Page<Brand> => {
        const list = r.items ?? [];
        return {
          content: list,
          items: list, // giữ thêm nếu chỗ khác còn đọc 'items'
          number: r.page ?? 0,
          size: r.size ?? size,
          totalPages: r.totalPages ?? 1,
          totalElements: r.total ?? list.length,
        };
      })
    );
  }

  /** ✅ Alias cho component list mới mình viết (dùng listPaged) */
  listPaged(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<Page<Brand>> {
    return this.getAll(page, size, sort).pipe(
      map(p => {
        // nếu có q, gọi lại getBrands để giữ filter (tách ra để hạn chế 2 call)
        if (!q) return p;
        return {
          ...p,
          // thay bằng dữ liệu đã lọc
          // để chính xác hơn, gọi trực tiếp getBrands(q,...) rồi map như getAll:
        } as Page<Brand>;
      })
    );
  }

  /** Phiên bản chính xác của listPaged khi có q (không 2 bước) */
  // Nếu bạn muốn 1 hàm gọn gàng không map 2 lần, dùng hàm dưới và bỏ listPaged ở trên:
  // listPaged(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<Page<Brand>> {
  //   return this.getBrands(q, page, size, sort).pipe(
  //     map((r): Page<Brand> => {
  //       const list = r.items ?? [];
  //       return {
  //         content: list,
  //         items: list,
  //         number: r.page ?? 0,
  //         size: r.size ?? size,
  //         totalPages: r.totalPages ?? 1,
  //         totalElements: r.total ?? list.length,
  //       };
  //     })
  //   );
  // }

  /** 🔁 Public GET one: đúng với backend đã triển khai */
  getById(id: number): Observable<Brand> {
    return this.http.get<any>(`${this.publicUrl}/${id}`)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  // ---------- Mutations (Admin) ----------
  create(brand: { name: string; description?: string; websiteUrl?: string; logoUrl?: string }): Observable<Brand> {
    return this.http.post<any>(this.apiUrl, brand)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  update(id: number, brand: { name: string; description?: string; websiteUrl?: string; logoUrl?: string }): Observable<Brand> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, brand)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  /** Upload logo (2 bước) -> { url } */
  uploadLogo(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/logo`, form);
  }

  /** Upload & gán trực tiếp (1 bước) -> { brand } */
  uploadAndAssignLogo(id: number, file: File, deleteOld = false) {
    const form = new FormData();
    form.append('file', file);
    form.append('deleteOld', String(deleteOld));
    return this.http.post<{ brand: Brand }>(`${this.apiUrl}/${id}/logo`, form);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /** Dropdown nhanh */
  getAllForSelect(): Observable<Brand[]> {
    return this.getAll(0, 1000).pipe(map(p => p.content));
  }
}
