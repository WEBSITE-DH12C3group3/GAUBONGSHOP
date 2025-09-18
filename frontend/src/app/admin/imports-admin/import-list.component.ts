import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImportService, } from '../../shared/services/import.service';;
import { ImportModel } from '../../models/import.model';
@Component({
  selector: 'app-import-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './import-list.component.html'
})
export class ImportListComponent implements OnInit {
  imports: ImportModel[] = [];
  keyword = '';
  statusFilter = '';

  constructor(
    private importService: ImportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadImports();
  }

  loadImports() {
    this.importService.getAll().subscribe((data: ImportModel[]) => {
      this.imports = data;
      this.cdr.detectChanges();  // ✅ bắt Angular render lại
    });
  }

  searchImports() {
    this.importService.search(this.keyword, this.statusFilter).subscribe((data: ImportModel[]) => {
      this.imports = data;
      this.cdr.detectChanges();  // ✅ thêm ở đây nữa
    });
  }

  deleteImport(id: number) {
    if (confirm('Bạn có chắc muốn xóa phiếu nhập này?')) {
      this.importService.delete(id).subscribe(() => {
        this.loadImports();
        this.cdr.detectChanges();  // ✅ đảm bảo sau khi xóa thì render lại
      });
    }
  }
}
