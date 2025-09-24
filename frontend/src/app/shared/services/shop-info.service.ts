import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShopInfoService {
  private base = `${environment.apiUrl}/public/shop`;

  constructor(private http: HttpClient) {}

  getOrigin(): Observable<{ lat:number; lng:number; address?:string }> {
    return this.http.get<{lat:number; lng:number; address?:string}>(`${this.base}/origin`);
  }
}
