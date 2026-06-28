import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryResponse } from '../../../core/model/dto/categoryDTO/categoryResponse.model';
import { SubcategoryResponse } from '../../../core/model/dto/subcategoryDTO/subcategoryResponse.model';
import { CategoryRequest } from '../../../core/model/dto/categoryDTO/categoryRequest.model';
import { CategoryService } from '../../../core/services/categoryService/category.service';
import { SubcategoryService } from '../../../core/services/subcategoryService/subcategory.service';
import { SubcategoryRequest } from '../../../core/model/dto/subcategoryDTO/subcategoryRequest.model';


@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: CategoryResponse[] = [];
  subcategories: SubcategoryResponse[] = [];

  loadingCategories = false;
  loadingSubcategories = false;
  error: string | null = null;

  categoryEditingId: number | null = null;
  categoryForm: CategoryRequest = { name: '' };

  subcategoryEditingId: number | null = null;
  subcategoryForm: { name: string; categoryId: number | null } = { name: '', categoryId: null };

  constructor(
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadCategories();
    this.loadSubcategories();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.error = 'Failed to load categories';
        this.loadingCategories = false;
      },
    });
  }

  loadSubcategories(): void {
    this.loadingSubcategories = true;
    this.subcategoryService.getAllSubcategories().subscribe({
      next: (res) => {
        this.subcategories = res;
        this.loadingSubcategories = false;
      },
      error: (err) => {
        console.error('Failed to load subcategories', err);
        this.error = 'Failed to load subcategories';
        this.loadingSubcategories = false;
      },
    });
  }

  startCreateCategory(): void {
    this.categoryEditingId = null;
    this.categoryForm = { name: '' };
    this.error = null;
  }

  startEditCategory(category: CategoryResponse): void {
    this.categoryEditingId = category.id;
    this.categoryForm = { name: category.name };
    this.error = null;
  }

  cancelCategoryEdit(): void {
    this.startCreateCategory();
  }

  saveCategory(): void {
    const name = this.categoryForm.name.trim();
    if (!name) {
      this.error = 'Category name is required';
      return;
    }

    const payload: CategoryRequest = { name };
    const request$ = this.categoryEditingId
      ? this.categoryService.updateCategory(this.categoryEditingId, payload)
      : this.categoryService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.loadCategories();
        this.cancelCategoryEdit();
      },
      error: (err) => {
        console.error('Failed to save category', err);
        this.error = 'Failed to save category';
      },
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category and its subcategories?')) {
      return;
    }

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to delete category', err);
        this.error = 'Failed to delete category';
      },
    });
  }

  startCreateSubcategory(): void {
    this.subcategoryEditingId = null;
    this.subcategoryForm = { name: '', categoryId: this.categories[0]?.id ?? null };
    this.error = null;
  }

  startEditSubcategory(subcategory: SubcategoryResponse): void {
    this.subcategoryEditingId = subcategory.id;
    this.subcategoryForm = { name: subcategory.name, categoryId: subcategory.categoryId };
    this.error = null;
  }

  cancelSubcategoryEdit(): void {
    this.startCreateSubcategory();
  }

  saveSubcategory(): void {
    const name = this.subcategoryForm.name.trim();
    const categoryId = this.subcategoryForm.categoryId;

    if (!name) {
      this.error = 'Subcategory name is required';
      return;
    }

    if (!categoryId) {
      this.error = 'Select a category for the subcategory';
      return;
    }

    const payload: SubcategoryRequest = { name, categoryId };
    const request$ = this.subcategoryEditingId
      ? this.subcategoryService.updateSubcategory(this.subcategoryEditingId, payload)
      : this.subcategoryService.createSubcategory(payload);

    request$.subscribe({
      next: () => {
        this.loadData();
        this.cancelSubcategoryEdit();
      },
      error: (err) => {
        console.error('Failed to save subcategory', err);
        this.error = 'Failed to save subcategory';
      },
    });
  }

  deleteSubcategory(id: number): void {
    if (!confirm('Delete this subcategory?')) {
      return;
    }

    this.subcategoryService.deleteSubcategory(id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to delete subcategory', err);
        this.error = 'Failed to delete subcategory';
      },
    });
  }

  subcategoriesForCategory(categoryId: number): SubcategoryResponse[] {
    return this.subcategories.filter((subcategory) => subcategory.categoryId === categoryId);
  }

  categoryNameForSubcategory(subcategory: SubcategoryResponse): string {
    return this.categories.find((category) => category.id === subcategory.categoryId)?.name || 'Unknown';
  }

  get categoryCount(): number {
    return this.categories.length;
  }

  get subcategoryCount(): number {
    return this.subcategories.length;
  }
}