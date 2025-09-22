import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { CartService } from '../../shared/services/cart.service';
import { CartSummary, CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  private api = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  data: CartSummary | null = null;

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.api.getMyCart().subscribe({
      next: d => this.zone.run(() => { this.data = d; this.cdr.markForCheck(); })
    });
  }

  add(pid: number) {
    this.api.add(pid, 1).subscribe({
      next: d => this.zone.run(() => { this.data = d; this.cdr.markForCheck(); })
    });
  }

  dec(item: CartItem) {
    const q = Math.max(0, (item.quantity || 0) - 1);
    this.api.update(item.productId, q).subscribe({
      next: d => this.zone.run(() => { this.data = d; this.cdr.markForCheck(); })
    });
  }

  inc(item: CartItem) {
    const q = (item.quantity || 0) + 1;
    this.api.update(item.productId, q).subscribe({
      next: d => this.zone.run(() => { this.data = d; this.cdr.markForCheck(); })
    });
  }

  remove(pid: number) {
    this.api.remove(pid).subscribe({
      next: d => this.zone.run(() => { this.data = d; this.cdr.markForCheck(); })
    });
  }

  clear() {
    this.api.clear().subscribe({
      next: _ => this.zone.run(() => { this.refresh(); this.cdr.markForCheck(); })
    });
  }
}
