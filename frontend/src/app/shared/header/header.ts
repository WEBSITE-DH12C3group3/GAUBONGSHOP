import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common'; // 👈 thêm NgIf, NgFor
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [
    CommonModule,
    RouterModule,
    NgIf,      // 👈 để dùng *ngIf, *ngIfElse
    NgFor      // 👈 nếu có dùng *ngFor trong header.html
  ]
})
export class HeaderComponent {
  constructor(public auth: AuthService, private router: Router) {}

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
