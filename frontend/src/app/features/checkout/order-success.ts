import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-order-success',
  imports: [CommonModule, RouterModule],
  template: `
  <section class="container mx-auto px-4 py-10 text-center">
    <div class="bg-white rounded-2xl shadow p-10 inline-block">
      <div class="text-3xl mb-2">🎉</div>
      <h1 class="text-xl font-semibold">Đặt hàng thành công!</h1>
      <p class="text-gray-600 mt-2">Mã đơn: #{{ id }}</p>
      <div class="mt-4 space-x-2">
        <a [routerLink]="['/orders', id]" class="px-4 py-2 rounded-xl border">Xem đơn hàng</a>
        <a routerLink="/products" class="px-4 py-2 rounded-xl bg-pink-600 text-white">Tiếp tục mua sắm</a>
      </div>
    </div>
  </section>
  `
})
export class OrderSuccessComponent implements OnInit {
  id: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    // Nếu sau này bạn đổi sang /order-success/:id thì:
    // this.id = this.route.snapshot.paramMap.get('id');
  }
}
