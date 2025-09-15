import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupplierAdminService } from '../../shared/services/supplier-admin.service';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './supplier-admin-form.html'
})
export class SupplierAdminFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(SupplierAdminService);

  id = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    contactPerson: ['', [Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    address: ['', [Validators.maxLength(10000)]]
  });

  constructor() {
    effect(() => {
      const paramId = this.route.snapshot.paramMap.get('id');
      if (paramId && paramId !== 'new') {
        this.id.set(+paramId);
        this.fetch(+paramId);
      }
    });
  }

  fetch(id: number) {
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: (s: Supplier) => {
        this.form.patchValue({
          name: s.name,
          contactPerson: s.contactPerson || s.contact_person || '',
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || ''
        });
        this.loading.set(false);
      },
      error: _ => this.loading.set(false)
    });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const payload = {
      name: this.form.value.name!,
      contactPerson: this.form.value.contactPerson || '',
      phone: this.form.value.phone || '',
      email: this.form.value.email || '',
      address: this.form.value.address || ''
    };

    const obs = this.id()
      ? this.api.update(this.id()!, payload)
      : this.api.create(payload);

    obs.subscribe({
      next: _ => { this.saving.set(false); this.router.navigate(['/admin/suppliers']); },
      error: err => { this.saving.set(false); alert(err?.error?.error || 'Có lỗi xảy ra'); }
    });
  }
}
