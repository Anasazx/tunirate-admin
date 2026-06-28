import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyResponse } from '../../../core/model/dto/companyDTO/companyResponse.model';
import { SubcategoryResponse } from '../../../core/model/dto/subcategoryDTO/subcategoryResponse.model';
import { ProductService } from '../../../core/services/productService/product.service';
import { CompanyService } from '../../../core/services/companyService/company.service';
import { SubcategoryService } from '../../../core/services/subcategoryService/subcategory.service';
import { ProductRequest } from '../../../core/model/dto/productDTO/productRequest.model';



@Component({
  selector: 'app-new-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css'
})
export class NewProductComponent implements OnInit {
  name = '';
  description = '';
  selectedSubcategoryId: number | null = null;
  selectedCompanyId: number | null = null;

  companies: CompanyResponse[] = [];
  subcategories: SubcategoryResponse[] = [];

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
      next: (res) => this.companies = res,
      error: (err) => { console.error(err); }
    });
  }

  loadSubcategories() {
    this.subcategoryService.getAllSubcategories().subscribe({
      next: (res) => this.subcategories = res,
      error: (err) => { console.error(err); }
    });
  }

  save() {
    this.error = null;
    if (!this.name || this.name.trim().length === 0) {
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
      companyId: this.selectedCompanyId
    };

    this.saving = true;
    this.productService.createProductAsAdmin(payload).subscribe({
      next: (res) => {
        console.log("this is the payload: ", payload);

        this.saving = false;
        // navigate to edit page for further actions (images)
        this.router.navigate(['/admin/products', res.id]);
      },
      error: (err) => {
        console.error('Create failed', err);
        this.error = 'Failed to create product';
        this.saving = false;
      }
    });
  }

}
