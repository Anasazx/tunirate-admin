import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../features/products/services/productService/product.service';
import { CompanyService } from '../../features/companies/services/companyService/company.service';
import { SuggestionService } from '../../features/suggestions/services/suggestion.service';

// Pending work shown as badges in the sidebar; pages call refresh() after moderating something
@Injectable({ providedIn: 'root' })
export class NavCountsService {
  private productService = inject(ProductService);
  private companyService = inject(CompanyService);
  private suggestionService = inject(SuggestionService);

  readonly pendingProducts = signal(0);
  readonly pendingCompanies = signal(0);
  readonly pendingSuggestions = signal(0);

  refresh() {
    forkJoin({
      products: this.productService.getStatusCounts(),
      companies: this.companyService.getStatusCounts(),
      suggestions: this.suggestionService.getSuggestions('PENDING'),
    }).subscribe({
      next: ({ products, companies, suggestions }) => {
        this.pendingProducts.set(products.PENDING_REVIEW ?? 0);
        this.pendingCompanies.set(companies.PENDING ?? 0);
        this.pendingSuggestions.set(suggestions.length);
      },
      error: () => { /* badges are optional, keep the last values */ }
    });
  }
}
