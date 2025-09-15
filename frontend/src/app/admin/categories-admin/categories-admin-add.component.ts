import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryAdminService } from '../../shared/services/category-admin.service';
import { Category } from '../../models/category.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-categories-admin-add',
   imports: [CommonModule, FormsModule],  // ✅
  templateUrl: './categories-admin-add.component.html'
})
export class CategoriesAdminAddComponent {
  category: Category = {
  name: '',
  description: '',
  isFeatured: false
} as Category;


  constructor(private categoryService: CategoryAdminService, private router: Router) {}

  save() {
    this.categoryService.create(this.category).subscribe(() => {
      this.router.navigate(['/admin/categories']);
    });
  }
}
