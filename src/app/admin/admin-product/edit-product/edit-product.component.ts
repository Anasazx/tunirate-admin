
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DetailedProduct } from '../../../core/model/detailedProduct.model';
import { CompanyResponse } from '../../../core/model/dto/companyDTO/companyResponse.model';
import { SubcategoryResponse } from '../../../core/model/dto/subcategoryDTO/subcategoryResponse.model';
import { ProductService } from '../../../core/services/productService/product.service';
import { CompanyService } from '../../../core/services/companyService/company.service';
import { ProductImageService } from '../../../core/services/productImageService/productImage.service';
import { SubcategoryService } from '../../../core/services/subcategoryService/subcategory.service';
import { SharedService } from '../../../core/services/sharedService/shared.service';
import { ProductRequest } from '../../../core/model/dto/productDTO/productRequest.model';


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
  product: DetailedProduct | null = null;
  isNewMode = false;
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
    public imageService: ProductImageService,
    private subcategoryService: SubcategoryService,
    public sharedService: SharedService

  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.loadCompanies();
    this.loadSubcategories();

    if (idParam === 'new') {
      // creation mode: initialize an empty product object
      this.isNewMode = true;
      this.product = {
        id: 0,
        name: '',
        description: '',
        category: '',
        subcategory: '',
        companyId: undefined,
        companyName: '',
        companyIsVerified: false,
        companyLogoUrl: '',
        averageRating: null,
        reviewsCount: 0,
        reviews: [],
        images: []
      } as DetailedProduct;
      return;
    }

    const id = Number(idParam);
    if (!id) {
      this.error = 'Invalid product id';
      return;
    }

    this.load(id);
  }

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
        // if product already loaded, try to set selectedSubcategoryId by id or by name
        if (this.product) {
          const maybeId = Number(this.product.category);
          if (!isNaN(maybeId) && maybeId > 0) {
            this.selectedSubcategoryId = maybeId;
          } else if (this.product.category) {
            const matched = this.subcategories.find(s => s.name.toLowerCase() === String(this.product!.category).toLowerCase());
            if (matched) this.selectedSubcategoryId = matched.id;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load subcategories', err);
      }
    });
  }

  load(id: number) {
    this.loading = true;
    this.error = null;
    this.productService.getDetailedProductById(id).subscribe({
      next: (p) => {
        console.log("this is the return of product; ", p);
        this.product = p;
        this.resolveCompanySelection();
        // sync selected subcategory if subcategories already loaded
        if (this.subcategories.length > 0 && this.product) {
          const maybeId = Number(this.product.category);
          if (!isNaN(maybeId) && maybeId > 0) {
            this.selectedSubcategoryId = maybeId;
          } else if (this.product.category) {
            const matched = this.subcategories.find(s => s.name.toLowerCase() === String(this.product!.category).toLowerCase());
            if (matched) this.selectedSubcategoryId = matched.id;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load product', err);
        this.error = 'Failed to load product';
        this.loading = false;
      }
    });
  }


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
        : (this.product.category ? String(this.product.category) : ''),
      companyId: this.product.companyId ?? null
    };
    const request$ = (this.product.id && this.product.id > 0)
      ? this.productService.updateProduct(this.product.id, payload)
      : this.productService.createProductAsAdmin(payload);

    request$.subscribe({
      next: (res) => {
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


  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      // validate type and size
      if (!file.type.startsWith('image/')) {
        this.error = 'Selected file is not an image';
        this.selectedFile = undefined;
        this.previewUrl = null;
        return;
      }
      const maxMB = 5;
      if (file.size > maxMB * 1024 * 1024) {
        this.error = `Image must be smaller than ${maxMB} MB`;
        this.selectedFile = undefined;
        this.previewUrl = null;
        return;
      }
      this.error = null;
      this.selectedFile = file;
      this.previewUrl = URL.createObjectURL(file);
    } else {
      this.selectedFile = undefined;
    }
  }

  uploadFile() {
    if (!this.product) return;
    if (!this.selectedFile) {
      this.error = 'Please select a file to upload';
      return;
    }
    if (!this.product.id) {
      this.error = 'Save the product before uploading images';
      return;
    }
    this.imageSaving = true;
    this.productImageService.uploadImageFile(this.product.id, this.selectedFile).subscribe({
      next: () => {
        this.clearFileSelection();
        this.imageSaving = false;
        this.load(this.product!.id);
      },
      error: (err) => {
        console.error('Failed to upload image', err);
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
    try {
      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    } catch {}
  }

  deleteImage(imageId: number) {
    // inline confirm flow: mark pending id first
    this.pendingDeleteId = imageId;
  }

  cancelDelete() {
    this.pendingDeleteId = undefined;
  }

  performDelete(imageId: number) {
    if (!this.product || !this.product.id) return;
    this.imageSaving = true;
    this.productImageService.deleteImage(imageId).subscribe({
      next: () => {
        this.imageSaving = false;
        this.pendingDeleteId = undefined;
        this.load(this.product!.id);
      },
      error: (err) => {
        console.error('Failed to delete image', err);
        this.error = 'Failed to delete image';
        this.imageSaving = false;
        this.pendingDeleteId = undefined;
      }
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  ngOnDestroy(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  setMainImage(imageId: number) {
    if (!this.product || !this.product.id) return;
    this.imageSaving = true;
    this.productImageService.setMainImage(imageId, this.product.id).subscribe({
      next: () => {
        this.imageSaving = false;
        this.load(this.product!.id);
      },
      error: (err) => {
        console.error('Failed to set main image', err);
        this.error = 'Failed to set main image';
        this.imageSaving = false;
      }
    });
  }

  private resolveCompanySelection() {
    if (!this.product || this.companies.length === 0) return;
    if (!this.product.companyId && this.product.companyName) {
      const matched = this.companies.find(c => c.name.toLowerCase() === this.product!.companyName.toLowerCase());
      if (matched) {
        this.product.companyId = matched.id;
      }
    }
  }

  back() {
    this.router.navigate(['/admin/products']);
  }


  get mainImageUrl(): string | null {
    return (
      this.product?.images?.find(img => img.isMain)?.url ??
      this.product?.images?.[0]?.url ??
      null
    );
  }

}
