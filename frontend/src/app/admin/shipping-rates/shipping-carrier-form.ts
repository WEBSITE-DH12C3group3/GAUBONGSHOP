import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ShippingCarrierAdminService } from '../../shared/services/shipping-carrier-admin.service';

@Component({
  selector: 'app-shipping-carrier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './shipping-carrier-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShippingCarrierFormComponent implements OnInit {
  id?: number;
  form!: FormGroup;
  saving = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ShippingCarrierAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(120)]],
      active: [true]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : undefined;

    if (this.id) {
      this.loading = true;
      this.cdr.detectChanges();
      this.api.get(this.id)
        .pipe(finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (v) => {
            this.form.patchValue(v);
            this.cdr.detectChanges();
          }
        });
    } else {
      this.cdr.detectChanges();
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.cdr.detectChanges();

    const payload = this.form.value as any;
    const obs = this.id ? this.api.update(this.id!, payload)
                        : this.api.create(payload);

    obs.pipe(finalize(() => {
      this.saving = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: () => {
        this.router.navigateByUrl('/admin/shipping-rates');
      }
    });
  }
}
