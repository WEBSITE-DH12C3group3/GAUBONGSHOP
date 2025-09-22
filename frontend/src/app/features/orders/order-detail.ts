import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { OrderResponse } from '../../models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgFor, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.html'
})
export class OrderDetailPage implements OnInit {
  private api = inject(OrderService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  id!: number;
  data?: OrderResponse;

  ngOnInit() {
    this.id = +(this.route.snapshot.paramMap.get('id') || 0);
    this.fetch();
  }

  fetch() {
    this.api.myOrderDetail(this.id).subscribe({
      next: d => this.zone.run(() => { this.data = d; this.cdr.markForCheck(); })
    });
  }

  cancel() {
    if (!confirm('Bạn chắc muốn hủy đơn này?')) return;
    this.api.cancelMyOrder(this.id).subscribe({
      next: _ => this.zone.run(() => { this.fetch(); this.cdr.markForCheck(); })
    });
  }
}
