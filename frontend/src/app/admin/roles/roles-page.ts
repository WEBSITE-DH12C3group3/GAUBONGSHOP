import { Component, OnInit, computed, signal } from '@angular/core';
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
  // data
  roles = signal<RoleDto[]>([]);
  permissions = signal<PermissionDto[]>([]);
  users = signal<AdminUserDto[]>([]);

  // UI states
  loading = signal(true);
  error = signal<string | null>(null);

  searchMember = signal('');                      // ô tìm kiếm member trong nhóm
  selectedRoleId = signal<number | null>(null);   // role đang chọn (panel phải)

  // modal: thêm/sửa role
  showRoleModal = signal(false);
  editMode = signal(false);
  roleForm = signal<{ id?: number; code?: string; name: string; description?: string; permissions: string[] }>({
    name: '',
    permissions: []
  });

  // modal: thêm member
  showMemberModal = signal(false);
  memberForm = signal<{ email: string; password: string; username?: string; phone?: string; address?: string; roleId: number | null }>({
    email: '',
    password: '',
    username: '',
    phone: '',
    address: '',
    roleId: null
  });

  constructor(private admin: AdminUsersService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.error.set(null);

    // tải roles + perms + users song song
    Promise.all([
      this.admin.getRoles().toPromise(),
      this.admin.getPermissions().toPromise(),
      this.admin.getUsers().toPromise()
    ]).then(([roles, perms, users]) => {
      // Ẩn nhóm Customer khỏi UI
      const filteredRoles = (roles || []).filter(r =>
        (r.code ? r.code.toUpperCase() !== 'CUSTOMER' : (r.name?.toUpperCase() !== 'CUSTOMER'))
      );

      this.roles.set(filteredRoles);
      this.permissions.set(perms || []);
      // chỉ hiển thị users KHÔNG phải Customer
      const usersExcludingCustomer = (users || []).filter(u => {
        const rn = u.roles?.[0]?.name?.toUpperCase() || u.roles?.[0]?.code?.toUpperCase();
        return rn !== 'CUSTOMER';
      });
      this.users.set(usersExcludingCustomer);

      // chọn role đầu tiên nếu chưa có
      if (!this.selectedRoleId()) {
        this.selectedRoleId.set(this.roles()[0]?.id ?? null);
      }

      this.loading.set(false);
    }).catch(err => {
      console.error(err);
      this.error.set('Không tải được dữ liệu. Vui lòng thử lại.');
      this.loading.set(false);
    });
  }

  // ====== computed cho panel phải ======
  selectedRole = computed<RoleDto | undefined>(() =>
    this.roles().find(r => r.id === this.selectedRoleId())
  );

  membersOfSelectedRole = computed<AdminUserDto[]>(() => {
    const roleId = this.selectedRoleId();
    const q = this.searchMember().trim().toLowerCase();
    let list = this.users().filter(u => u.roles?.[0]?.id === roleId);
    if (q) {
      list = list.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  // ====== actions: ROLE ======
  openCreateRole() {
    this.editMode.set(false);
    this.roleForm.set({ name: '', description: '', code: '', permissions: [] });
    this.showRoleModal.set(true);
  }

  openEditRole(role: RoleDto) {
    this.editMode.set(true);
    this.roleForm.set({
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      permissions: (role.permissions || []).map(p => p.name)
    });
    this.showRoleModal.set(true);
  }

  togglePermInForm(perm: string, checked: boolean) {
    const form = { ...this.roleForm() };
    form.permissions = form.permissions || [];
    if (checked && !form.permissions.includes(perm)) form.permissions.push(perm);
    if (!checked) form.permissions = form.permissions.filter(p => p !== perm);
    this.roleForm.set(form);
  }

  saveRole(formRef: NgForm) {
    if (formRef.invalid) return;
    const data = this.roleForm();

    const payload = {
      code: data.code ? data.code.trim() : undefined,
      name: data.name ? data.name.trim() : '',
      description: data.description ? data.description.trim() : undefined,
      permissions: data.permissions || []
    };

    let req$;
    if (this.editMode() && data.id) {
      req$ = this.admin.updateRole(data.id, payload);
    } else {
      req$ = this.admin.createRole(payload);
    }

    req$.subscribe({
      next: () => { this.showRoleModal.set(false); this.loadAll(); },
      error: () => alert('❌ Không thể lưu nhóm. Vui lòng thử lại.')
    });
  }


  deleteRole(role: RoleDto) {
    // an toàn: cảnh báo khi nhóm còn thành viên
    const memberCount = this.users().filter(u => u.roles?.[0]?.id === role.id).length;
    if (memberCount > 0) {
      alert('Nhóm vẫn còn thành viên. Hãy chuyển các thành viên sang nhóm khác trước khi xoá.');
      return;
    }
    if (!confirm(`Xoá nhóm "${role.name}"?`)) return;

    this.admin.deleteRole(role.id).subscribe({
      next: () => {
        if (this.selectedRoleId() === role.id) this.selectedRoleId.set(null);
        this.loadAll();
      },
      error: () => alert('❌ Xoá nhóm thất bại.')
    });
  }

  // ====== actions: MEMBER ======
  openAddMember(role: RoleDto) {
    this.memberForm.set({
      email: '',
      password: '',
      username: '',
      phone: '',
      address: '',
      roleId: role.id
    });
    this.showMemberModal.set(true);
  }

  createMember(memberRef: NgForm) {
    if (memberRef.invalid || !this.memberForm().roleId) return;
    const f = this.memberForm();

    this.admin.createUserAndAssignRole({
      email: f.email.trim(),
      password: f.password.trim(),
      username: f.username?.trim(),
      phone: f.phone?.trim(),
      address: f.address?.trim()
    }, f.roleId!).subscribe({
      next: () => { this.showMemberModal.set(false); this.loadAll(); },
      error: () => alert('❌ Tạo thành viên thất bại.')
    });
  }

  hasPermission(role: RoleDto | undefined, permName: string): boolean {
    if (!role || !role.permissions) return false;
    return role.permissions.some(p => p.name === permName);
  }

  countUsersByRole(roleId: number): number {
    return this.users()
      .filter(u => (u.roles && u.roles[0]?.id === roleId))
      .length;
  }



  reassignMember(u: AdminUserDto, newRoleId: number) {
    if (!newRoleId || u.roles?.[0]?.id === newRoleId) return;
    this.admin.assignRole(u.id, newRoleId).subscribe({
      next: () => this.loadAll(),
      error: () => alert('❌ Chuyển nhóm thất bại.')
    });
  }
}
