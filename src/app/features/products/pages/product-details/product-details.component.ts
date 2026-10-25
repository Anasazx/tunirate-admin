import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { DetailedProductResponse } from '../../models/productDTO/detailedProductResponse.model';
import { ProductService } from '../../services/productService/product.service';
import { ProductStatus } from '../../enums/productStatus.enum.model';
import { ProductReview, ReviewService } from '../../../../core/services/reviewService/review.service';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { NavCountsService } from '../../../../core/services/navCounts.service';
import { Page, emptyPage } from '../../../../core/model/page.model';
import { BadgeComponent } from '../../../../core/ui/badge.component';
import { PaginationComponent } from '../../../../core/ui/pagination.component';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { ToastService } from '../../../../core/ui/toast.service';
import { ConfirmService } from '../../../../core/ui/confirm.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { initials, timeAgo } from '../../../../core/ui/format';
import { Archive, ArrowLeft, Building2, Check, ImageOff, MessageSquare, Pencil, RotateCcw, Star, X } from '../../../../core/ui/icons';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [DecimalPipe, RouterLink, LucideAngularModule, BadgeComponent, PaginationComponent, EmptyStateComponent],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private reviewService = inject(ReviewService);
  private navCounts = inject(NavCountsService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  public sharedService = inject(SharedService);

  readonly product = signal<DetailedProductResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly updating = signal(false);
  readonly selectedImage = signal<string | null>(null);

  readonly reviews = signal<Page<ProductReview>>(emptyPage());
  readonly reviewsLoading = signal(false);
  readonly reviewPageSize = 5;

  readonly stars = [1, 2, 3, 4, 5];
  readonly initials = initials;
  readonly timeAgo = timeAgo;

  readonly currentImage = computed(() => {
    const p = this.product();
    return this.selectedImage() ?? p?.images.find(i => i.isMain)?.url ?? p?.images[0]?.url ?? null;
  });

  protected readonly ProductStatus = ProductStatus;
  protected readonly icons = { ArrowLeft, Pencil, Check, X, Archive, RotateCcw, Star, Building2, ImageOff, MessageSquare };

  private id = 0;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
    this.loadReviews(0);
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getDetailedProductByIdAsAdmin(this.id).subscribe({
      next: res => {
        this.product.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load this product.'));
        this.loading.set(false);
      }
    });
  }

  loadReviews(page: number) {
    this.reviewsLoading.set(true);
    this.reviewService.getProductReviews(this.id, page, this.reviewPageSize).subscribe({
      next: res => {
        this.reviews.set(res.reviews);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false)
    });
  }

  async changeStatus(status: ProductStatus) {
    const p = this.product();
    if (!p) return;

    if (status === ProductStatus.ARCHIVED || status === ProductStatus.REJECTED) {
      const archiving = status === ProductStatus.ARCHIVED;
      const ok = await this.confirm.ask({
        title: archiving ? 'Archive product?' : 'Reject product?',
        message: archiving
          ? `"${p.name}" will be hidden from the public site. Its reviews are kept and you can publish it again later.`
          : `"${p.name}" will not be published. The company can see it was rejected.`,
        confirmLabel: archiving ? 'Archive' : 'Reject',
        tone: 'danger',
      });
      if (!ok) return;
    }

    this.updating.set(true);
    this.productService.updateProductStatusAsAdmin(p.id, status).subscribe({
      next: () => {
        this.updating.set(false);
        this.product.set({ ...p, status });
        this.toast.success(`"${p.name}" is now ${status.replace('_', ' ').toLowerCase()}.`);
        this.navCounts.refresh();
      },
      error: err => {
        this.updating.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not update the product.'));
      }
    });
  }
}
