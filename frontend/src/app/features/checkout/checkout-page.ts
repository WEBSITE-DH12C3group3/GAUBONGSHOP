import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  CheckoutCartItem, CheckoutCartSnapshot, UserAddressInput,
  ShippingQuote, ShippingQuoteRequest, PaymentMethod, CreateOrderRequest
} from '../../models/checkout.models';
import { ShippingPublicService } from '../../shared/services/shipping-public.service';
import { OrderClientService } from '../../shared/services/order-client.service';
import { CartService } from '../../shared/services/cart.service';
import { finalize } from 'rxjs';
import { AddressMapPickerComponent } from '../../shared/components/address-map-picker.component';
import { ShopInfoService } from '../../shared/services/shop-info.service';

// ⬇️ Thêm: service lấy Tỉnh/Huyện/Phường (đã tạo ở bước trước)
import { VietnamLocationService, Province, District, Ward } from '../../shared/services/vietnam-location.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AddressMapPickerComponent],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CheckoutPageComponent implements OnInit {
  // ===== cart =====
  cart?: CheckoutCartSnapshot;

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
  quotes: ShippingQuote[] = [];
  selectedQuote?: ShippingQuote;
  voucherCode = '';
  voucherApplying = false;

  // ===== UI =====
  placing = false;
  errMsg?: string;

  // ⬇️ Thêm: dữ liệu hành chính + cờ loading
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  loadingProv = false;
  loadingDist = false;
  loadingWard = false;

  constructor(
    private fb: FormBuilder,
    private cartSvc: CartService,
    private shipSvc: ShippingPublicService,
    private orderSvc: OrderClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private shopInfo: ShopInfoService,
    // ⬇️ Thêm: inject service địa lý VN
    private vn: VietnamLocationService
  ) {}

  // Haversine
  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (d: number) => d * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 100) / 100;
  }

  ngOnInit(): void {
    // 1) Khởi tạo form
    this.addressForm = this.fb.group({
      receiverName: ['', [Validators.required, Validators.maxLength(120)]],
      // ⬇️ Chỉnh regex: số VN bắt đầu bằng 0, 10–11 số
      phone: ['', [Validators.required, Validators.pattern(/^0\d{9,10}$/)]],
      provinceCode: ['', Validators.required],
      districtCode: ['', Validators.required],
      wardCode: ['', Validators.required],
      addressLine: ['', [Validators.required, Validators.maxLength(255)]],
      lat: [null],
      lng: [null]
    });

    this.shopInfo.getOrigin().subscribe(o => {
      this.origin = o; this.cdr.detectChanges();
    });

    this.shippingForm = this.fb.group({
      weightGram: [500, [Validators.required, Validators.min(10)]], // ước lượng
      cod: [false]
    });

    this.paymentForm = this.fb.group({
      method: ['COD', Validators.required] // COD default
    });

    this.noteForm = this.fb.group({
      note: ['']
    });

    // 2) Nạp danh mục Tỉnh → Huyện → Phường (từ public API)
    this.loadingProv = true;
    this.vn.getProvinces().subscribe({
      next: (list) => { this.provinces = list; },
      error: () => { this.provinces = []; },
      complete: () => { this.loadingProv = false; }
    });

    // Khi đổi Tỉnh -> reset Huyện/Phường và nạp Huyện
    this.addressForm.get('provinceCode')!.valueChanges.subscribe((pcode: string | number) => {
      this.addressForm.patchValue({ districtCode: '', wardCode: '' }, { emitEvent: false });
      this.districts = [];
      this.wards = [];
      if (!pcode) return;

      this.loadingDist = true;
      this.vn.getDistrictsByProvince(pcode).subscribe({
        next: (list) => { this.districts = list; },
        error: () => { this.districts = []; },
        complete: () => { this.loadingDist = false; }
      });
    });

    // Khi đổi Huyện -> reset Phường và nạp Phường
    this.addressForm.get('districtCode')!.valueChanges.subscribe((dcode: string | number) => {
      this.addressForm.patchValue({ wardCode: '' }, { emitEvent: false });
      this.wards = [];
      if (!dcode) return;

      this.loadingWard = true;
      this.vn.getWardsByDistrict(dcode).subscribe({
        next: (list) => { this.wards = list; },
        error: () => { this.wards = []; },
        complete: () => { this.loadingWard = false; }
      });
    });

    // 3) Nạp giỏ hàng
    this.loadCart();

    // 4) Tự động lấy báo giá (debounce nhẹ)
    const addressControls = ['provinceCode', 'districtCode', 'wardCode', 'addressLine', 'lat', 'lng'];
    const shipControls = ['weightGram', 'cod'];

    const debounce = (fn: () => void, ms = 300) => {
      let t: any;
      return () => { clearTimeout(t); t = setTimeout(fn, ms); };
    };
    const safeGetQuotes = debounce(() => {
      if (this.isAddressValid()) this.getQuotes();
    }, 300);

    addressControls.forEach(name => {
      this.addressForm.get(name)!.valueChanges.subscribe(() => safeGetQuotes());
    });
    shipControls.forEach(name => {
      this.shippingForm.get(name)!.valueChanges.subscribe(() => safeGetQuotes());
    });

    // Nếu đủ điều kiện ngay từ đầu
    if (this.isAddressValid()) this.getQuotes();
  }

  loadCart(): void {
    // Snapshot tạm (nếu có)
    const snap = (this.cartSvc as any).getSnapshot ? (this.cartSvc as any).getSnapshot() : null;
    if (snap) {
      this.cart = {
        items: snap.items ?? [],
        totalQuantity: snap.totalQuantity ?? 0,
        totalAmount: snap.totalAmount ?? 0,
        selectedItems: snap.hasAnySelected ? snap.items?.filter((i: any) => i.selected) : snap.items,
        selectedAmount: snap.selectedAmount ?? snap.totalAmount
      };
      this.cdr.detectChanges();
    }

    // Đồng bộ chuẩn
    this.cartSvc.getSummary().subscribe(resp => {
      this.cart = {
        items: resp.items ?? [],
        totalQuantity: resp.totalQuantity ?? 0,
        totalAmount: resp.totalAmount ?? 0,
        selectedItems: resp.hasAnySelected ? resp.items.filter((i: any) => i.selected) : resp.items,
        selectedAmount: resp.selectedAmount ?? resp.totalAmount
      };
      this.cdr.detectChanges();
    });
  }

  isAddressValid(): boolean {
    return this.addressForm.valid;
  }

  getQuotes(): void {
    if (!this.cart || !this.isAddressValid()) return;

    const itemsTotal = this.cart.selectedAmount ?? this.cart.totalAmount;
    const req: ShippingQuoteRequest = {
      address: this.addressForm.value as UserAddressInput,
      itemsTotal,
      weightGram: +this.shippingForm.value.weightGram,
      cod: this.paymentForm.value.method === 'COD'
    };

    this.loadingQuotes = true; this.errMsg = undefined;
    this.cdr.detectChanges();

    this.shipSvc.quotes(req)
      .pipe(finalize(() => { this.loadingQuotes = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: list => {
          this.quotes = (list ?? []).sort((a, b) => a.fee - b.fee);
          this.selectedQuote = this.quotes[0];
          this.cdr.detectChanges();
        },
        error: err => {
          this.quotes = []; this.selectedQuote = undefined;
          this.errMsg = 'Không lấy được bảng phí. Vui lòng kiểm tra địa chỉ hoặc thử lại.';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  // mở modal chọn vị trí trên bản đồ
  openMapPicker(): void {
    this.showMap = true;
    this.cdr.detectChanges();
  }

  // nhận kết quả toạ độ do user chọn
  onMapPicked(ev: { lat: number; lng: number }): void {
    this.addressForm.patchValue({ lat: ev.lat, lng: ev.lng });
    this.showMap = false;
    this.cdr.detectChanges();

    if (this.origin?.lat && this.origin?.lng) {
      this.distanceKmPreview = this.haversineKm(this.origin.lat, this.origin.lng, ev.lat, ev.lng);
    }

    if (this.isAddressValid()) this.getQuotes();
  }

  // user bấm Hủy trên modal map
  onMapCancel(): void {
    this.showMap = false;
    this.cdr.detectChanges();
  }

  selectQuote(q: ShippingQuote): void {
    this.selectedQuote = q;
    this.cdr.detectChanges();
  }

  applyVoucher(): void {
    if (!this.selectedQuote || !this.voucherCode?.trim()) return;
    this.voucherApplying = true; this.errMsg = undefined;
    this.cdr.detectChanges();

    this.shipSvc.previewVoucher({
      voucherCode: this.voucherCode.trim(),
      quote: this.selectedQuote
    })
      .pipe(finalize(() => { this.voucherApplying = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: res => {
          if (!res.ok) {
            this.errMsg = res.reason || 'Mã không hợp lệ hoặc không áp dụng được.';
            return;
          }
          this.selectedQuote = {
            ...this.selectedQuote!,
            feeBeforeVoucher: this.selectedQuote!.fee,
            voucherApplied: this.voucherCode.trim(),
            fee: res.discountedFee
          };
          this.cdr.detectChanges();
        },
        error: err => {
          this.errMsg = 'Không áp được voucher. Thử lại sau.';
          console.error(err);
        }
      });
  }

  totalToPay(): number {
    const itemsTotal = this.cart?.selectedAmount ?? this.cart?.totalAmount ?? 0;
    const ship = this.selectedQuote?.fee ?? 0;
    return itemsTotal + ship;
  }

  placeOrder(): void {
    if (!this.cart || !this.selectedQuote || !this.isAddressValid() || this.paymentForm.invalid) return;

    const items: { productId: number; quantity: number; price: number }[] = [];
    const source = this.cart.selectedItems?.length ? this.cart.selectedItems : this.cart.items;
    source.forEach(i => items.push({
      productId: i.productId,
      quantity: i.quantity,
      price: i.unitPrice
    }));

    const payload: CreateOrderRequest = {
      items,
      address: this.addressForm.value,
      paymentMethod: this.paymentForm.value.method as PaymentMethod,
      shippingSelection: {
        carrierCode: this.selectedQuote.carrierCode,
        serviceId: this.selectedQuote.serviceId,
        serviceCode: this.selectedQuote.serviceCode,
        voucherCode: this.selectedQuote.voucherApplied ?? undefined
      },
      note: this.noteForm.value.note || null
    };

    this.placing = true; this.errMsg = undefined;
    this.cdr.detectChanges();

    this.orderSvc.create(payload)
      .pipe(finalize(() => { this.placing = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: res => {
          this.router.navigate(['/order-success'], { queryParams: { id: res.id } });
        },
        error: err => {
          this.errMsg = 'Đặt hàng thất bại. Vui lòng thử lại.';
          console.error(err);
        }
      });
  }
}
