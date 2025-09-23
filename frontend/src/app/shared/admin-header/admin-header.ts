import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProfileModalComponent } from '../../admin/users-admin/admin-profile-modal.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, AdminProfileModalComponent],
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.css']
})
export class AdminHeader {
  showProfile = false;
  profileData: any;

  constructor(private userService: UserService) {}

  openProfile() {
    this.userService.getMyProfile().subscribe({
      next: (res: any) => {
        this.profileData = res;
        this.showProfile = true;
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy hồ sơ:', err);
      }
    });
  }
}
