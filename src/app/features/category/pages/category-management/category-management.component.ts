import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { CategoryService } from '../../services/categoryService/category.service';
import { SubcategoryService } from '../../services/subcategoryService/subcategory.service';
import { CategoryResponse } from '../../models/categoryDTO/categoryResponse.model';
import { SubcategoryResponse } from '../../models/subcategoryDTO/subcategoryResponse.model';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { ToastService } from '../../../../core/ui/toast.service';
import { ConfirmService } from '../../../../core/ui/confirm.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { Check, ChevronRight, FolderTree, Layers, Pencil, Plus, Trash2, X } from '../../../../core/ui/icons';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [DecimalPipe, NgTemplateOutlet, FormsModule, RouterLink, LucideAngularModule, EmptyStateComponent],
  templateUrl: './category-management.component.html',
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private subcategoryService = inject(SubcategoryService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  readonly categories = signal<CategoryResponse[]>([]);
  readonly subcategories = signal<SubcategoryResponse[]>([]);
  readonly selectedId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);

  // Inline editing: one row at a time, 'new' for the add row
  readonly editingCategory = signal<number | 'new' | null>(null);
  readonly editingSubcategory = signal<number | 'new' | null>(null);
  draftName = '';

  readonly selected = computed(() => this.categories().find(c => c.id === this.selectedId()) ?? null);
  readonly selectedSubcategories = computed(() => this.subcategories().filter(s => s.categoryId === this.selectedId()));

  protected readonly icons = { Plus, Pencil, Trash2, Check, X, ChevronRight, FolderTree, Layers };

  ngOnInit(): void {
    this.load();
  }

  load() {
    forkJoin({ categories: this.categoryService.getAllCategories(), subcategories: this.subcategoryService.getAllSubcategories() }).subscribe({
      next: ({ categories, subcategories }) => {
        this.categories.set(categories);
        this.subcategories.set(subcategories);
        if (!categories.some(c => c.id === this.selectedId())) {
          this.selectedId.set(categories[0]?.id ?? null);
        }
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not load categories.'));
      }
    });
  }

  subcategoryCount(categoryId: number): number {
    return this.subcategories().filter(s => s.categoryId === categoryId).length;
  }

  productCount(categoryId: number): number {
    return this.subcategories().filter(s => s.categoryId === categoryId).reduce((sum, s) => sum + (s.productCount ?? 0), 0);
  }

  // ── Categories ──

  startCategory(category: CategoryResponse | null) {
    this.editingSubcategory.set(null);
    this.editingCategory.set(category ? category.id : 'new');
    this.draftName = category?.name ?? '';
  }

  saveCategory() {
    const name = this.draftName.trim();
    if (!name) return;
    const editing = this.editingCategory();
    const request$ = editing === 'new'
      ? this.categoryService.createCategory({ name })
      : this.categoryService.updateCategory(editing as number, { name });

    this.busy.set(true);
    request$.subscribe({
      next: saved => {
        this.busy.set(false);
        this.editingCategory.set(null);
        this.toast.success(editing === 'new' ? `Category "${name}" created.` : 'Category renamed.');
        if (editing === 'new') this.selectedId.set(saved.id);
        this.load();
      },
      error: err => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not save the category.'));
      }
    });
  }

  async deleteCategory(category: CategoryResponse) {
    const subs = this.subcategoryCount(category.id);
    const ok = await this.confirm.ask({
      title: `Delete "${category.name}"?`,
      message: subs ? `Its ${subs} subcategories are deleted too. This is only possible when no product uses them.` : 'This category has no subcategories.',
      confirmLabel: 'Delete', tone: 'danger',
    });
    if (!ok) return;

    this.busy.set(true);
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success(`Category "${category.name}" deleted.`);
        this.load();
      },
      error: err => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not delete the category.'));
      }
    });
  }

  // ── Subcategories ──

  startSubcategory(subcategory: SubcategoryResponse | null) {
    this.editingCategory.set(null);
    this.editingSubcategory.set(subcategory ? subcategory.id : 'new');
    this.draftName = subcategory?.name ?? '';
  }

  saveSubcategory() {
    const name = this.draftName.trim();
    const categoryId = this.selectedId();
    if (!name || !categoryId) return;
    const editing = this.editingSubcategory();
    const request$ = editing === 'new'
      ? this.subcategoryService.createSubcategory({ name, categoryId })
      : this.subcategoryService.updateSubcategory(editing as number, { name, categoryId });

    this.busy.set(true);
    request$.subscribe({
      next: () => {
        this.busy.set(false);
        this.editingSubcategory.set(null);
        this.toast.success(editing === 'new' ? `Subcategory "${name}" created.` : 'Subcategory renamed.');
        this.load();
      },
      error: err => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not save the subcategory.'));
      }
    });
  }

  async deleteSubcategory(subcategory: SubcategoryResponse) {
    if (subcategory.productCount) {
      this.toast.error(`${subcategory.productCount} products use "${subcategory.name}". Move them to another subcategory first.`);
      return;
    }
    const ok = await this.confirm.ask({ title: `Delete "${subcategory.name}"?`, message: 'No product uses it, so nothing else changes.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;

    this.busy.set(true);
    this.subcategoryService.deleteSubcategory(subcategory.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success(`Subcategory "${subcategory.name}" deleted.`);
        this.load();
      },
      error: err => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not delete the subcategory.'));
      }
    });
  }

  cancelEdit() {
    this.editingCategory.set(null);
    this.editingSubcategory.set(null);
  }
}
