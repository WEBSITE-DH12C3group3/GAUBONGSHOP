import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandAdminService } from '../../shared/services/brand-admin.service';
import { Brand } from '../../models/brand.model';

@Component({
  selector: 'app-brand-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './brand-admin-form.html'
})
export class BrandAdminFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(BrandAdminService);

  id = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    websiteUrl: [''],
    logoUrl: ['']
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
    this.api.getById(id).subscribe({
      next: (b: Brand) => {
        this.form.patchValue({
          name: b.name,
          description: b.description || '',
          websiteUrl: b.websiteUrl || (b as any).website_url || '',
          logoUrl: b.logoUrl || (b as any).logo_url || ''
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
      description: this.form.value.description || '',
      websiteUrl: this.form.value.websiteUrl || '',
      logoUrl: this.form.value.logoUrl || ''
    };

    const obs = this.id()
      ? this.api.update(this.id()!, payload)
      : this.api.create(payload);

    obs.subscribe({
      next: _ => { this.saving.set(false); this.router.navigate(['/admin/brands']); },
      error: _ => this.saving.set(false)
    });
  }
}