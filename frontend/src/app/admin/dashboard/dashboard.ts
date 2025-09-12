import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  stats = [
    { title: 'Sản phẩm', value: 145, icon: '🧸', color: 'bg-pink-200' },
    { title: 'Đơn hàng', value: 32, icon: '📦', color: 'bg-pink-300' },
    { title: 'Khách hàng', value: 87, icon: '👤', color: 'bg-pink-400' },
    { title: 'Doanh thu', value: '12.5M VNĐ', icon: '💰', color: 'bg-pink-500' }
  ];
}
