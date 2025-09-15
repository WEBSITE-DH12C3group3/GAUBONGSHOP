import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryAdminService } from '../../shared/services/category-admin.service';
import { Category } from '../../models/category.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],  // ✅ standalone cần khai báo ở đây
  templateUrl: './categories-admin-edit.component.html'
})
export class CategoriesAdminEditComponent implements OnInit {
  category: Category = {
    name: '',
    description: '',
    isFeatured: false
  } as Category;

  id!: number;

  constructor(
    private categoryService: CategoryAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef   // 👈 thêm vào
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.categoryService.getById(this.id).subscribe(data => {
      this.category = data;
      this.cdr.detectChanges();  // 👈 ép Angular render UI
    });
  }

  save() {
    this.categoryService.update(this.id, this.category).subscribe(() => {
      this.router.navigate(['/admin/categories']);
    });
  }
}
