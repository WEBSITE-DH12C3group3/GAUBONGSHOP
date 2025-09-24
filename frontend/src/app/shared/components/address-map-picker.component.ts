import {
  Component, EventEmitter, Input, Output,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges,
  ViewChild, ElementRef, NgZone, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-address-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="rounded-2xl overflow-hidden border relative">
    <!-- Nút định tâm nhỏ (tuỳ chọn) -->
    <button type="button"
            class="absolute right-3 top-3 z-[401] bg-white/90 hover:bg-white text-xs px-2 py-1 rounded border"
            (click)="recenter()">
      Định tâm
    </button>

    <div #mapEl class="w-full map-h"></div>

    <div class="p-3 text-sm flex items-center justify-between bg-gray-50">
      <div class="min-w-0">
        <div class="truncate">
          <b>Toạ độ:</b>
          <ng-container *ngIf="lat!=null && lng!=null; else noCoord">
            {{ lat | number:'1.6-6' }}, {{ lng | number:'1.6-6' }}
          </ng-container>
          <ng-template #noCoord>--</ng-template>
        </div>
        <div *ngIf="approxAddress" class="text-gray-600 truncate max-w-[60vw]">
          {{ approxAddress }}
        </div>
      </div>
      <div class="flex gap-2 shrink-0">
        <button type="button" class="px-3 py-1 rounded-xl border" (click)="emitCancel()">Huỷ</button>
        <button type="button" class="px-3 py-1 rounded-xl bg-pink-600 text-white"
                [disabled]="lat==null || lng==null"
                (click)="emitPick()">Chọn vị trí</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    /* đặt chiều cao map responsive */
    .map-h { height: 20rem; }       /* ~ h-80 */
    @media (min-width: 768px) {
      .map-h { height: 24rem; }     /* md:h-96 */
    }
    /* bo góc đẹp cho khung leaflet */
    :host ::ng-deep .leaflet-container { border-radius: 0.75rem; }
  `]
})
export class AddressMapPickerComponent implements AfterViewInit, OnDestroy, OnChanges {
  /** Cha nên truyền showMap vào đây; mỗi lần true -> auto invalidateSize */
  @Input() visible = true;

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  /** Toạ độ khởi tạo (Hà Nội mặc định) */
  @Input() initialLat = 21.027763;
  @Input() initialLng = 105.83416;
  @Input() zoom = 13;

  /** Gợi ý địa chỉ (hiển thị ở footer) */
  @Input() approxAddress?: string;

  /** Bắn ra khi user bấm chọn */
  @Output() picked = new EventEmitter<{ lat: number; lng: number }>();
  /** Bắn ra khi user huỷ */
  @Output() cancelled = new EventEmitter<void>();

  map?: L.Map;
  marker?: L.Marker;
  lat?: number;
  lng?: number;

  private resizeTimer?: any;

  constructor(private zone: NgZone) {}

  // Khởi tạo map sau khi DOM sẵn sàng
  ngAfterViewInit(): void {
    this.lat = this.initialLat;
    this.lng = this.initialLng;

    // Sửa đường dẫn icon mặc định để không bị icon 404 khi build
    // @ts-ignore
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl:       'assets/leaflet/marker-icon.png',
      shadowUrl:     'assets/leaflet/marker-shadow.png'
    });

    // Tạo map
    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true })
      .setView([this.initialLat, this.initialLng], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    // Marker kéo thả
    this.marker = L.marker([this.initialLat, this.initialLng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const ll = (this.marker as L.Marker).getLatLng();
      this.lat = ll.lat;
      this.lng = ll.lng;
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.lat = lat;
      this.lng = lng;
      (this.marker as L.Marker).setLatLng(e.latlng);
    });

    // Khi tạo xong, invalidatesize 1 nhịp để tránh lệch tiles (đặc biệt khi map nằm trong modal)
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  // Bắt thay đổi @Input
  ngOnChanges(changes: SimpleChanges): void {
    // Khi modal mở (visible từ false -> true) thì refresh size
    if (changes['visible'] && !changes['visible'].firstChange && this.visible && this.map) {
      setTimeout(() => this.map!.invalidateSize(), 0);
    }
    // Nếu parent đổi initialLat/initialLng động -> setView + đặt marker
    const latChanged = !!changes['initialLat'] && !changes['initialLat'].firstChange;
    const lngChanged = !!changes['initialLng'] && !changes['initialLng'].firstChange;
    if ((latChanged || lngChanged) && this.map && this.marker) {
      const lat = changes['initialLat']?.currentValue ?? this.initialLat;
      const lng = changes['initialLng']?.currentValue ?? this.initialLng;
      this.lat = lat; this.lng = lng;
      this.marker.setLatLng([lat, lng]);
      this.map.setView([lat, lng], this.map.getZoom());
      setTimeout(() => this.map!.invalidateSize(), 0);
    }
  }

  // Tối ưu khi window resize: debounce rồi invalidateSize
  @HostListener('window:resize')
  onWindowResize() {
    if (!this.map) return;
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.map!.invalidateSize(), 150);
  }

  // Cho phép component cha gọi thủ công sau khi hiển thị modal
  refresh() {
    this.map?.invalidateSize();
  }

  recenter() {
    if (!this.map || !this.marker) return;
    // ưu tiên về vị trí hiện tại; nếu chưa có thì quay lại initial
    const lat = this.lat ?? this.initialLat;
    const lng = this.lng ?? this.initialLng;
    this.marker.setLatLng([lat, lng]);
    this.map.setView([lat, lng], this.map.getZoom());
    setTimeout(() => this.map!.invalidateSize(), 0);
  }

  emitPick(): void {
    if (this.lat != null && this.lng != null) {
      this.picked.emit({ lat: this.lat, lng: this.lng });
    }
  }

  emitCancel(): void {
    this.cancelled.emit();
  }

  ngOnDestroy(): void {
    try {
      this.map?.off();
      this.map?.remove();
    } finally {
      this.map = undefined;
      this.marker = undefined;
      clearTimeout(this.resizeTimer);
    }
  }
}
