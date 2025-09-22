import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { OrderResponse } from '../../models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, NgFor, NgIf, DatePipe, CurrencyPipe],
  templateUrl: './my-orders.html'
})
export class MyOrdersPage implements OnInit {
  private api = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  orders: OrderResponse[] = [];

  ngOnInit() {
    this.api.myOrders().subscribe({
      next: list => this.zone.run(() => { this.orders = list; this.cdr.markForCheck(); })
    });
  }
}
