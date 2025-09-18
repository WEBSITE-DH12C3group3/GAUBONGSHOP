import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, debounceTime, switchMap, tap } from 'rxjs';
import { Role } from '../../models/role.model';
import { User } from '../../models/user.model';
import { RoleService } from '../../shared/services/role.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-page.html'
})
export class RolesPageComponent {
  // Roles
  roles: Role[] = [];
  selectedRole?: Role;
  roleMemberCount: Record<number, number> = {};

  // Users (top table)
  users: User[] = [];
  usersPage = 0; usersSize = 10; usersTotal = 0; usersTotalPages = 0;
  userQ = ''; filterRoleId = 0;
  usersLoading = false;
  private userSearch$ = new Subject<string>();

  // Members (right table)
  roleMembers: User[] = [];
  membersPage = 0; membersSize = 10; membersTotal = 0; membersTotalPages = 0;
  memberQ = '';
  membersLoading = false;

  // Picker for add-member
  showAddMember = false;
  pickerQ = ''; pickerUsers: User[] = [];

  // Modals: role CRUD
  showCreateRole = false; newRoleName = '';
  showRenameRole = false; renameRoleValue = '';

  // Modal: create user
  showCreateUser = false;
  newUser: any = { username: '', phone: '', email: '', password: '', password2: '' };
  draftUserRoleIds = new Set<number>();

  toast = '';

  constructor(private roleSrv: RoleService, private userSrv: UserService) {
    this.loadRoles();
    this.setupUserSearchDebounce();
    this.reloadUsers();
  }

  /* ---------- Utils ---------- */
  private ok(m: string) { this.toast = m; setTimeout(() => this.toast = '', 2000); }
  isSystemRole(r: Role) { // không thao tác với ADMIN, CUSTOMER
    const name = (r.name || '').toUpperCase();
    return name === 'ADMIN' || name === 'CUSTOMER';
  }
  isProtectedUser(u: User) {
    // không xoá khi thuộc ADMIN 
    return (u.roles || []).some(r => (r.name || '').toUpperCase() === 'ADMIN');
  }

  /* ---------- Roles ---------- */
  loadRoles() {
    this.roleSrv.listRoles().subscribe(rs => {
      this.roles = rs;
      // chọn role đầu tiên không phải system
      this.selectedRole = this.roles.find(r => !this.isSystemRole(r));
      if (this.selectedRole) this.reloadMembers(true);
      // đếm nhanh số member từng role (tuỳ BE: có thể cần endpoint riêng; fallback client)
      this.roles.forEach(r => this.countMembers(r.id));
    });
  }

  selectRole(r: Role) {
    this.selectedRole = r;
    this.membersPage = 0;
    this.memberQ = '';
    this.reloadMembers(true);
  }

  openCreateRole() { this.newRoleName = ''; this.showCreateRole = true; }
  createRole() {
    const name = this.newRoleName.trim();
    if (!name) return;
    this.roleSrv.createRole(name).subscribe({
      next: () => { this.showCreateRole = false; this.ok('Đã tạo nhóm'); this.loadRoles(); },
    });
  }

  openRenameRole() {
    if (!this.selectedRole) return;
    this.renameRoleValue = this.selectedRole.name;
    this.showRenameRole = true;
  }
  renameRole() {
    if (!this.selectedRole) return;
    const name = this.renameRoleValue.trim() || this.selectedRole.name;
    this.roleSrv.updateRole(this.selectedRole.id, name).subscribe({
      next: (r) => {
        this.showRenameRole = false;
        this.ok('Đã cập nhật tên nhóm');
        // cập nhật local
        const idx = this.roles.findIndex(x => x.id === r.id);
        if (idx >= 0) this.roles[idx] = r;
      }
    });
  }

  deleteRole() {
    if (!this.selectedRole) return;
    if (this.isSystemRole(this.selectedRole)) return;
    if (!confirm(`Xoá nhóm "${this.selectedRole.name}"?`)) return;
    this.roleSrv.deleteRole(this.selectedRole.id).subscribe({
      next: () => {
        this.ok('Đã xoá nhóm');
        this.selectedRole = undefined;
        this.loadRoles();
      }
    });
  }

  private countMembers(roleId: number) {
    // Tuỳ BE: nếu chưa có endpoint count, gọi list trang 0 size nhỏ để lấy total
    this.roleSrv.listRoleUsers(roleId, 0, 1, '').subscribe(res => {
      this.roleMemberCount[roleId] = res.totalElements ?? res.content?.length ?? 0;
    });
  }

  /* ---------- Users (top) ---------- */
    // setupUserSearchDebounce() {
    //     this.userSearch$
    //     .pipe(
    //         debounceTime(300),
    //         switchMap(() => this.fetchUsers())
    //     )
    //     .subscribe();
    // }
        // Debounce gõ phím ở ô tìm kiếm bảng Users (dùng userQ)
    setupUserSearchDebounce() {
    this.userSearch$
        .pipe(debounceTime(300), switchMap(() => this.fetchUsers()))
        .subscribe(); // fetchUsers sẽ tự cập nhật state
    }

// handler cho (ngModelChange)
onUserSearchChange(term: string) {
  this.userQ = term ?? '';
  this.userSearch$.next(this.userQ);
}

  resetUserFilters() {
    this.userQ = ''; this.filterRoleId = 0; this.usersPage = 0;
    this.reloadUsers();
  }
  reloadUsers() { this.fetchUsers().subscribe(); }

    private fetchUsers() {
    this.usersLoading = true;
    return this.userSrv.searchUsers(
        this.userQ.trim(),
        this.filterRoleId || undefined,
        ['ADMIN', 'CUSTOMER'],          // loại nhóm hệ thống khỏi bảng trên
        this.usersPage, this.usersSize
    ).pipe(
        tap((res: any) => {
        this.users = res.content || [];
        this.usersTotal = res.totalElements ?? res.total ?? this.users.length ?? 0;
        this.usersTotalPages = Math.max(1, Math.ceil(this.usersTotal / this.usersSize));
        }),
        finalize(() => this.usersLoading = false)
    );
    }


  prevUsersPage() { if (this.usersPage > 0) { this.usersPage--; this.reloadUsers(); } }
  nextUsersPage() { if ((this.usersPage + 1) < this.usersTotalPages) { this.usersPage++; this.reloadUsers(); } }

  /* ---------- Members (right) ---------- */
  reloadMembers(reset = false) {
    if (!this.selectedRole) return;
    if (reset) this.membersPage = 0;
    this.membersLoading = true;
    this.roleSrv.listRoleUsers(this.selectedRole.id, this.membersPage, this.membersSize, this.memberQ).pipe(
      finalize(() => this.membersLoading = false)
    ).subscribe(res => {
      this.roleMembers = res.content;
      this.membersTotal = res.totalElements ?? res.content.length;
      this.membersTotalPages = Math.max(1, Math.ceil(this.membersTotal / this.membersSize));
      this.countMembers(this.selectedRole!.id);
    });
  }

  prevMembersPage() { if (this.membersPage > 0) { this.membersPage--; this.reloadMembers(); } }
  nextMembersPage() { if ((this.membersPage + 1) < this.membersTotalPages) { this.membersPage++; this.reloadMembers(); } }

  openAddMember() { if (!this.selectedRole) return; this.showAddMember = true; this.pickerQ = ''; this.pickerUsers = []; }
  searchPicker() {
    this.userSrv.searchUsers(this.pickerQ.trim(), undefined, [], 0, 20).subscribe(res => this.pickerUsers = res.content);
  }
  addMember(u: User) {
    if (!this.selectedRole) return;
    this.roleSrv.addUserToRole(u.id, this.selectedRole.id).subscribe({
      next: () => { this.ok('Đã thêm thành viên'); this.showAddMember = false; this.reloadMembers(true); }
    });
  }
  removeMember(u: User) {
    if (!this.selectedRole) return;
    this.roleSrv.removeUserFromRole(u.id, this.selectedRole.id).subscribe({
      next: () => { this.ok('Đã gỡ khỏi nhóm'); this.reloadMembers(); }
    });
  }

  openAssignRoleForUser(u: User) {
    // shortcut: mở picker + prefill query
    this.selectedRole ? this.openAddMember() : null;
    this.pickerQ = u.email || (u.username || '');
    this.searchPicker();
  }
  deleteUser(u: User) {
    // để ngỏ tuỳ BE (nếu chưa có API delete user thì ẩn nút này)
    alert('Tuỳ backend: cần API xoá user. Hiện mình không gọi xoá.');
  }

  /* ---------- Create User ---------- */
  openCreateUser() { this.newUser = { username:'', phone:'', email:'', password:'', password2:'' }; this.draftUserRoleIds.clear(); this.showCreateUser = true; }
  toggleDraftUserRole(id: number, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    checked ? this.draftUserRoleIds.add(id) : this.draftUserRoleIds.delete(id);
  }
  createUser() {
    if (!this.newUser.email?.trim() || !this.newUser.password?.trim()) return;
    if (this.newUser.password !== this.newUser.password2) { alert('Mật khẩu nhập lại không khớp'); return; }
    this.userSrv.createUser({
      username: this.newUser.username?.trim() || undefined,
      phone: this.newUser.phone?.trim() || undefined,
      email: this.newUser.email.trim(),
      password: this.newUser.password.trim(),
      roleIds: Array.from(this.draftUserRoleIds)
    }).subscribe({
      next: () => { this.ok('Đã tạo tài khoản'); this.showCreateUser = false; this.reloadUsers(); }
    });
  }
}
