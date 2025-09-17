import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Role } from '../../models/role.model';
import { User } from '../../models/user.model';
import { RoleService } from '../../shared/services/role.service';
import { UserService } from '../../shared/services/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-page.html'
})
export class RolesPageComponent {
  roles: Role[] = [];
  loading = false;

  showCreate = false; newName = '';
  showRename = false; renameTarget?: Role; renameValue = '';
  showMembers = false; membersRole?: Role;
  search = ''; candidates: User[] = [];
  addBusy = false; removeBusy: Record<number, boolean> = {};
  toast = '';

  constructor(private roleSrv: RoleService, private userSrv: UserService) { this.load(); }

  load() {
    this.loading = true;
    this.roleSrv.listRoles().pipe(finalize(() => this.loading = false))
      .subscribe(rs => this.roles = rs);
  }

  // create
  openCreate(){ this.newName=''; this.showCreate=true; }
  create(){
    if(!this.newName.trim()) return;
    this.roleSrv.createRole(this.newName.trim()).subscribe(()=>{ this.showCreate=false; this.ok('Đã tạo nhóm'); this.load(); });
  }

  // rename
  openRename(r: Role){ this.renameTarget=r; this.renameValue=r.name; this.showRename=true; }
  rename(){
    if(!this.renameTarget) return;
    this.roleSrv.updateRole(this.renameTarget.id, this.renameValue.trim() || this.renameTarget.name)
      .subscribe(()=>{ this.showRename=false; this.ok('Đã cập nhật'); this.load(); });
  }

  // delete
  remove(r: Role){
    if(!confirm(`Xoá nhóm "${r.name}"?`)) return;
    this.roleSrv.deleteRole(r.id).subscribe(()=>{ this.ok('Đã xoá'); this.load(); });
  }

  // members
  openMembers(r: Role){ this.membersRole=r; this.showMembers=true; this.search=''; this.candidates=[]; }
  lookupUsers(){
    if(!this.search.trim()){ this.candidates=[]; return; }
    this.userSrv.searchUsers(this.search.trim()).subscribe(res=> this.candidates=res.content);
  }
  addToRole(u: User){
    if(!this.membersRole) return;
    this.addBusy=true;
    this.roleSrv.addUserToRole(u.id, this.membersRole.id).pipe(finalize(()=> this.addBusy=false))
      .subscribe(()=> this.ok('Đã thêm thành viên'));
  }
  removeFromRole(u: User){
    if(!this.membersRole) return;
    this.removeBusy[u.id]=true;
    this.roleSrv.removeUserFromRole(u.id, this.membersRole.id).pipe(finalize(()=> delete this.removeBusy[u.id]))
      .subscribe(()=> this.ok('Đã gỡ thành viên'));
  }

  private ok(m:string){ this.toast=m; setTimeout(()=> this.toast='', 2000); }
}
