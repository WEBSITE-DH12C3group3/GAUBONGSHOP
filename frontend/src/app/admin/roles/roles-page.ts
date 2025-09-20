import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  AdminUsersService,
  RoleDto,
  PermissionDto,
  AdminUserDto
} from '../../shared/services/admin-users.service';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-page.html',
  styleUrls: ['./roles-page.css']
})
export class RolesPageComponent implements OnInit {
  // ===== data =====
  allRoles: RoleDto[] = [];          // gồm cả CUSTOMER
  roles: RoleDto[] = [];             // đã lọc (ẩn CUSTOMER)
  customerRole: RoleDto | null = null;

  permissions: PermissionDto[] = []; // toàn bộ permission (nếu cần dùng nơi khác)
  users: AdminUserDto[] = [];        // mọi user (đã loại Customer khi render)

  // Quyền của nhóm đang chọn (chỉ quyền nhóm này có)
  selectedPermissions: PermissionDto[] = [];

  // ===== UI state =====
  loading = true;
  error: string | null = null;
  selectedRole: RoleDto | null = null;

  // tìm theo tên/email/sđt trong bảng thành viên
  searchTerm = '';

  // ===== Modal: Thêm thành viên =====
  showMemberModal = false;
  saving = false;
  addMode: 'new' | 'from-existing' = 'new';

  // form tạo mới user
  memberForm = {
    email: '',
    password: '',
    username: '',
    phone: '',
    address: '',
    roleId: 0 as number
  };

  // ứng viên chưa có role
  candidates: AdminUserDto[] = [];
  loadingCandidates = false;
  selectedCandidateId: number | null = null;

  constructor(
    private admin: AdminUsersService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.cdr.detectChanges(); // đảm bảo vòng change detection đầu tiên ổn định
  }

  /** Tải roles + permissions + users */
  private loadAll() {
    this.loading = true; this.error = null;
    this.cdr.detectChanges();

    Promise.all([
      this.admin.getRoles().toPromise(),
      this.admin.getPermissions().toPromise(),
      this.admin.getUsers().toPromise()
    ])
    .then(([roles, perms, users]) => {
      this.allRoles = roles ?? [];

      // tìm CUSTOMER (theo code hoặc name)
      this.customerRole =
        this.allRoles.find(r => r.code?.toUpperCase() === 'CUSTOMER')
        ?? this.allRoles.find(r => r.name?.toUpperCase() === 'CUSTOMER')
        ?? null;

      // ẩn CUSTOMER ở panel trái
      this.roles = this.allRoles.filter(r =>
        (r.code ? r.code.toUpperCase() !== 'CUSTOMER' : (r.name || '').toUpperCase() !== 'CUSTOMER')
      );

      this.permissions = perms ?? [];

      // users cho bảng: không show Customer
      this.users = (users ?? []).filter(u => {
        const rn = u.roles?.[0]?.code?.toUpperCase() || u.roles?.[0]?.name?.toUpperCase();
        return rn !== 'CUSTOMER';
      });

      // chọn role đầu tiên nếu chưa chọn
      if (!this.selectedRole && this.roles.length > 0) {
        this.onSelectRole(this.roles[0]); // gọi luôn để fetch quyền nhóm
      }

      this.loading = false;
      this.cdr.detectChanges();
    })
    .catch(err => {
      console.error(err);
      this.error = 'Không tải được dữ liệu. Vui lòng thử lại.';
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  // ===== Helpers UI =====
  onSelectRole(r: RoleDto) {
    this.selectedRole = r;
    this.memberForm.roleId = r.id;
    this.searchTerm = '';
    this.cdr.detectChanges();

    // lấy đúng các quyền nhóm đang có để hiển thị
    this.admin.getRolePermissions(r.id).subscribe({
      next: perms => {
        this.selectedPermissions = perms || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedPermissions = [];
        this.cdr.detectChanges();
      }
    });
  }

  countUsersByRole(roleId: number): number {
    return this.users.filter(u => u.roles && u.roles[0]?.id === roleId).length;
  }

  membersOfSelected(): AdminUserDto[] {
    if (!this.selectedRole) return [];
    const list = this.users.filter(u => u.roles && u.roles[0]?.id === this.selectedRole!.id);
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  }

  trackById(_: number, item: { id: number }) { return item.id; }

  // ===== Actions: Member =====

  /** Mở modal: reset form & tải danh sách user chưa có nhóm */
  openAddMember() {
    if (!this.selectedRole) return;

    this.addMode = 'new';
    this.selectedCandidateId = null;

    this.memberForm = {
      email: '',
      password: '',
      username: '',
      phone: '',
      address: '',
      roleId: this.selectedRole.id
    };

    this.saving = false;
    this.showMemberModal = true;
    this.cdr.detectChanges();

    this.loadCandidates();
  }

  /** Tải danh sách ứng viên chưa có role */
  private loadCandidates() {
    this.loadingCandidates = true;
    this.cdr.detectChanges();

    this.admin.getUsersWithoutRole().subscribe({
      next: res => {
        this.candidates = res || [];
        this.loadingCandidates = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.candidates = [];
        this.loadingCandidates = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ĐÓNG modal an toàn (ép detect + reset)
  closeMemberModalSafely() {
    this.zone.run(() => {
      this.showMemberModal = false;
      this.saving = false;
      // reset form
      this.memberForm = {
        email: '', password: '', username: '', phone: '', address: '', roleId: 0
      };
      this.selectedCandidateId = null;
      this.cdr.detectChanges();
    });
  }

  /** Tạo mới user + gán vào nhóm hiện tại */
  createMember(mf: NgForm) {
    if (mf.invalid || !this.memberForm.roleId || this.saving) return;
    this.saving = true;
    this.cdr.detectChanges();

    this.admin.createUserAndAssignRole({
      email: (this.memberForm.email || '').trim().toLowerCase(),
      password: (this.memberForm.password || '').trim(),
      username: this.memberForm.username?.trim(),
      phone: this.memberForm.phone?.trim(),
      address: this.memberForm.address?.trim()
    }, this.memberForm.roleId).subscribe({
      next: () => {
        // Đóng modal NGAY, rồi load lại danh sách
        this.closeMemberModalSafely();
        // loadAll có lỗi cũng không làm modal “hiện lại”
        this.loadAll();
      },
      error: (err) => {
        this.saving = false;
        if (err?.status === 409) {
          alert('Email đã tồn tại.');
        } else {
          alert('❌ Tạo thành viên thất bại.');
        }
        this.cdr.detectChanges();
      }
    });
  }

  /** Gán nhóm cho user đã tồn tại (user chưa có role) */
  addExistingToRole() {
    if (!this.selectedRole || !this.selectedCandidateId || this.saving) return;
    this.saving = true;
    this.cdr.detectChanges();

    this.admin.assignRole(this.selectedCandidateId, this.selectedRole.id).subscribe({
      next: () => {
        this.closeMemberModalSafely();
        this.loadAll();
      },
      error: () => {
        this.saving = false;
        alert('❌ Gán nhóm thất bại.');
        this.cdr.detectChanges();
      }
    });
  }

  /** Gỡ thành viên khỏi nhóm: set role = null (roles = []) */
  removeMemberFromRole(u: AdminUserDto) {
    if (!confirm(`Gỡ ${u.email} khỏi nhóm "${this.selectedRole?.name}"?`)) return;

    this.admin.unassignRole(u.id).subscribe({
      next: () => {
        this.loadAll();
        this.cdr.detectChanges();
      },
      error: () => {
        alert('❌ Gỡ thành viên thất bại.');
        this.cdr.detectChanges();
      }
    });
  }

  /** Mở tab chọn từ user chưa có nhóm */
  openPickExisting() {
    if (!this.selectedRole) return;
    this.addMode = 'from-existing';
    this.saving = false;
    this.selectedCandidateId = null;
    this.loadingCandidates = true;
    this.showMemberModal = true;
    this.cdr.detectChanges();

    this.admin.getUsersWithoutRole().subscribe({
      next: (list) => {
        this.candidates = list || [];
        this.loadingCandidates = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.candidates = [];
        this.loadingCandidates = false;
        this.cdr.detectChanges();
      }
    });
  }
}
