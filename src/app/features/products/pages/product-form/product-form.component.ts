import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ProductService } from '../../services/productService/product.service';
import { ProductImageService } from '../../../../core/services/productImageService/productImage.service';
import { CompanyService } from '../../../companies/services/companyService/company.service';
import { SubcategoryService } from '../../../category/services/subcategoryService/subcategory.service';
import { CompanyOption } from '../../../companies/models/companyDTO/companyResponse.model';
import { SubcategoryResponse } from '../../../category/models/subcategoryDTO/subcategoryResponse.model';
import { ProductImageResponse } from '../../models/productDTO/productImageResponse.model';
import { ProductStatus } from '../../enums/productStatus.enum.model';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { ToastService } from '../../../../core/ui/toast.service';
import { ConfirmService } from '../../../../core/ui/confirm.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { humanize } from '../../../../core/ui/format';
import { ArrowLeft, ImagePlus, LoaderCircle, Star, Trash2, X } from '../../../../core/ui/icons';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

interface NewImage {
  file: File;
  preview: string;
}

// Create and edit a product: /products/new and /products/:id/edit
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private productImageService = inject(ProductImageService);
  private companyService = inject(CompanyService);
  private subcategoryService = inject(SubcategoryService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  public sharedService = inject(SharedService);

  readonly productId = signal<number | null>(null);
  readonly isEdit = computed(() => this.productId() !== null);

  // Form fields
  name = '';
  description = '';
  companyId: number | null = null;
  subcategoryId: number | null = null;
  status: ProductStatus = ProductStatus.PUBLISHED;

  readonly existingImages = signal<ProductImageResponse[]>([]);
  readonly newImages = signal<NewImage[]>([]);
  readonly companies = signal<CompanyOption[]>([]);
  readonly subcategories = signal<SubcategoryResponse[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly imageBusy = signal<number | null>(null);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  // Admins never set DRAFT: that state belongs to companies still editing
  readonly statuses = [ProductStatus.PUBLISHED, ProductStatus.PENDING_REVIEW, ProductStatus.REJECTED, ProductStatus.ARCHIVED];
  readonly humanize = humanize;

  readonly subcategoryGroups = computed(() => {
    const groups = new Map<string, SubcategoryResponse[]>();
    for (const s of this.subcategories()) {
      const key = s.categoryName ?? 'Other';
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  });

  protected readonly icons = { ArrowLeft, ImagePlus, LoaderCircle, Star, Trash2, X };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.companyService.getCompanyOptions().subscribe({ next: c => this.companies.set([...c].sort((a, b) => a.name.localeCompare(b.name))) });
    this.subcategoryService.getAllSubcategories().subscribe({ next: s => this.subcategories.set(s) });

    // New product for a given company: /products/new?companyId=5
    const presetCompany = this.route.snapshot.queryParamMap.get('companyId');
    if (presetCompany) this.companyId = Number(presetCompany);
    // Created from a user suggestion: /products/new?name=...&description=...
    this.name = this.route.snapshot.queryParamMap.get('name') ?? '';
    this.description = this.route.snapshot.queryParamMap.get('description') ?? '';

    if (id) {
      this.productId.set(Number(id));
      this.loadProduct();
    }
  }

  ngOnDestroy(): void {
    this.newImages().forEach(img => URL.revokeObjectURL(img.preview));
  }

  private loadProduct() {
    this.loading.set(true);
    this.productService.getDetailedProductByIdAsAdmin(this.productId()!).subscribe({
      next: p => {
        this.name = p.name;
        this.description = p.description ?? '';
        this.companyId = p.companyId;
        this.subcategoryId = p.subcategoryId;
        this.status = p.status === ProductStatus.DRAFT ? ProductStatus.PENDING_REVIEW : p.status;
        this.existingImages.set(p.images);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load this product.'));
        this.loading.set(false);
      }
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    const accepted: NewImage[] = [];
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        this.toast.error(`${file.name}: only JPEG, PNG, WEBP, GIF or AVIF images are allowed.`);
      } else if (file.size > MAX_IMAGE_BYTES) {
        this.toast.error(`${file.name} is larger than 10 MB.`);
      } else {
        accepted.push({ file, preview: URL.createObjectURL(file) });
      }
    }
    this.newImages.update(list => [...list, ...accepted]);
  }

  removeNewImage(index: number) {
    URL.revokeObjectURL(this.newImages()[index].preview);
    this.newImages.update(list => list.filter((_, i) => i !== index));
  }

  setMainImage(image: ProductImageResponse) {
    this.imageBusy.set(image.id);
    this.productImageService.setMainImage(image.id, this.productId()!).subscribe({
      next: () => {
        this.imageBusy.set(null);
        this.existingImages.update(list => list.map(i => ({ ...i, isMain: i.id === image.id })));
      },
      error: err => {
        this.imageBusy.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not change the main image.'));
      }
    });
  }

  async deleteImage(image: ProductImageResponse) {
    const ok = await this.confirm.ask({ title: 'Delete image?', message: 'The image is removed from the product right away.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;

    this.imageBusy.set(image.id);
    this.productImageService.deleteImage(image.id).subscribe({
      next: () => {
        this.imageBusy.set(null);
        // The backend promotes the first remaining image when the main one is deleted
        this.existingImages.update(list => {
          const rest = list.filter(i => i.id !== image.id);
          return image.isMain && rest.length ? rest.map((i, idx) => ({ ...i, isMain: idx === 0 })) : rest;
        });
        this.toast.success('Image deleted.');
      },
      error: err => {
        this.imageBusy.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not delete the image.'));
      }
    });
  }

  save() {
    this.submitted.set(true);
    this.error.set(null);
    if (!this.name.trim() || !this.companyId) {
      this.error.set('Fill in the required fields.');
      return;
    }

    const payload = {
      name: this.name.trim(),
      description: this.description.trim() || null,
      companyId: Number(this.companyId),
      subcategoryId: this.subcategoryId ? Number(this.subcategoryId) : null,
      status: this.status,
    };
    const files = this.newImages().map(i => i.file);
    const request$ = this.isEdit()
      ? this.productService.updateProductAsAdmin(this.productId()!, payload, files)
      : this.productService.createProductAsAdmin(payload, files);

    this.saving.set(true);
    request$.subscribe({
      next: res => {
        this.saving.set(false);
        this.toast.success(this.isEdit() ? 'Product saved.' : 'Product created.');
        this.router.navigate(['/products', this.productId() ?? res.id]);
      },
      error: err => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err, 'Could not save the product.'));
      }
    });
  }

  cancel() {
    this.router.navigate(this.isEdit() ? ['/products', this.productId()] : ['/products']);
  }
}
