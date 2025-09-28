import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Province { code: string | number; name: string; }
export interface District { code: string | number; name: string; provinceCode?: string | number; }
export interface Ward { code: string | number; name: string; districtCode?: string | number; }

@Injectable({ providedIn: 'root' })
export class VietnamLocationService {
  private readonly v1 = environment.vnApi.provincesBaseV1;   // ví dụ: https://provinces.open-api.vn/api
  private readonly vnapp = environment.vnApi.vnappmobBase;   // ví dụ: https://vapi.vnappmob.com/api

  constructor(private http: HttpClient) {}

  /** ---------- PROVINCES ---------- */
  getProvinces(): Observable<Province[]> {
    // Ưu tiên nguồn provinces.open-api.vn (v1)
    return this.http.get<any[]>(`${this.v1}/p/`).pipe(
      map(list => (list ?? []).map(p => ({ code: p.code, name: p.name }) as Province)),
      shareReplay(1),
      catchError(() =>
        // Fallback VNAppMob
        this.http.get<any>(`${this.vnapp}/province`).pipe(
          map(res => (res?.results ?? []).map((p: any) => ({
            code: p.province_id, name: p.province_name
          }) as Province)),
          shareReplay(1)
        )
      )
    );
  }

  /** ---------- DISTRICTS BY PROVINCE ---------- */
  getDistrictsByProvince(provinceCode: string | number): Observable<District[]> {
    const code = String(provinceCode);
    // provinces.open-api.vn v1: /p/{code}?depth=2 => districts trong object
    return this.http.get<any>(`${this.v1}/p/${code}?depth=2`).pipe(
      map(p => (p?.districts ?? []).map((d: any) => ({
        code: d.code, name: d.name, provinceCode: p?.code ?? code
      }) as District)),
      catchError(() =>
        // VNAppMob: /province/district/{province_id}
        this.http.get<any>(`${this.vnapp}/province/district/${code}`).pipe(
          map(res => (res?.results ?? []).map((d: any) => ({
            code: d.district_id, name: d.district_name, provinceCode: code
          }) as District))
        )
      ),
      shareReplay(1)
    );
  }

  /** ---------- WARDS BY DISTRICT ---------- */
  getWardsByDistrict(districtCode: string | number): Observable<Ward[]> {
    const code = String(districtCode);
    // provinces.open-api.vn v1: /d/{code}?depth=2 => wards trong object
    return this.http.get<any>(`${this.v1}/d/${code}?depth=2`).pipe(
      map(d => (d?.wards ?? []).map((w: any) => ({
        code: w.code, name: w.name, districtCode: d?.code ?? code
      }) as Ward)),
      catchError(() =>
        // VNAppMob: /province/ward/{district_id}
        this.http.get<any>(`${this.vnapp}/province/ward/${code}`).pipe(
          map(res => (res?.results ?? []).map((w: any) => ({
            code: w.ward_id, name: w.ward_name, districtCode: code
          }) as Ward))
        )
      ),
      shareReplay(1)
    );
  }

  /** ---------- WRAPPERS để khớp với component ---------- */
  // Component đang gọi 'getDistricts' & 'getWards' qua callVnLoc
  getDistricts(provinceCode: string | number) {
    return this.getDistrictsByProvince(provinceCode);
  }
  getWards(districtCode: string | number) {
    return this.getWardsByDistrict(districtCode);
  }

  /** (tuỳ chọn) Lấy tên hiển thị theo code */
  getProvinceName(code: string | number) {
    const c = String(code);
    return this.getProvinces().pipe(map(list => list.find(x => String(x.code) === c)?.name || ''));
  }
  getDistrictName(pcode: string | number, dcode: string | number) {
    const pc = String(pcode), dc = String(dcode);
    return this.getDistrictsByProvince(pc).pipe(map(list => list.find(x => String(x.code) === dc)?.name || ''));
  }
  getWardName(dcode: string | number, wcode: string | number) {
    const dc = String(dcode), wc = String(wcode);
    return this.getWardsByDistrict(dc).pipe(map(list => list.find(x => String(x.code) === wc)?.name || ''));
  }
}
