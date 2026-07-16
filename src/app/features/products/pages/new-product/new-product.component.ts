import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';

import { CompanyResponse } from '../../../companies/models/companyDTO/companyResponse.model';
import { SubcategoryResponse } from '../../../category/models/subcategoryDTO/subcategoryResponse.model';

import { ProductService } from '../../services/productService/product.service';
import { CompanyService } from '../../../companies/services/companyService/company.service';
import { SubcategoryService } from '../../../category/services/subcategoryService/subcategory.service';

import { ProductRequest } from '../../models/productDTO/productRequest.model';
import { ProductStatus } from '../../enums/productStatus.enum.model';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css'
})
export class NewProductComponent implements OnInit {

  name = '';
  description = '';

  selectedSubcategoryId: number | null = null;
  selectedCompanyId: number | null = null;

  status: ProductStatus | null = null;

  productStatusValues = Object.values(ProductStatus);

  companies: CompanyResponse[] = [];
  subcategories: SubcategoryResponse[] = [];

  images: File[] = [];

  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private companyService: CompanyService,
    private subcategoryService: SubcategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadSubcategories();
  }

  loadCompanies() {
    this.companyService.getAllCompanies().subscribe({
      next: res => this.companies = res,
      error: err => console.error(err)
    });
  }

  loadSubcategories() {
    this.subcategoryService.getAllSubcategories().subscribe({
      next: res => this.subcategories = res,
      error: err => console.error(err)
    });
  }

  onImagesSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    this.images = Array.from(input.files);

  }

  save() {

    this.error = null;

    if (!this.name.trim()) {
      this.error = 'Name is required';
      return;
    }

    if (!this.selectedCompanyId) {
      this.error = 'Select a company';
      return;
    }

    const payload: ProductRequest = {

      name: this.name,
      description: this.description || null,

      subcategoryId: this.selectedSubcategoryId ? String(this.selectedSubcategoryId) : '',
      companyId: this.selectedCompanyId,
      status: this.status
    };

    this.saving = true;

    this.productService
      .createProductAsAdmin(payload, this.images)
      .subscribe({
        next: res => {
          this.saving = false;
          this.router.navigate(['/admin/products', res.id]);
        },
        error: err => {
          console.error(err);
          this.error = 'Failed to create product';
          this.saving = false;
        }
      });

  }

  cancel(){

  }


}
