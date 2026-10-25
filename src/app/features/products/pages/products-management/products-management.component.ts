import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ProductService } from '../../services/productService/product.service';
import { ProductResponse } from '../../models/productDTO/productResponse.model';
import { ProductStatusCounts } from '../../models/productDTO/productFilters.model';
import { ProductStatus } from '../../enums/productStatus.enum.model';
import { CompanyService } from '../../../companies/services/companyService/company.service';
import { CompanyOption } from '../../../companies/models/companyDTO/companyResponse.model';
import { SubcategoryService } from '../../../category/services/subcategoryService/subcategory.service';
import { SubcategoryResponse } from '../../../category/models/subcategoryDTO/subcategoryResponse.model';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { NavCountsService } from '../../../../core/services/navCounts.service';
import { Page, emptyPage } from '../../../../core/model/page.model';
import { BadgeComponent } from '../../../../core/ui/badge.component';
import { PaginationComponent } from '../../../../core/ui/pagination.component';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { SearchInputComponent } from '../../../../core/ui/search-input.component';
import { ToastService } from '../../../../core/ui/toast.service';
import { ConfirmService } from '../../../../core/ui/confirm.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { Archive, Check, Package, Pencil, Plus, RotateCcw, X } from '../../../../core/ui/icons';

type StatusTab = { value: ProductStatus | null; label: string };

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, LucideAngularModule, BadgeComponent, PaginationComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './products-management.component.html',
})
export class ProductsManagementComponent implements OnInit {
  private productService = inject(ProductService);
  private companyService = inject(CompanyService);
  private subcategoryService = inject(SubcategoryService);
  private navCounts = inject(NavCountsService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public sharedService = inject(SharedService);

  readonly tabs: StatusTab[] = [
    { value: null, label: 'All' },
    { value: ProductStatus.PENDING_REVIEW, label: 'Pending review' },
    { value: ProductStatus.PUBLISHED, label: 'Published' },
    { value: ProductStatus.REJECTED, label: 'Rejected' },
    { value: ProductStatus.ARCHIVED, label: 'Archived' },
  ];

  // Filters, mirrored in the URL query string
  readonly status = signal<ProductStatus | null>(null);
  readonly q = signal('');
  readonly companyId = signal<number | null>(null);
  // a subcategory id, or 'none' for products without one
  readonly subcategory = signal<string>('');
  readonly page = signal(0);
  readonly size = 20;

  readonly products = signal<Page<ProductResponse>>(emptyPage());
  readonly counts = signal<ProductStatusCounts>({});
  readonly companies = signal<CompanyOption[]>([]);
  readonly subcategories = signal<SubcategoryResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);

  readonly totalCount = computed(() => Object.values(this.counts()).reduce((a, b) => a + (b ?? 0), 0));
  readonly hasFilters = computed(() => !!this.q() || !!this.companyId() || !!this.subcategory());

  // Subcategories grouped by category for the <optgroup> select
  readonly subcategoryGroups = computed(() => {
    const groups = new Map<string, SubcategoryResponse[]>();
    for (const s of this.subcategories()) {
      const key = s.categoryName ?? 'Other';
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  });

  protected readonly ProductStatus = ProductStatus;
  protected readonly icons = { Plus, Check, X, Archive, Pencil, RotateCcw, Package };

  ngOnInit(): void {
    this.companyService.getCompanyOptions().subscribe({ next: c => this.companies.set([...c].sort((a, b) => a.name.localeCompare(b.name))) });
    this.subcategoryService.getAllSubcategories().subscribe({ next: s => this.subcategories.set(s) });

    this.route.queryParamMap.subscribe(params => {
      this.status.set((params.get('status') as ProductStatus) || null);
      this.q.set(params.get('q') ?? '');
      this.companyId.set(params.get('companyId') ? Number(params.get('companyId')) : null);
      this.subcategory.set(params.get('subcategory') ?? '');
      this.page.set(Number(params.get('page') ?? 0));
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    const sub = this.subcategory();
    this.productService.getProductsAsAdmin({
      q: this.q(),
      status: this.status(),
      companyId: this.companyId(),
      subcategoryId: sub && sub !== 'none' ? Number(sub) : null,
      uncategorized: sub === 'none',
      page: this.page(),
      size: this.size,
    }).subscribe({
      next: res => {
        this.products.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load products.'));
        this.loading.set(false);
      }
    });
    this.productService.getStatusCounts(this.companyId()).subscribe({ next: c => this.counts.set(c) });
  }

  // Any filter change goes through the URL, which triggers load()
  setFilters(changes: Record<string, string | number | null>) {
    const queryParams: Record<string, string | number | null> = { page: null, ...changes };
    // Keep the URL clean: drop empty values and the first page
    for (const key of Object.keys(queryParams)) {
      const value = queryParams[key];
      if (value === '' || (key === 'page' && value === 0)) queryParams[key] = null;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  clearFilters() {
    this.setFilters({ q: null, companyId: null, subcategory: null });
  }

  async changeStatus(product: ProductResponse, status: ProductStatus) {
    if (status === ProductStatus.ARCHIVED || status === ProductStatus.REJECTED) {
      const archiving = status === ProductStatus.ARCHIVED;
      const ok = await this.confirm.ask({
        title: archiving ? 'Archive product?' : 'Reject product?',
        message: archiving
          ? `"${product.name}" will be hidden from the public site. Its reviews are kept and you can publish it again later.`
          : `"${product.name}" will not be published. The company can see it was rejected.`,
        confirmLabel: archiving ? 'Archive' : 'Reject',
        tone: 'danger',
      });
      if (!ok) return;
    }

    this.busyId.set(product.id);
    this.productService.updateProductStatusAsAdmin(product.id, status).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`"${product.name}" is now ${status.replace('_', ' ').toLowerCase()}.`);
        this.navCounts.refresh();
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not update the product.'));
      }
    });
  }
}
