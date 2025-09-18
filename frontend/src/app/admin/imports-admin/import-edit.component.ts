import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImportService, } from '../../shared/services/import.service';;
import { ImportModel } from '../../models/import.model';
@Component({
  selector: 'app-import-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-edit.component.html'
})
export class ImportEditComponent implements OnInit {
  importData?: ImportModel;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private importService: ImportService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.importService.getById(id).subscribe(data => {
      this.importData = data;
    });
  }

  updateImport() {
    if (!this.importData) return;
    this.importService.update(this.importData.id, this.importData).subscribe(() => {
      this.router.navigate(['/admin/imports']);
    });
  }
}
