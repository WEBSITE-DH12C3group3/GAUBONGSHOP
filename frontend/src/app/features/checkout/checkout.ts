import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { OrderService } from '../../shared/services/order.service';
import { OrderResponse } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html'
})
export class CheckoutPage {
  private api = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  placing = false;
  result?: OrderResponse;

  placeOrder() {
    if (this.placing) return;
    this.placing = true;
    this.api.checkout().subscribe({
      next: (o) => this.zone.run(() => {
        this.result = o;
        this.placing = false;
        this.cdr.markForCheck();
      }),
      error: _ => this.zone.run(() => {
        this.placing = false;
        this.cdr.markForCheck();
      })
    });
  }
}
