import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryAdminService } from '../../shared/services/category_admin.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories-admin-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-admin-add.component.html'
})
export class CategoriesAdminAddComponent {
  category: Category = {
    name: '',
    description: '',
    isFeatured: false
  } as Category;

  constructor(
    private categoryService: CategoryAdminService,
    private router: Router
  ) {}

  save() {
    this.categoryService.create(this.category).subscribe({
      next: () => {
        alert('✅ Thêm danh mục thành công!');
        this.router.navigate(['/admin/categories']);
      },
      error: (err) => {
  console.error('❌ Lỗi thêm danh mục:', err);
  if (err.status === 409) {
    alert('⚠️ Danh mục này đã tồn tại!');
  } else if (err.status === 400) {
    alert('⚠️ Dữ liệu không hợp lệ!');
  } else {
    alert('❌ Có lỗi xảy ra, vui lòng thử lại sau!');
  }
}

    });
  }
}
