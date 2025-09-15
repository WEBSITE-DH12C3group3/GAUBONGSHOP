// src/app/shared/services/brand-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, BrandResponse } from '../../models/brand.model';
// ⬇️ thêm import Page nếu chưa có
import { Page } from '../../models/page.model';

@Injectable({ providedIn: 'root' })
export class BrandAdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin/brands`;

  constructor(private http: HttpClient) {}

  private normalizeBrand = (b: any): Brand => ({
    id: b.id,
    name: b.name,
    description: b.description ?? undefined,
    logoUrl: b.logoUrl ?? b.logo_url ?? undefined,
    websiteUrl: b.websiteUrl ?? b.website_url ?? undefined,
    // giữ thêm snake_case để tương thích nơi khác nếu cần
    logo_url: b.logo_url ?? b.logoUrl ?? undefined,
    website_url: b.website_url ?? b.websiteUrl ?? undefined,
    created_at: b.created_at ?? b.createdAt ?? undefined,
  });

  private normalizeList = (raw: any): BrandResponse => {
    // Hỗ trợ cả {items: []} lẫn Page Spring {content: []}
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

  /** Search/phan trang theo style BrandResponse (items/page/...) */
  getBrands(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<BrandResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sort', sort);
    // gửi cả q lẫn keyword để tương thích các BE khác nhau
    if (q) { params = params.set('q', q).set('keyword', q); }

    return this.http.get<any>(this.apiUrl, { params }).pipe(map(this.normalizeList));
  }

  /** ✅ Hàm GET dạng Page<Brand> để component dùng res.content */
getAll(page = 0, size = 10, sort = 'id,desc'): Observable<Page<Brand>> {
  return this.getBrands('', page, size, sort).pipe(
    map((r): Page<Brand> => {
      const list = r.items ?? [];
      return {
        content: list,                   // ✅ bắt buộc
        items: list,                     // ✅ bắt buộc
        number: r.page ?? 0,
        size: r.size ?? size,
        totalPages: r.totalPages ?? 1,
        totalElements: r.total ?? list.length
      };
    })
  );
}

  getById(id: number): Observable<Brand> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  create(brand: { name: string; description?: string; websiteUrl?: string; logoUrl?: string }): Observable<Brand> {
    return this.http.post<any>(this.apiUrl, brand)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  update(id: number, brand: { name: string; description?: string; websiteUrl?: string; logoUrl?: string }): Observable<Brand> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, brand)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /** Tiện ích: lấy nhanh list lớn cho dropdown */
  getAllForSelect(): Observable<Brand[]> {
    return this.getAll(0, 1000).pipe(map(p => p.content));
  }
}
