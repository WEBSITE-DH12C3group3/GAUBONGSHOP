import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomersAdminService, CustomerDTO, CustomerStatus, CustomerTier } from '../../shared/services/customers-admin.service';
import { Page } from '../../models/page.model';

@Component({
  selector: 'app-customers-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './customers-admin.html',
  styleUrls: ['./customers-admin.css']
})
export class CustomersAdminComponent implements OnInit {
  // Filters
  q = ''; status = ''; tier = '';
  createdFrom = ''; createdTo = '';
  page = 0; size = 10; sort = 'createdAt,desc';

  data: Page<CustomerDTO> | null = null;
  loading = false;
  errorMsg = '';

  // Modal create/edit
  showModal = false;
  isEdit = false;
  form: any = {
    id: null,
    username: '',
    password: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE' as CustomerStatus,
    tier: 'DONG' as CustomerTier
  };

  statuses: CustomerStatus[] = ['ACTIVE','INACTIVE','BANNED'];
  tiers: CustomerTier[] = ['DONG','BAC','VANG','BACHKIM','KIMCUONG'];

  constructor(private api: CustomersAdminService, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.errorMsg = '';
    this.api.search({
      q: this.q || undefined,
      status: this.status as CustomerStatus || undefined,
      tier: this.tier as CustomerTier || undefined,
      createdFrom: this.createdFrom || undefined,
      createdTo: this.createdTo || undefined,
      page: this.page, size: this.size, sort: this.sort
    }).subscribe({
      next: (res) => { this.data = res; this.loading = false; this.cdr.markForCheck(); },
      error: (err) => { this.loading = false; this.errorMsg = 'Không tải được danh sách khách hàng.'; console.error(err); }
    });
  }

  // CRUD
  openCreate() {
    this.isEdit = false;
    this.form = { id: null, username: '', password: '', email: '', phone: '', address: '', status: 'ACTIVE', tier: 'DONG' };
    this.showModal = true;
  }
  openEdit(x: CustomerDTO) {
    this.isEdit = true;
    this.form = { ...x, password: '' };
    this.showModal = true;
  }

  save() {
    if (this.isEdit) {
      const { id, password, ...rest } = this.form;
      const body: any = { ...rest };
      if (password) body.password = password;
      this.api.update(id, body).subscribe({
        next: _ => { this.showModal = false; this.load(); },
        error: e => console.error(e)
      });
    } else {
      this.api.create(this.form).subscribe({
        next: _ => { this.showModal = false; this.load(); },
        error: e => console.error(e)
      });
    }
  }

  remove(id: number) {
    if (!confirm('Xóa khách hàng này?')) return;
    this.api.remove(id).subscribe({ next: _ => this.load(), error: e => console.error(e) });
  }

  setStatus(x: CustomerDTO, status: CustomerStatus) { this.api.setStatus(x.id, status).subscribe(_ => this.load()); }
  setTier(x: CustomerDTO, tier: CustomerTier) { this.api.setTier(x.id, tier).subscribe(_ => this.load()); }

  // Pagination
  go(p: number) {
    if (!this.data) return;
    if (p < 0 || p > this.data.totalPages - 1) return;
    this.page = p;
    this.load();
  }
}
