import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CartService } from '../../shared/services/cart.service';
import { finalize } from 'rxjs/operators';
import { AddressMapPickerComponent } from '../../shared/components/address-map-picker.component';
import { ShopInfoService } from '../../shared/services/shop-info.service';
import {
  VietnamLocationService,
  Province,
  District,
  Ward,
} from '../../shared/services/vietnam-location.service';

// DÙNG TYPE từ service shipping để không lệch
import {
  ShippingPublicService,
  ShippingQuote as BackendShippingQuote,
  ShippingQuoteRequest,
} from '../../shared/services/shipping-public.service';

import {
  OrderClientService,
  CreateOrderRequest,
} from '../../shared/services/order-client.service';

import { GeoService, AddressComponents, SuggestItem } from '../../shared/services/geo.service';
import { AddressBookService, UserAddress } from '../../shared/services/address-book.service';
import { AddressSuggestInputComponent } from '../../shared/components/address-suggest-input.component';
import { AddressBookSelectComponent } from '../../shared/components/address-book-select.component';


// ===== ViewModel cho HTML hiện tại (carrierName/serviceLabel/fee/eta...) =====
type UIShippingQuote = {
  carrierName: string;
  serviceLabel: string;
  etaMin?: number;
  etaMax?: number;
  voucherApplied?: string | null;
  feeBeforeVoucher?: number;
  fee: number;
  __raw?: BackendShippingQuote; // lưu bản gốc nếu cần
};

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AddressMapPickerComponent, AddressSuggestInputComponent, AddressBookSelectComponent,],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CheckoutPageComponent implements OnInit {
  // ===== cart =====
  cart?: {
    items: Array<{ productId: number; quantity: number; weightKgPerItem?: number }>;
    totalQuantity: number;
    totalAmount: number;
    selectedItems?: Array<{ productId: number; quantity: number; weightKgPerItem?: number }>;
    selectedAmount?: number;
  };

  // ===== shop origin =====
  origin?: { lat: number; lng: number; address?: string };

  // ===== modal =====
  showMap = false;

  // ===== km preview =====
  distanceKmPreview: number | null = null;

  // ===== forms =====
  addressForm!: FormGroup;
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;
  noteForm!: FormGroup;

  // ===== shipping =====
  loadingQuotes = false;
  quotes: UIShippingQuote[] = [];
  selectedQuote?: UIShippingQuote | null;

  voucherCode?: string;
  voucherApplying = false;

  // ===== location lists =====
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  loadingProv = false;
  loadingDist = false;
  loadingWard = false;

  // ===== ui states =====
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
    private shopInfo: ShopInfoService
  ) {}

  ngOnInit(): void {
    // 1) Khởi tạo form
    this.addressForm = this.fb.group({
      receiverName: ['', [Validators.required, Validators.maxLength(120)]],
      phone: ['', [Validators.required, Validators.pattern(/^0\d{9,10}$/)]],
      provinceCode: ['', Validators.required],
      districtCode: ['', Validators.required],
      wardCode: ['', Validators.required],
      addressLine: ['', [Validators.required, Validators.maxLength(255)]],
      lat: [null],
      lng: [null],
    });

    this.shippingForm = this.fb.group({
      weightKg: [0], // có thể tính từ giỏ hàng
    });

    this.paymentForm = this.fb.group({
      method: ['COD', Validators.required],
    });

    this.noteForm = this.fb.group({
      note: [''],
    });

    // 2) Origin shop
    this.shopInfo.getOrigin().subscribe((o) => {
      this.origin = o;
      this.cdr.detectChanges();
    });

    // 3) Load cart
    this.loadCart();

    // 4) Load provinces
    this.loadProvinces();

    // 5) React khi đổi province/district (load DS con)
    this.addressForm.get('provinceCode')!.valueChanges.subscribe((code: string) => {
      this.addressForm.patchValue({ districtCode: '', wardCode: '' }, { emitEvent: false });
      this.wards = [];
      if (code) this.loadDistricts(code);
      this.safeGetQuotes();
    });

    this.addressForm.get('districtCode')!.valueChanges.subscribe((code: string) => {
      this.addressForm.patchValue({ wardCode: '' }, { emitEvent: false });
      if (code) this.loadWards(code);
      this.safeGetQuotes();
    });

    // 6) Tự lấy báo giá khi địa chỉ/ship params đủ
    ['receiverName', 'phone', 'wardCode', 'addressLine', 'lat', 'lng'].forEach((ctrl) => {
      this.addressForm.get(ctrl)!.valueChanges.subscribe(() => this.safeGetQuotes());
    });
    ['weightKg'].forEach((ctrl) => {
      this.shippingForm.get(ctrl)!.valueChanges.subscribe(() => this.safeGetQuotes());
    });

    // Nếu đủ điều kiện ngay từ đầu
    if (this.isAddressValid()) this.getQuotes();
  }

  // ===== Cart =====
  loadCart(): void {
    // Snapshot tạm (nếu CartService có)
    const snap = (this.cartSvc as any).getSnapshot ? (this.cartSvc as any).getSnapshot() : null;
    if (snap) {
      this.cart = {
        items: snap.items ?? [],
        totalQuantity: snap.totalQuantity ?? 0,
        totalAmount: snap.totalAmount ?? 0,
        selectedItems: snap.hasAnySelected ? snap.items?.filter((i: any) => i.selected) : snap.items,
        selectedAmount: snap.selectedAmount ?? snap.totalAmount,
      };
      // Tính weight mặc định 0.2kg/item nếu chưa có
      const qty =
        (this.cart.selectedItems || []).reduce(
          (s: number, it: any) => s + (it.quantity || 0),
          0
        ) || 0;
      if ((this.shippingForm.get('weightKg')!.value ?? 0) <= 0) {
        this.shippingForm.patchValue({ weightKg: qty * 0.2 }, { emitEvent: false });
      }
      this.cdr.detectChanges();
    }

    // Đồng bộ chuẩn
    this.cartSvc.getSummary().subscribe((resp: any) => {
      this.cart = {
        items: resp.items ?? [],
        totalQuantity: resp.totalQuantity ?? 0,
        totalAmount: resp.totalAmount ?? 0,
        selectedItems: resp.selectedItems ?? resp.items ?? [],
        selectedAmount: resp.selectedAmount ?? resp.totalAmount ?? 0,
      };
      const qty =
        (this.cart.selectedItems || []).reduce(
          (s: number, it: any) => s + (it.quantity || 0),
          0
        ) || 0;
      if ((this.shippingForm.get('weightKg')!.value ?? 0) <= 0) {
        this.shippingForm.patchValue({ weightKg: qty * 0.2 }, { emitEvent: false });
      }
      this.cdr.detectChanges();
    });
  }

  // ===== Map picker =====
  openMapPicker(): void { this.showMap = true; this.cdr.detectChanges(); }
  onMapCancel(): void { this.showMap = false; this.cdr.detectChanges(); }
  onMapPicked(e: { lat: number; lng: number; address?: string }): void {
    this.showMap = false;
    this.addressForm.patchValue({ lat: e.lat, lng: e.lng }, { emitEvent: true });

    // khoảng cách xem trước
    if (this.origin?.lat != null && this.origin?.lng != null) {
      this.distanceKmPreview = this.haversineKm(this.origin.lat, this.origin.lng, e.lat, e.lng);
    }

    // reverse geocode → tự điền
    this.geo.reverse(e.lat, e.lng).subscribe({
      next: (a: AddressComponents) => {
        // 1) province
        const provCode = this.codeByName(this.provinces, a.province);
        if (provCode) {
          this.addressForm.patchValue({ provinceCode: provCode, districtCode: '', wardCode: '' }, { emitEvent: false });

          // 2) district theo province
          this.loadDistricts(provCode);
          const waitDist = setInterval(() => {
            if (this.districts.length) {
              clearInterval(waitDist);
              const distCode = this.codeByName(this.districts, a.district);
              if (distCode) {
                this.addressForm.patchValue({ districtCode: distCode, wardCode: '' }, { emitEvent: false });

                // 3) ward theo district
                this.loadWards(distCode);
                const waitWard = setInterval(() => {
                  if (this.wards.length) {
                    clearInterval(waitWard);
                    const wardCode = this.codeByName(this.wards, a.ward);
                    if (wardCode) this.addressForm.patchValue({ wardCode }, { emitEvent: false });

                    // địa chỉ chi tiết
                    const line = a.street || a.fullAddress || e.address || '';
                    this.addressForm.patchValue({ addressLine: line }, { emitEvent: false });
                    this.getQuotes();
                  }
                }, 60);
              } else {
                // không tìm được quận
                this.addressForm.patchValue({ addressLine: a.street || a.fullAddress || e.address || '' }, { emitEvent: false });
                this.getQuotes();
              }
            }
          }, 60);
        } else {
          // không tìm được tỉnh
          this.addressForm.patchValue({ addressLine: a.street || a.fullAddress || e.address || '' }, { emitEvent: false });
          this.getQuotes();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // fallback
        if (e.address && !this.addressForm.get('addressLine')!.value) {
          this.addressForm.patchValue({ addressLine: e.address }, { emitEvent: false });
        }
        this.getQuotes();
      }
    });
    }
    
    onSuggestPicked(it: SuggestItem) {
    // nếu suggest trả lat/lng thì set luôn
    if (it.lat != null && it.lng != null) {
      this.addressForm.patchValue({ lat: it.lat, lng: it.lng }, { emitEvent: false });
    }
    // map tên → code
    const pCode = this.codeByName(this.provinces, it.province);
    if (pCode) {
      this.addressForm.patchValue({ provinceCode: pCode, districtCode: '', wardCode: '' }, { emitEvent: false });
      this.loadDistricts(pCode);
      const w1 = setInterval(() => {
        if (this.districts.length) {
          clearInterval(w1);
          const dCode = this.codeByName(this.districts, it.district);
          if (dCode) {
            this.addressForm.patchValue({ districtCode: dCode, wardCode: '' }, { emitEvent: false });
            this.loadWards(dCode);
            const w2 = setInterval(() => {
              if (this.wards.length) {
                clearInterval(w2);
                const wCode = this.codeByName(this.wards, it.ward);
                if (wCode) this.addressForm.patchValue({ wardCode: wCode }, { emitEvent: false });
                this.addressForm.patchValue({ addressLine: it.street || it.fullAddress }, { emitEvent: false });
                this.getQuotes();
              }
            }, 60);
          }
        }
      }, 60);
    } else {
      this.addressForm.patchValue({ addressLine: it.street || it.fullAddress }, { emitEvent: false });
      this.getQuotes();
    }
    this.cdr.detectChanges();
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
    this.addrBook.create(payload).subscribe({ next: () => {/* toast OK */} });
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
    this.getQuotes();
  }



  // ===== Provinces/Districts/Wards =====
  loadProvinces(): void {
    this.loadingProv = true;
    this.vnLoc
      .getProvinces()
      .pipe(finalize(() => { this.loadingProv = false; this.cdr.detectChanges(); }))
      .subscribe((list: Province[] | null | undefined) => {
        this.provinces = list ?? [];
        this.cdr.detectChanges();
      });
  }

  // Fallback an toàn cho dự án khác tên hàm: get|list|fetch
  loadDistricts(provinceCode: string): void {
    this.loadingDist = true;
    this.districts = [];
    this.wards = [];
    const vn: any = this.vnLoc as any;
    const obs =
      vn.getDistricts?.(provinceCode) ??
      vn.listDistricts?.(provinceCode) ??
      vn.fetchDistricts?.(provinceCode);
    (obs as any)
      .pipe(finalize(() => { this.loadingDist = false; this.cdr.detectChanges(); }))
      .subscribe((list: District[] | null | undefined) => {
        this.districts = list ?? [];
        this.cdr.detectChanges();
      });
  }

  loadWards(districtCode: string): void {
    this.loadingWard = true;
    this.wards = [];
    const vn: any = this.vnLoc as any;
    const obs =
      vn.getWards?.(districtCode) ??
      vn.listWards?.(districtCode) ??
      vn.fetchWards?.(districtCode);
    (obs as any)
      .pipe(finalize(() => { this.loadingWard = false; this.cdr.detectChanges(); }))
      .subscribe((list: Ward[] | null | undefined) => {
        this.wards = list ?? [];
        this.cdr.detectChanges();
      });
  }

  // ===== Shipping quotes =====
  isAddressValid(): boolean {
    const f = this.addressForm?.value || {};
    return !!(
      f.receiverName &&
      f.phone &&
      f.provinceCode &&
      f.districtCode &&
      f.wardCode &&
      f.addressLine &&
      f.lat != null &&
      f.lng != null
    );
  }

  safeGetQuotes(): void {
    if (this.isAddressValid()) this.getQuotes();
  }

  private mapQuoteToUI(q: BackendShippingQuote): UIShippingQuote {
    return {
      carrierName: q.carrier,                       // backend "carrier" -> UI "carrierName"
      serviceLabel: 'Tiêu chuẩn',                   // backend hiện chưa có -> đặt mặc định
      etaMin: undefined,                            // (có thể bổ sung từ backend sau)
      etaMax: undefined,
      voucherApplied: q.appliedVoucher ?? null,     // appliedVoucher -> voucherApplied
      feeBeforeVoucher: q.feeBeforeDiscount,        // feeBeforeDiscount -> feeBeforeVoucher
      fee: q.finalFee,                              // finalFee -> fee
      __raw: q,
    };
  }

  getQuotes(): void {
    if (!this.cart) return;
    const addr = this.addressForm.value;
    const req: ShippingQuoteRequest = {
      orderSubtotal: this.cart.selectedAmount || this.cart.totalAmount || 0,
      weightKg: this.shippingForm.value.weightKg || 0,
      province: addr.provinceCode,
      distanceKm: null,
      address: addr.lat != null && addr.lng != null ? { lat: addr.lat, lng: addr.lng } : null,
      voucherCode: this.voucherCode?.trim() || undefined,
      carrierCode: undefined,
    } as ShippingQuoteRequest;

    this.loadingQuotes = true;
    this.errMsg = undefined;
    this.shipSvc
      .quotes(req)
      .pipe(finalize(() => {
        this.loadingQuotes = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (list: BackendShippingQuote[]) => {
          const uiList = (list || []).map(q => this.mapQuoteToUI(q));
          this.quotes = uiList;
          this.selectedQuote = this.quotes[0] || null;
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          this.errMsg = 'Không lấy được báo giá. Vui lòng thử lại.';
          console.error(err);
        },
      });
  }

  selectQuote(q: UIShippingQuote): void { this.selectedQuote = q; this.cdr.detectChanges(); }

  applyVoucher(): void {
    if (!this.selectedQuote || !this.voucherCode?.trim()) return;
    this.voucherApplying = true; this.errMsg = undefined; this.cdr.detectChanges();

    const addr = this.addressForm.value;
    const req: ShippingQuoteRequest = {
      orderSubtotal: this.cart?.selectedAmount || this.cart?.totalAmount || 0,
      weightKg: this.shippingForm.value.weightKg || 0,
      province: addr.provinceCode,
      address: (addr.lat != null && addr.lng != null) ? { lat: addr.lat, lng: addr.lng } : null,
      distanceKm: null,
      voucherCode: this.voucherCode.trim(),
      carrierCode: undefined,
    } as ShippingQuoteRequest;

    this.shipSvc
      .previewVoucher(req)
      .pipe(finalize(() => { this.voucherApplying = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res: BackendShippingQuote) => {
          const ui = this.mapQuoteToUI(res);
          this.selectedQuote = ui;
          // đồng bộ item tương ứng trong danh sách nếu cùng carrier
          const idx = this.quotes.findIndex(x => x.__raw?.carrier === res.carrier);
          if (idx >= 0) this.quotes[idx] = ui;
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          this.errMsg = 'Không áp được voucher. Thử lại sau.';
          console.error(err);
        },
      });
  }

  totalItems(): number {
    return (
      (this.cart?.selectedItems || []).reduce(
        (s: number, it: any) => s + (it.quantity || 0),
        0
      ) || 0
    );
  }

  itemsAmount(): number { return this.cart?.selectedAmount || this.cart?.totalAmount || 0; }

  shippingFee(): number {
    // Giờ selectedQuote.fee đã là finalFee từ backend (đã map)
    return this.selectedQuote?.fee ?? 0;
  }

  totalToPay(): number { return this.itemsAmount() + this.shippingFee(); }

  // ===== Place order (COD) =====
  placeOrder(): void {
    if (!this.isAddressValid() || !this.selectedQuote) {
      this.errMsg = 'Vui lòng điền địa chỉ và chọn hình thức vận chuyển.';
      return;
    }
    if (this.placing) return;

    const f = this.addressForm.value;
    const payload: CreateOrderRequest = {
      receiverName: f.receiverName,
      phone: f.phone,
      addressLine: `${f.addressLine}, ${f.wardCode}, ${f.districtCode}, ${f.provinceCode}`,
      province: f.provinceCode,
      items: (this.cart?.selectedItems || this.cart?.items || []).map((it: any) => ({
        productId: it.productId,
        quantity: it.quantity,
        weightKgPerItem: it.weightKgPerItem ?? 0.2,
      })),
      voucherCode: this.voucherCode?.trim() || undefined,
    };

    this.placing = true; this.errMsg = undefined; this.cdr.detectChanges();
    this.orderSvc
      .create(payload)
      .pipe(finalize(() => { this.placing = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res: any) => {
          this.router.navigate(['/order-success'], { queryParams: { id: res?.id } });
        },
        error: (err: unknown) => {
          this.errMsg = 'Đặt hàng thất bại. Vui lòng thử lại.';
          console.error(err);
        },
      });
  }

  // ===== Utils
  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 100) / 100;
  }

  private vnNormalize(s: string): string {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  }
  private codeByName<T extends { name: string; code: string | number }>(
    list: T[], name?: string
  ): string | null {
    const key = this.vnNormalize(name || '');
    const hit = (list || []).find(x => {
      const n = this.vnNormalize(x.name);
      return n === key || n.includes(key) || key.includes(n);
    });
    return hit ? String(hit.code) : null;
  }

  // ===== Helpers for template =====
get provinceName(): string {
  // provinceCode có thể là string | number -> ép về string để so sánh an toàn
  const code = String(this.addressForm?.value?.provinceCode ?? '');
  const p = (this.provinces || []).find(x => String(x.code) === code);
  return p?.name || '';
}

get districtName(): string {
  const code = String(this.addressForm?.value?.districtCode ?? '');
  const d = (this.districts || []).find(x => String(x.code) === code);
  return d?.name || '';
}


}
