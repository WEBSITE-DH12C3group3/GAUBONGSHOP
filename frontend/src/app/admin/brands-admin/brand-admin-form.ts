import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandAdminService } from '../../shared/services/brand-admin.service';
import { Brand } from '../../models/brand.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-brand-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './brand-admin-form.html'
})
export class BrandAdminFormComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(BrandAdminService);

  // ----- state chung -----
  id = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  uploading = signal(false);

  // ----- state ảnh & UX -----
  pickedFile: File | null = null;
  previewUrl: string | null = null; // ObjectURL hoặc URL đã chuẩn hoá từ form.logoUrl
  pickedFileName = '';
  pickedFileSize = '';
  dropActive = false;

  // ----- form -----
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    websiteUrl: [''],
    logoUrl: ['']
  });

  constructor() {
    // Theo dõi paramMap để hỗ trợ chuyển qua lại new/<id> mà không destroy component
    this.route.paramMap.subscribe((pm: ParamMap) => {
      const paramId = pm.get('id');
      if (paramId && paramId !== 'new') {
        const num = +paramId;
        this.id.set(num);
        this.fetch(num);
      } else {
        // tạo mới
        this.id.set(null);
        this.form.reset({
          name: '',
          description: '',
          websiteUrl: '',
          logoUrl: ''
        });
        this.clearPickedFile();
        this.syncPreviewFromUrl(); // sẽ về null
      }
    });
  }

  // ----- lifecycle -----
  ngOnDestroy(): void {
    if (this.previewUrl && this.pickedFile) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  // ===== API =====
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
        // cập nhật preview theo logoUrl hiện có (chuẩn hoá absolute)
        this.syncPreviewFromUrl();
      },
      error: _ => this.loading.set(false)
    });
  }

  // ===== File pick & drag/drop =====
  onPickFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.setPickedFile(file);
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropActive = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropActive = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropActive = false;

    if (!e.dataTransfer || !e.dataTransfer.files?.length) return;
    const file = e.dataTransfer.files[0];
    this.setPickedFile(file);
  }

  private setPickedFile(file: File) {
    const allow = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allow.includes(file.type)) {
      alert('Vui lòng chọn ảnh hợp lệ (jpg, png, webp, gif, svg).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước tối đa 10MB.');
      return;
    }

    this.pickedFile = file;
    this.pickedFileName = file.name;
    this.pickedFileSize = this.prettySize(file.size);

    // tạo preview object URL
    if (this.previewUrl && this.pickedFile) {
      try { URL.revokeObjectURL(this.previewUrl); } catch {}
    }
    this.previewUrl = URL.createObjectURL(file);
  }

  clearPickedFile() {
    if (this.previewUrl && this.pickedFile) {
      try { URL.revokeObjectURL(this.previewUrl); } catch {}
    }
    this.pickedFile = null;
    this.pickedFileName = '';
    this.pickedFileSize = '';
    // quay về preview theo logoUrl đang có trong form (đã chuẩn hoá)
    const url = this.toAbsUrl(this.form.value.logoUrl || null);
    this.previewUrl = url;
  }

  // Khi người dùng gõ/đổi URL thủ công
  syncPreviewFromUrl() {
    if (this.pickedFile) return; // ưu tiên file tạm nếu có
    const url = this.form.value.logoUrl || null;
    this.previewUrl = this.toAbsUrl(url);
  }

  // ===== Upload =====
  uploadLogo() {
    if (!this.pickedFile) return;
    this.uploading.set(true);
    this.api.uploadLogo(this.pickedFile).subscribe({
      next: r => {
        // set URL từ server vào form
        this.form.patchValue({ logoUrl: r.url });
        // dùng preview theo logoUrl đã chuẩn hoá
        this.clearPickedFile();
        this.uploading.set(false);
      },
      error: _ => this.uploading.set(false)
    });
  }

  // Upload & gán trực tiếp (1 bước) — chỉ dùng khi đang sửa (có id)
  assignLogoDirect() {
    if (!this.pickedFile || !this.id()) return;
    this.uploading.set(true);
    this.api.uploadAndAssignLogo(this.id()!, this.pickedFile, true).subscribe({
      next: r => {
        this.form.patchValue({ logoUrl: r.brand.logoUrl });
        this.clearPickedFile();
        this.uploading.set(false);
      },
      error: _ => this.uploading.set(false)
    });
  }

  // ===== Save =====
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

  cancel() {
    history.back();
  }

  // ===== Utils =====
  private prettySize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  /**
   * Lấy origin backend từ environment.apiUrl ('http://localhost:8080/api' -> 'http://localhost:8080')
   */
  private backendOrigin(): string {
    try {
      const u = new URL(environment.apiUrl);
      return u.origin; // protocol + '//' + host(:port)
    } catch {
      return location.origin;
    }
  }

  /**
   * Chuẩn hoá URL ảnh về tuyệt đối:
   * - Nếu đã là http(s):// -> giữ nguyên
   * - Nếu là tương đối (/brandimg/…) -> ghép với origin backend (KHÔNG ghép /api)
   */
  private toAbsUrl(input: string | null): string | null {
    if (!input) return null;
    const u = input.trim();
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    const origin = this.backendOrigin().replace(/\/+$/, '');
    const path = u.startsWith('/') ? u : `/${u}`;
    return `${origin}${path}`;
  }
}
