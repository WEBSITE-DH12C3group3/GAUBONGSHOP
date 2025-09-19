import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ImportService } from '../../shared/services/import.service';
import { ImportModel } from '../../models/import.model';
import { ImportDetailModel } from '../../models/import-detail.model';

@Component({
  selector: 'app-import-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './import-detail.component.html'
})
export class ImportDetailComponent implements OnInit {
  importData: ImportModel | null = null;
  importDetails: ImportDetailModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private importService: ImportService,
    private cdr: ChangeDetectorRef   // ✅ inject
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.importService.getById(id).subscribe({
      next: (data) => {
        this.importData = data;
        this.importDetails = data.details || [];   // ✅ lấy luôn từ importData
        this.cdr.detectChanges();                  // ✅ ép Angular cập nhật view
      },
      error: (err) => {
        console.error('Lỗi khi load phiếu nhập:', err);
      }
    });
  }

  getTotal(): number {
    return this.importDetails.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0);
  }
}
