import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { RoleService } from '../../shared/services/role.service';
import { finalize, forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-role-permissions-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-permissions-page.html'
})
export class RolePermissionsPageComponent {
  roles: Role[] = [];
  allPerms: Permission[] = [];
  /** roleId -> set(permId) */
  checked: Record<number, Set<number>> = {};
  busy: Record<number, boolean> = {};
  toast = '';

  constructor(
    private roleSrv: RoleService,
    private cdr: ChangeDetectorRef          // ⬅️ thêm CDR
  ) {
    this.load();
  }

  private load() {
    this.roleSrv.listRoles().pipe(
      switchMap((rs) => {
        this.roles = rs;
        return forkJoin({
          all: this.roleSrv.listAllPermissions(),
          perRole: rs.length
            ? forkJoin(rs.map(r => this.roleSrv.getRolePermissions(r.id)))
            : of<Permission[][]>([])
        });
      })
    ).subscribe(({ all, perRole }) => {
      this.allPerms = all;
      perRole.forEach((plist, idx) => {
        const roleId = this.roles[idx].id;
        this.checked[roleId] = new Set(plist.map(x => x.id));
      });

      this.cdr.detectChanges();            // ⬅️ force update sau khi set state
    });
  }

  isChecked(roleId: number, permId: number) {
    return this.checked[roleId]?.has(permId) ?? false;
  }

  toggle(roleId: number, permId: number, e: Event) {
    const set = this.checked[roleId] ??= new Set<number>();
    (e.target as HTMLInputElement).checked ? set.add(permId) : set.delete(permId);
  }

  save(r: Role) {
    const ids = Array.from(this.checked[r.id] ?? []);
    this.busy[r.id] = true;
    this.cdr.detectChanges();              // ⬅️ cập nhật nút “Đang lưu…”

    this.roleSrv.setRolePermissions(r.id, ids).pipe(
      finalize(() => {
        delete this.busy[r.id];
        this.cdr.detectChanges();          // ⬅️ cập nhật lại trạng thái nút sau khi xong
      })
    ).subscribe({
      next: () => {
        this.ok(`Đã lưu quyền cho "${r.name}"`);
      },
      error: (err) => {
        this.ok(`Lỗi lưu quyền: ${err?.status || ''}`);
      }
    });
  }

  private ok(m: string) {
    this.toast = m;
    this.cdr.detectChanges();              // ⬅️ hiện toast ngay
    setTimeout(() => { this.toast = ''; this.cdr.detectChanges(); }, 2000);
  }
}
