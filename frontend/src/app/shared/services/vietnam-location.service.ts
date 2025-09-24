import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Province { code: string | number; name: string; }
export interface District { code: string | number; name: string; provinceCode?: string | number; }
export interface Ward { code: string | number; name: string; districtCode?: string | number; }

@Injectable({ providedIn: 'root' })
export class VietnamLocationService {
  private readonly v1 = environment.vnApi.provincesBaseV1;
  private readonly vnapp = environment.vnApi.vnappmobBase;

  constructor(private http: HttpClient) {}

  /** ---------- PROVINCES ---------- */
  getProvinces(): Observable<Province[]> {
    // Ưu tiên nguồn provinces.open-api.vn (v1)
    return this.http.get<any[]>(`${this.v1}/p/`).pipe(
      map(list => list.map(p => ({ code: p.code, name: p.name }) as Province)),
      shareReplay(1),
      catchError(() =>
        // Fallback sang VNAppMob
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
    // provinces.open-api.vn v1: /p/{code}?depth=2 => districts trong object
    return this.http.get<any>(`${this.v1}/p/${provinceCode}?depth=2`).pipe(
      map(p => (p?.districts ?? []).map((d: any) => ({
        code: d.code, name: d.name, provinceCode: p.code
      }) as District)),
      catchError(() =>
        // VNAppMob: /province/district/{province_id}
        this.http.get<any>(`${this.vnapp}/province/district/${provinceCode}`).pipe(
          map(res => (res?.results ?? []).map((d: any) => ({
            code: d.district_id, name: d.district_name, provinceCode
          }) as District))
        )
      ),
      shareReplay(1)
    );
  }

  /** ---------- WARDS BY DISTRICT ---------- */
  getWardsByDistrict(districtCode: string | number): Observable<Ward[]> {
    // provinces.open-api.vn v1: /d/{code}?depth=2 => wards trong object
    return this.http.get<any>(`${this.v1}/d/${districtCode}?depth=2`).pipe(
      map(d => (d?.wards ?? []).map((w: any) => ({
        code: w.code, name: w.name, districtCode: d.code
      }) as Ward)),
      catchError(() =>
        // VNAppMob: /province/ward/{district_id}
        this.http.get<any>(`${this.vnapp}/province/ward/${districtCode}`).pipe(
          map(res => (res?.results ?? []).map((w: any) => ({
            code: w.ward_id, name: w.ward_name, districtCode
          }) as Ward))
        )
      ),
      shareReplay(1)
    );
  }

  /** (tuỳ chọn) Tìm tên hiển thị theo code để build địa chỉ đầy đủ */
  getProvinceName(code: string | number) {
    return this.getProvinces().pipe(map(list => list.find(x => `${x.code}` === `${code}`)?.name || ''));
  }
  getDistrictName(pcode: string | number, dcode: string | number) {
    return this.getDistrictsByProvince(pcode).pipe(map(list => list.find(x => `${x.code}` === `${dcode}`)?.name || ''));
  }
  getWardName(dcode: string | number, wcode: string | number) {
    return this.getWardsByDistrict(dcode).pipe(map(list => list.find(x => `${x.code}` === `${wcode}`)?.name || ''));
  }
}
