import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserAddress {
  id?: number;
  userId?: number;
  label?: string;
  receiverName: string;
  phone: string;
  provinceCode: string; districtCode: string; wardCode: string;
  addressLine: string;
  latitude?: number; longitude?: number;
  isDefault?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AddressBookService {
  private base = `${environment.apiUrl}/addresses`;
  constructor(private http: HttpClient) {}

  list(): Observable<UserAddress[]> { return this.http.get<UserAddress[]>(this.base); }
  create(addr: UserAddress): Observable<UserAddress> { return this.http.post<UserAddress>(this.base, addr); }
  setDefault(id: number): Observable<void> { return this.http.put<void>(`${this.base}/${id}/default`, {}); }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}