import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailedProductResponse } from '../../models/productDTO/detailedProductResponse.model';
import { CompanyResponse } from '../../../companies/models/companyDTO/companyResponse.model';
import { SubcategoryResponse } from '../../../category/models/subcategoryDTO/subcategoryResponse.model';
import { ProductService } from '../../services/productService/product.service';
import { CompanyService } from '../../../companies/services/companyService/company.service';
import { ProductImageService } from '../../../../core/services/productImageService/productImage.service';
import { SubcategoryService } from '../../../category/services/subcategoryService/subcategory.service';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { ProductRequest } from '../../models/productDTO/productRequest.model';
import { FormsModule } from '@angular/forms';
import { ProductStatus } from '../../enums/productStatus.enum.model';

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent implements OnInit {
  loading = false;
  companiesLoading = false;
  saving = false;
  imageSaving = false;
  error: string | null = null;

  product: DetailedProductResponse | null = null;

  companies: CompanyResponse[] = [];
  subcategories: SubcategoryResponse[] = [];

  selectedSubcategoryId: number | null = null;
  selectedFile?: File;

  previewUrl: string | null = null;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  pendingDeleteId?: number;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private companyService: CompanyService,
    private productImageService: ProductImageService,
    private router: Router,
    private subcategoryService: SubcategoryService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadCompanies();
    this.loadSubcategories();

    if (!id) {
      this.error = 'Invalid product id';
      return;
    }

    this.load(id);
  }

  /* =========================
     LOAD DATA
  ========================= */

  loadCompanies() {
    this.companiesLoading = true;

    this.companyService.getAllCompanies().subscribe({
      next: (res) => {
        this.companies = res;
        this.companiesLoading = false;
        this.resolveCompanySelection();
      },
      error: (err) => {
        console.error('Failed to load companies', err);
        this.companiesLoading = false;
      }
    });
  }

  loadSubcategories() {
    this.subcategoryService.getAllSubcategories().subscribe({
      next: (res) => {
        this.subcategories = res;
        this.syncSubcategory();
      },
      error: (err) => {
        console.error('Failed to load subcategories', err);
      }
    });
  }

  load(id: number) {
    this.loading = true;
    this.error = null;

    this.productService.getDetailedProductByIdAsAdmin(id).subscribe({
      next: (p) => {
        console.log('product:', p);

        this.product = p;

        this.resolveCompanySelection();
        this.syncSubcategory();

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load product', err);
        this.error = 'Failed to load product';
        this.loading = false;
      }
    });
  }

  /* =========================
     FIXED SUBCATEGORY SYNC
  ========================= */

  private syncSubcategory() {
    if (!this.product || this.subcategories.length === 0) return;

    // 1. BEST CASE: backend gives real ID
    if (this.product.subcategoryId) {
      this.selectedSubcategoryId = Number(this.product.subcategoryId);
      return;
    }

    // 2. FALLBACK: match by name
    if (this.product.subcategoryName) {
      const matched = this.subcategories.find(
        s => s.name.toLowerCase() === this.product!.subcategoryName!.toLowerCase()
      );

      if (matched) {
        this.selectedSubcategoryId = matched.id;
      }
    }
  }
  /* =========================
     SAVE
  ========================= */

  save() {
    if (!this.product) return;

    if (!this.product.companyId) {
      this.error = 'Please select a company';
      return;
    }

    this.saving = true;

    const payload: ProductRequest = {
      name: this.product.name,
      description: this.product.description ?? null,
      subcategoryId: this.selectedSubcategoryId
        ? String(this.selectedSubcategoryId)
        : (this.product.subcategoryId ?? ''),
      companyId: this.product.companyId,
      status: this.product.status
    };

    this.productService.updateProductAsAdmin(this.product.id, payload)
      .subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          console.error('Save failed', err);
          this.error = 'Failed to save product';
          this.saving = false;
        }
      });
  }

  /* =========================
     IMAGE UPLOAD
  ========================= */

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.error = 'Selected file is not an image';
      return;
    }

    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      this.error = `Image must be smaller than ${maxMB} MB`;
      return;
    }

    this.error = null;
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  uploadFile() {
    if (!this.product || !this.selectedFile) {
      this.error = 'Please select a file to upload';
      return;
    }

    this.imageSaving = true;

    this.productImageService.uploadImageFile(this.product.id, this.selectedFile)
      .subscribe({
        next: () => {
          this.clearFileSelection();
          this.imageSaving = false;
          this.load(this.product!.id);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to upload image';
          this.imageSaving = false;
        }
      });
  }

  private clearFileSelection() {
    this.selectedFile = undefined;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /* =========================
     COMPANY FIX (same as before)
  ========================= */

  private resolveCompanySelection() {
    if (!this.product || this.companies.length === 0) return;

    if (!this.product.companyId && this.product.companyName) {
      const matched = this.companies.find(
        c => c.name.toLowerCase() === this.product!.companyName.toLowerCase()
      );

      if (matched) {
        this.product.companyId = matched.id;
      }
    }
  }

  /* =========================
     IMAGES
  ========================= */

  setMainImage(imageId: number) {
    if (!this.product) return;

    this.imageSaving = true;

    this.productImageService.setMainImage(imageId, this.product.id)
      .subscribe({
        next: () => {
          this.imageSaving = false;
          this.load(this.product!.id);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to set main image';
          this.imageSaving = false;
        }
      });
  }

  deleteImage(imageId: number) {
    this.pendingDeleteId = imageId;
  }

  /* =========================
     NAV
  ========================= */

  back() {
    this.router.navigate(['/admin/products']);
  }

  /* =========================
     GETTERS
  ========================= */

  get mainImageUrl(): string | null {
    return (
      this.product?.images?.find(img => img.isMain)?.url ??
      this.product?.images?.[0]?.url ??
      null
    );
  }

  ngOnDestroy(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}
