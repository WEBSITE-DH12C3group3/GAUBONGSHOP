import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, HeaderComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  categories = [
    { id: 1, name: 'Gấu Teddy', image_url: 'https://picsum.photos/200?1' },
    { id: 2, name: 'Thỏ Bông', image_url: 'https://picsum.photos/200?2' },
    { id: 3, name: 'Hoa Bông', image_url: 'https://picsum.photos/200?3' }
  ];

  products = [
    { id: 1, name: 'Gấu Teddy Socola', price: 445000, image_url: 'https://picsum.photos/300?4' },
    { id: 2, name: 'Thỏ Bông Trắng', price: 250000, image_url: 'https://picsum.photos/300?5' },
    { id: 3, name: 'Hoa Bông Tím', price: 350000, image_url: 'https://picsum.photos/300?6' }
  ];
}
