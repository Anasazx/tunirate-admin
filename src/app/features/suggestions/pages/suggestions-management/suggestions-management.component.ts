import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { SuggestionService } from '../../services/suggestion.service';
import { SuggestionResponse, SuggestionStatus } from '../../models/suggestion.model';
import { ProductService } from '../../../products/services/productService/product.service';
import { ProductResponse } from '../../../products/models/productDTO/productResponse.model';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { NavCountsService } from '../../../../core/services/navCounts.service';
import { BadgeComponent } from '../../../../core/ui/badge.component';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { SearchInputComponent } from '../../../../core/ui/search-input.component';
import { ToastService } from '../../../../core/ui/toast.service';
import { ConfirmService } from '../../../../core/ui/confirm.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { timeAgo } from '../../../../core/ui/format';
import { Building2, Check, Lightbulb, Plus, X } from '../../../../core/ui/icons';

@Component({
  selector: 'app-suggestions-management',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, BadgeComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './suggestions-management.component.html',
})
export class SuggestionsManagementComponent implements OnInit {
  private suggestionService = inject(SuggestionService);
  private productService = inject(ProductService);
  private navCounts = inject(NavCountsService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public sharedService = inject(SharedService);

  readonly tabs: { value: SuggestionStatus | null; label: string }[] = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: null, label: 'All' },
  ];

  readonly status = signal<SuggestionStatus | null>('PENDING');
  readonly suggestions = signal<SuggestionResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);

  // Approve dialog: link the suggestion to an existing product
  readonly approving = signal<SuggestionResponse | null>(null);
  readonly productResults = signal<ProductResponse[]>([]);
  readonly productSearching = signal(false);

  readonly timeAgo = timeAgo;
  protected readonly icons = { Lightbulb, Check, X, Plus, Building2 };

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const s = params.get('status');
      this.status.set(s === 'ALL' ? null : ((s as SuggestionStatus) || 'PENDING'));
      this.load();
    });
  }

  setStatus(status: SuggestionStatus | null) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { status: status === 'PENDING' ? null : (status ?? 'ALL') } });
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.suggestionService.getSuggestions(this.status()).subscribe({
      next: res => {
        this.suggestions.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load suggestions.'));
        this.loading.set(false);
      }
    });
  }

  openApprove(suggestion: SuggestionResponse) {
    this.approving.set(suggestion);
    this.searchProducts(suggestion.name);
  }

  searchProducts(q: string) {
    if (!q.trim()) {
      this.productResults.set([]);
      return;
    }
    this.productSearching.set(true);
    this.productService.getProductsAsAdmin({ q, size: 6 }).subscribe({
      next: res => {
        this.productResults.set(res.content);
        this.productSearching.set(false);
      },
      error: () => this.productSearching.set(false)
    });
  }

  approveWith(product: ProductResponse) {
    const suggestion = this.approving();
    if (!suggestion) return;
    this.busyId.set(suggestion.id);
    this.suggestionService.approve(suggestion.id, product.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.approving.set(null);
        this.toast.success(`Suggestion approved and linked to "${product.name}".`);
        this.navCounts.refresh();
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not approve the suggestion.'));
      }
    });
  }

  createProductFrom(suggestion: SuggestionResponse) {
    this.approving.set(null);
    this.router.navigate(['/products/new'], { queryParams: { name: suggestion.name, description: suggestion.description ?? null } });
  }

  async reject(suggestion: SuggestionResponse) {
    const ok = await this.confirm.ask({
      title: `Reject "${suggestion.name}"?`,
      message: `${suggestion.userName ?? 'The user'} will see that the suggestion was rejected.`,
      confirmLabel: 'Reject', tone: 'danger',
    });
    if (!ok) return;

    this.busyId.set(suggestion.id);
    this.suggestionService.reject(suggestion.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success('Suggestion rejected.');
        this.navCounts.refresh();
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not reject the suggestion.'));
      }
    });
  }
}
