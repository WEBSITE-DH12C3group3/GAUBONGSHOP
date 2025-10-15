import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AddressMapPickerComponent } from '../../shared/components/address-map-picker.component';
import { AddressSuggestInputComponent } from '../../shared/components/address-suggest-input.component';
import { AddressBookSelectComponent } from '../../shared/components/address-book-select.component';

import { CartService } from '../../shared/services/cart.service';
import { ShopInfoService } from '../../shared/services/shop-info.service';
import { VietnamLocationService, Province, District, Ward } from '../../shared/services/vietnam-location.service';
import { PaymentService } from '../../shared/services/payment.service';
import {
  ShippingPublicService,
  ShippingQuoteRequest,
  PreviewShippingResponse,
} from '../../shared/services/shipping-public.service';

import { OrderClientService, CreateOrderRequest } from '../../shared/services/order-client.service';
import { GeoService, AddressComponents, SuggestItem } from '../../shared/services/geo.service';
import { AddressBookService, UserAddress } from '../../shared/services/address-book.service';

type CartItem = {
  productId: number;
  quantity: number;
  price: number;
  weightKgPerItem?: number | null;
  name?: string;
};

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    AddressMapPickerComponent, AddressSuggestInputComponent, AddressBookSelectComponent,
  ],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CheckoutPageComponent implements OnInit {
  cart?: {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
    selectedItems: CartItem[];
    selectedAmount: number;
  };

  origin?: { lat: number; lng: number; address?: string };
  showMap = false;
  distanceKmPreview: number | null = null;

  addressForm!: FormGroup;
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;
  noteForm!: FormGroup;

  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  loadingProv = false;
  loadingDist = false;
  loadingWard = false;

  loadingPreview = false;
  preview: PreviewShippingResponse | null = null;

  subtotal = 0;
  weightKg = 0;

  placing = false;
  errMsg?: string;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private cartSvc: CartService,
    private shipSvc: ShippingPublicService,
    private orderSvc: OrderClientService,
    private vnLoc: VietnamLocationService,
    private geo: GeoService,
    private addrBook: AddressBookService,
    private shopInfo: ShopInfoService,
    private payment: PaymentService
  ) {}

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      receiverName: ['', [Validators.required, Validators.maxLength(120)]],
      phone: ['', [Validators.required, Validators.pattern(/^0\d{9,10}$/)]],
      provinceCode: ['', Validators.required],
      districtCode: ['', Validators.required],
      wardCode: ['', Validators.required],
      addressLine: ['', [Validators.required, Validators.maxLength(255)]],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
    });

    this.shippingForm = this.fb.group({ voucherCode: [''] });
    this.paymentForm = this.fb.group({ method: ['COD', Validators.required] });
    this.noteForm = this.fb.group({ note: [''] });

    this.shopInfo.getOrigin().subscribe(o => { this.origin = o; this.cdr.detectChanges(); });

    this.loadCart();
    this.loadProvinces();

    // Tỉnh -> nạp quận
    this.addressForm.get('provinceCode')!.valueChanges.subscribe((code: string | number) => {
      this.addressForm.patchValue({ districtCode: '', wardCode: '' }, { emitEvent: false });
      this.districts = []; this.wards = [];
      if (code !== null && code !== undefined && `${code}` !== '') {
        this.loadDistricts$(`${code}`).subscribe(list => { this.districts = list ?? []; this.cdr.detectChanges(); });
      }
      this.tryPreview();
    });

    // Quận -> nạp phường
    this.addressForm.get('districtCode')!.valueChanges.subscribe((code: string | number) => {
      this.addressForm.patchValue({ wardCode: '' }, { emitEvent: false });
      this.wards = [];
      if (code !== null && code !== undefined && `${code}` !== '') {
        this.loadWards$(`${code}`).subscribe(list => { this.wards = list ?? []; this.cdr.detectChanges(); });
      }
      this.tryPreview();
    });

    // Auto preview
    this.addressForm.valueChanges.subscribe(() => this.tryPreview());
    this.shippingForm.valueChanges.subscribe(() => this.tryPreview());
  }

  private loadCart(): void {
    const snap = (this.cartSvc as any).getSnapshot?.();
    if (snap) this.applyCartSummary(snap);
    this.cartSvc.getSummary().subscribe((summary: any) => this.applyCartSummary(summary));
  }

  private applyCartSummary(resp: any) {
    const items: CartItem[] = (resp.selectedItems ?? resp.items ?? []) as CartItem[];
    const amount = (resp.selectedAmount ?? resp.totalAmount ?? 0) as number;

    this.cart = {
      items: resp.items ?? [],
      totalQuantity: resp.totalQuantity ?? 0,
      totalAmount: resp.totalAmount ?? 0,
      selectedItems: items,
      selectedAmount: amount,
    };

    this.subtotal = items.reduce((s, it) => s + (it.price ?? 0) * (it.quantity ?? 0), 0);
    this.weightKg = items.reduce((s, it) => s + (it.weightKgPerItem ?? 0) * (it.quantity ?? 0), 0);
    if (this.weightKg <= 0) {
      const qty = items.reduce((s, it) => s + (it.quantity ?? 0), 0);
      this.weightKg = qty * 0.2;
    }

    this.cdr.detectChanges();
    this.tryPreview();
  }

  openMapPicker() { this.showMap = true; this.cdr.detectChanges(); }
  onMapCancel() { this.showMap = false; this.cdr.detectChanges(); }

  onMapPicked(e: { lat: number; lng: number; address?: string }) {
    this.showMap = false;
    this.addressForm.patchValue({ lat: e.lat, lng: e.lng }, { emitEvent: true });

    if (this.origin?.lat != null && this.origin?.lng != null) {
      this.distanceKmPreview = this.haversineKm(this.origin.lat, this.origin.lng, e.lat, e.lng);
    }

    this.geo.reverse(e.lat, e.lng).subscribe({
      next: (a: AddressComponents) => {
        const addressLine = a.street || a.fullAddress || e.address || '';
        const provCode = this.codeByName(this.provinces, a.province);
        if (!provCode) {
          this.addressForm.patchValue({ addressLine }, { emitEvent: false });
          this.tryPreview();
          return;
        }

        this.addressForm.patchValue({ provinceCode: provCode, districtCode: '', wardCode: '' }, { emitEvent: false });

        this.loadDistricts$(provCode).subscribe(dists => {
          this.districts = dists ?? [];
          const distCode = this.codeByName(this.districts, a.district);
          if (!distCode) {
            this.addressForm.patchValue({ addressLine }, { emitEvent: false });
            this.tryPreview();
            return;
          }

          this.addressForm.patchValue({ districtCode: distCode, wardCode: '' }, { emitEvent: false });

          this.loadWards$(distCode).subscribe(ws => {
            this.wards = ws ?? [];
            const wardCode = this.codeByName(this.wards, a.ward);
            if (wardCode) this.addressForm.patchValue({ wardCode }, { emitEvent: false });

            this.addressForm.patchValue({ addressLine }, { emitEvent: false });
            this.tryPreview();
            this.cdr.detectChanges();
          });
        });
      },
      error: () => {
        if (e.address && !this.addressForm.get('addressLine')!.value) {
          this.addressForm.patchValue({ addressLine: e.address }, { emitEvent: false });
        }
        this.tryPreview();
      },
    });
  }

  onSuggestPicked(it: SuggestItem) {
    if (it.lat != null && it.lng != null) {
      this.addressForm.patchValue({ lat: it.lat, lng: it.lng }, { emitEvent: false });
    }
    const addressLine = it.street || it.fullAddress || '';
    const pCode = this.codeByName(this.provinces, it.province);
    if (!pCode) {
      this.addressForm.patchValue({ addressLine }, { emitEvent: false });
      this.tryPreview();
      return;
    }

    this.addressForm.patchValue({ provinceCode: pCode, districtCode: '', wardCode: '' }, { emitEvent: false });

    this.loadDistricts$(pCode).subscribe(dists => {
      this.districts = dists ?? [];
      const dCode = this.codeByName(this.districts, it.district);
      if (!dCode) {
        this.addressForm.patchValue({ addressLine }, { emitEvent: false });
        this.tryPreview();
        return;
      }

      this.addressForm.patchValue({ districtCode: dCode, wardCode: '' }, { emitEvent: false });

      this.loadWards$(dCode).subscribe(ws => {
        this.wards = ws ?? [];
        const wCode = this.codeByName(this.wards, it.ward);
        if (wCode) this.addressForm.patchValue({ wardCode: wCode }, { emitEvent: false });

        this.addressForm.patchValue({ addressLine }, { emitEvent: false });
        this.tryPreview();
        this.cdr.detectChanges();
      });
    });
  }

  saveAddress(): void {
    const f = this.addressForm.value;
    const payload: UserAddress = {
      receiverName: f.receiverName,
      phone: f.phone,
      provinceCode: f.provinceCode,
      districtCode: f.districtCode,
      wardCode: f.wardCode,
      addressLine: f.addressLine,
      latitude: f.lat ?? undefined,
      longitude: f.lng ?? undefined,
      isDefault: false,
    };
    this.addrBook.create(payload).subscribe({ next: () => {} });
  }

  onChooseAddress(a: UserAddress) {
    this.addressForm.patchValue({
      receiverName: a.receiverName,
      phone: a.phone,
      provinceCode: a.provinceCode,
      districtCode: a.districtCode,
      wardCode: a.wardCode,
      addressLine: a.addressLine,
      lat: a.latitude ?? null,
      lng: a.longitude ?? null,
    }, { emitEvent: true });
    this.tryPreview();
  }

  /** Gọi VietnamLocationService với các tên hàm khả dĩ (Observable hoặc Promise đều OK) */
  private callVnLoc<T>(candidates: string[], ...args: any[]): Observable<T> {
    for (const name of candidates) {
      const fn = (this.vnLoc as any)[name];
      if (typeof fn === 'function') {
        const ret = fn.apply(this.vnLoc, args);
        if (ret && typeof ret.subscribe === 'function') return ret as Observable<T>;
        return from(Promise.resolve(ret)) as Observable<T>;
      }
    }
    console.error('VietnamLocationService missing methods:', candidates);
    return of([] as any as T);
  }

  loadProvinces() {
    this.loadingProv = true;
    this.vnLoc.getProvinces()
      .pipe(finalize(() => { this.loadingProv = false; this.cdr.detectChanges(); }))
      .subscribe(list => { this.provinces = list ?? []; this.cdr.detectChanges(); });
  }

  /** giữ list ổn định khi render */
  trackByCode = (_: number, item: { code: string | number }) => String(item.code);

  /** ⚠️ Quan trọng: luôn truyền STRING code vào service để tránh lệch kiểu */
  loadDistricts$(provinceCode: string) {
    this.loadingDist = true;
    this.districts = [];
    this.wards = [];
    const code = String(provinceCode); // <— luôn là string
    return this.callVnLoc<District[]>(
      ['getDistricts', 'listDistricts', 'fetchDistricts'],
      code
    ).pipe(finalize(() => { this.loadingDist = false; this.cdr.detectChanges(); }));
  }

  loadWards$(districtCode: string) {
    this.loadingWard = true;
    this.wards = [];
    const code = String(districtCode); // <— luôn là string
    return this.callVnLoc<Ward[]>(
      ['getWards', 'listWards', 'fetchWards'],
      code
    ).pipe(finalize(() => { this.loadingWard = false; this.cdr.detectChanges(); }));
  }

  private canPreview(): boolean {
    const f = this.addressForm.value;
    return !!(this.subtotal >= 0 && this.weightKg >= 0 && f.lat != null && f.lng != null);
  }

  tryPreview() {
    if (!this.cart || !this.canPreview()) return;

    const f = this.addressForm.value;
    const lat = Number(f.lat);
    const lng = Number(f.lng);

    const req: ShippingQuoteRequest = {
      orderSubtotal: this.subtotal,
      weightKg: this.weightKg,
      destLat: lat,
      destLng: lng,
      province: this.provinceName || undefined,
      voucherCode: (this.shippingForm.value.voucherCode || '').trim() || undefined,
      carrierCode: undefined,
      serviceCode: undefined,
    };

    this.loadingPreview = true; this.errMsg = undefined; this.cdr.detectChanges();
    this.shipSvc.previewShipping(req)
      .pipe(finalize(() => { this.loadingPreview = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (q) => { this.preview = q; this.cdr.detectChanges(); },
        error: (err) => {
          this.preview = null;
          this.errMsg = err?.error?.error || 'Không tính được phí vận chuyển';
          this.cdr.detectChanges();
        },
      });
  }

  itemsAmount(): number { return this.subtotal; }
  shippingFee(): number { return this.preview?.finalFee ?? 0; }
  totalToPay(): number { return this.itemsAmount() + this.shippingFee(); }
  isAddressValid(): boolean { return this.addressForm.valid; }

placeOrder() {
  if (!this.cart || !this.preview) {
    this.errMsg = 'Vui lòng chọn vị trí và tính phí vận chuyển.'; 
    return;
  }
  if (this.addressForm.invalid) { 
    this.addressForm.markAllAsTouched(); 
    return; 
  }

  const f = this.addressForm.value;
  const items = (this.cart.selectedItems || []).map(it => ({
    productId: it.productId,
    quantity: it.quantity,
    weightKgPerItem: it.weightKgPerItem ?? 0.2,
  }));

  const body: CreateOrderRequest = {
    receiverName: f.receiverName,
    phone: f.phone,
    addressLine: `${f.addressLine}`,
    province: this.provinceName,
    voucherCode: (this.shippingForm.value.voucherCode || '').trim() || undefined,
    items,
    destLat: Number(f.lat),
    destLng: Number(f.lng),
  };

  this.placing = true; this.errMsg = undefined; this.cdr.detectChanges();

  this.orderSvc.create(body)
    .pipe(finalize(() => { this.placing = false; this.cdr.detectChanges(); }))
    .subscribe({
      next: (res: any) => {
        // TÍNH SỐ CHẮC CHẮN
        const itemsAmount = Number(
          this.cart?.selectedAmount ?? this.cart?.totalAmount ?? this.subtotal ?? 0
        );
        const shippingFee = Number(this.preview?.finalFee ?? 0);
        const total = Number(itemsAmount + shippingFee);

        const successPayload = {
          id: res?.id,
          code: res?.code ?? res?.id,
          total,
          shippingFee,
          itemsAmount,
          receiverName: f.receiverName,
          phone: f.phone,
          addressLine: f.addressLine,
          province: this.provinceName,
          note: this.noteForm.value?.note,
          paymentMethod: this.paymentForm.value?.method,
          etaDays: (res as any)?.etaDays ?? (this.preview as any)?.etaDays
        };

        // LƯU để trang success hydrate khi refresh
        try {
          localStorage.setItem(`order_success_${successPayload.id}`, JSON.stringify(successPayload));
        } catch {}

        // ĐIỀU HƯỚNG SAU KHI ĐÃ LƯU
        this.router.navigate(['/order-success'], {
          queryParams: { id: successPayload.id },
          state: successPayload
        });
      },
      error: (err) => {
        this.errMsg = err?.error?.error || 'Đặt hàng thất bại';
        console.error(err);
      }
    });
}
payVnPay() {
  if (!this.cart || !this.preview) {
    this.errMsg = 'Vui lòng chọn vị trí và tính phí vận chuyển trước.';
    return;
  }
  if (this.addressForm.invalid) {
    this.addressForm.markAllAsTouched();
    return;
  }

  // Tạo đơn trước (như COD), sau đó redirect VNPay
  const f = this.addressForm.value;
  const items = (this.cart.selectedItems || []).map(it => ({
    productId: it.productId,
    quantity: it.quantity,
    weightKgPerItem: it.weightKgPerItem ?? 0.2,
  }));

  const body: CreateOrderRequest = {
    receiverName: f.receiverName,
    phone: f.phone,
    addressLine: `${f.addressLine}`,
    province: this.provinceName,
    voucherCode: (this.shippingForm.value.voucherCode || '').trim() || undefined,
    items,
    destLat: Number(f.lat),
    destLng: Number(f.lng),
    note: this.noteForm.value?.note,
    paymentMethod: 'VNPAY',
  };

  this.placing = true;
  this.errMsg = undefined;
  this.cdr.detectChanges();

  this.orderSvc.create(body).subscribe({
    next: (res: any) => {
      const itemsAmount = Number(this.cart?.selectedAmount ?? this.cart?.totalAmount ?? this.subtotal ?? 0);
      const shippingFee = Number(this.preview?.finalFee ?? 0);
      const total = itemsAmount + shippingFee;

      const orderCode = res?.code ?? `ORDER${Date.now()}`;

      // ✅ Gọi API backend để lấy link VNPay
      this.payment.create(orderCode, total).subscribe({
        next: (resp) => {
          window.location.href = resp.paymentUrl; // chuyển sang trang VNPay
        },
        error: () => {
          this.errMsg = 'Không thể khởi tạo thanh toán VNPay.';
          this.placing = false;
          this.cdr.detectChanges();
        },
      });
    },
    error: (err) => {
      this.errMsg = err?.error?.error || 'Không thể tạo đơn hàng.';
      this.placing = false;
      this.cdr.detectChanges();
    },
  });
}


  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const km = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    return Math.round(km * 100) / 100;
  }

  private vnNormalize(s: string): string {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().trim();
  }

  private cleanAdminName(s?: string): string {
    const x = (s || '')
      .replace(/\b(thành phố|tỉnh|quận|huyện|thị xã|thị trấn|phường|xã)\b/gi, '')
      .replace(/\b(city|district|ward|commune|town)\b/gi, '');
    return this.vnNormalize(x);
  }

  private codeByName<T extends { name: string; code: string | number }>(list: T[], name?: string): string | null {
    const key = this.cleanAdminName(name);
    const hit = (list || []).find(x => {
      const n = this.cleanAdminName(x.name);
      return n === key || n.includes(key) || key.includes(n);
    });
    return hit ? String(hit.code) : null;
  }

  get provinceName(): string {
    const code = String(this.addressForm?.value?.provinceCode ?? '');
    const p = (this.provinces || []).find(x => String(x.code) === code);
    return p?.name || '';
  }

  get districtName(): string {
    const code = String(this.addressForm?.value?.districtCode ?? '');
    const d = (this.districts || []).find(x => String(x.code) === code);
    return d?.name || '';
  }

  get wardName(): string {
    const code = String(this.addressForm?.value?.wardCode ?? '');
    const w = (this.wards || []).find(x => String(x.code) === code);
    return w?.name || '';
  }
}
