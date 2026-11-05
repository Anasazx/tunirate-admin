import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AdminReview, ReviewService } from '../../../../core/services/reviewService/review.service';
import { Page, emptyPage } from '../../../../core/model/page.model';
import { PaginationComponent } from '../../../../core/ui/pagination.component';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { SearchInputComponent } from '../../../../core/ui/search-input.component';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { initials, timeAgo } from '../../../../core/ui/format';
import { MessageSquare, Star } from '../../../../core/ui/icons';

@Component({
  selector: 'app-reviews-management',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, PaginationComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './reviews-management.component.html',
})
export class ReviewsManagementComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly tabs: { value: number | null; label: string }[] = [
    { value: null, label: 'All ratings' },
    { value: 5, label: '5 stars' },
    { value: 4, label: '4 stars' },
    { value: 3, label: '3 stars' },
    { value: 2, label: '2 stars' },
    { value: 1, label: '1 star' },
  ];

  readonly rating = signal<number | null>(null);
  readonly q = signal('');
  readonly page = signal(0);
  readonly size = 20;

  readonly reviews = signal<Page<AdminReview>>(emptyPage());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly stars = [1, 2, 3, 4, 5];
  readonly initials = initials;
  readonly timeAgo = timeAgo;
  protected readonly icons = { MessageSquare, Star };

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const rating = params.get('rating');
      this.rating.set(rating ? Number(rating) : null);
      this.q.set(params.get('q') ?? '');
      this.page.set(Number(params.get('page') ?? 0));
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.reviewService.getReviewsAsAdmin({
      q: this.q(),
      rating: this.rating(),
      page: this.page(),
      size: this.size,
    }).subscribe({
      next: res => {
        this.reviews.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load reviews.'));
        this.loading.set(false);
      }
    });
  }

  setFilters(changes: Record<string, string | number | null>) {
    const queryParams: Record<string, string | number | null> = { page: null, ...changes };
    for (const key of Object.keys(queryParams)) {
      const value = queryParams[key];
      if (value === '' || (key === 'page' && value === 0)) queryParams[key] = null;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
}
