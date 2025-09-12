import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-user-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // cho [formControl]
    NgIf,
    NgFor
  ]
})
export class HeaderComponent {
  searchTerm = new FormControl('');
  cartCount: number = 0;
  dropdownOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // ✅ Bắt sự kiện click toàn document mà không cần document.addEventListener
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Nếu click ra ngoài vùng dropdown (class="relative"), thì đóng dropdown
    if (!target.closest('.relative')) {
      this.dropdownOpen = false;
    }
  }
  removeReadonly(event: FocusEvent) {
    (event.target as HTMLInputElement).removeAttribute('readonly');
  }


  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  onSearch() {
    if (this.searchTerm.value?.trim()) {
      console.log('Tìm kiếm:', this.searchTerm.value);
      // TODO: gọi service tìm kiếm sản phẩm
    }
  }
}
