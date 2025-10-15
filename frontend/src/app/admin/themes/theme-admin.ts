import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { forkJoin } from 'rxjs';

import { ThemeService } from '../../shared/services/theme.service';
import { Theme, ThemeReq } from '../../models/theme.model';
import { CategoryService } from '../../shared/services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-theme-admin',
  templateUrl: './theme-admin.html',
  styleUrls: ['./theme-admin.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink],
})
export class ThemeAdminComponent implements OnInit {
  private themeSrv = inject(ThemeService);
  private categorySrv = inject(CategoryService);

  themes: Theme[] = [];
  categories: Category[] = [];

  loading = false;
  editing: Theme | null = null;

  form: ThemeReq = {
    name: '',
    slug: '',
    description: '',
    categoryIds: []
  };

  ngOnInit() {
    this.fetchAll();
  }

  fetchAll() {
    this.loading = true;
    forkJoin({
      themes: this.themeSrv.adminList(),
      cats: this.categorySrv.getAll()
    }).subscribe({
      next: ({ themes, cats }) => {
        this.themes = themes || [];
        this.categories = cats || [];
      },
      complete: () => (this.loading = false)
    });
  }

  startCreate() {
    this.editing = null;
    this.form = { name: '', slug: '', description: '', categoryIds: [] };
  }

  startEdit(t: Theme) {
    this.editing = t;
    this.form = {
      name: t.name,
      slug: t.slug,
      description: t.description || '',
      categoryIds: (t.categories || []).map(c => c.id)
    };
  }

  save() {
    if (!this.form.name?.trim()) return;

    const payload: ThemeReq = {
      name: this.form.name.trim(),
      slug: this.form.slug?.trim(),
      description: this.form.description?.trim(),
      categoryIds: this.form.categoryIds || []
    };

    const req = this.editing
      ? this.themeSrv.update(this.editing.id, payload)
      : this.themeSrv.create(payload);

    req.subscribe({
      next: () => {
        this.startCreate();
        this.fetchAll();
      }
    });
  }

  remove(t: Theme) {
    if (!confirm(`Xoá chủ đề "${t.name}"?`)) return;
    this.themeSrv.delete(t.id).subscribe(() => this.fetchAll());
  }

  isSelectedCat(id: number) {
    return this.form.categoryIds.includes(id);
  }

  toggleCat(id: number) {
    const i = this.form.categoryIds.indexOf(id);
    if (i >= 0) this.form.categoryIds.splice(i, 1);
    else this.form.categoryIds.push(id);
    this.form.categoryIds = [...this.form.categoryIds];
  }
}
