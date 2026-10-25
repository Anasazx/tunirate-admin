import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyService } from '../../services/companyService/company.service';
import { CompanyStatusCounts, CompanySummaryResponse } from '../../models/companyDTO/companyResponse.model';
import { CompanyStatus } from '../../enums/companyStatus.enum.model';
import { CompanyStatusAction, companyStatusActions } from '../../ui/company-status-actions';
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
import { humanize, initials } from '../../../../core/ui/format';
import { Building2, Pencil, Plus } from '../../../../core/ui/icons';

@Component({
  selector: 'app-company-management',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, LucideAngularModule, BadgeComponent, PaginationComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './company-management.component.html',
})
export class CompanyManagementComponent implements OnInit {
  private companyService = inject(CompanyService);
  private navCounts = inject(NavCountsService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public sharedService = inject(SharedService);

  readonly tabs: { value: CompanyStatus | null; label: string }[] = [
    { value: null, label: 'All' },
    { value: CompanyStatus.PENDING, label: 'Pending' },
    { value: CompanyStatus.ACTIVE, label: 'Active' },
    { value: CompanyStatus.SUSPENDED, label: 'Suspended' },
    { value: CompanyStatus.REJECTED, label: 'Rejected' },
    { value: CompanyStatus.ARCHIVED, label: 'Archived' },
  ];

  readonly status = signal<CompanyStatus | null>(null);
  readonly q = signal('');
  readonly page = signal(0);
  readonly size = 20;

  readonly companies = signal<Page<CompanySummaryResponse>>(emptyPage());
  readonly counts = signal<CompanyStatusCounts>({});
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);

  readonly totalCount = computed(() => Object.values(this.counts()).reduce((a, b) => a + (b ?? 0), 0));
  // Archiving is refused by the backend while a company has products, so don't offer it
  actions(company: CompanySummaryResponse): CompanyStatusAction[] {
    return companyStatusActions(company.status).filter(a => a.status !== CompanyStatus.ARCHIVED || company.productCount === 0);
  }
  readonly humanize = humanize;
  readonly initials = initials;

  protected readonly CompanyStatus = CompanyStatus;
  protected readonly icons = { Plus, Pencil, Building2 };

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.status.set((params.get('status') as CompanyStatus) || null);
      this.q.set(params.get('q') ?? '');
      this.page.set(Number(params.get('page') ?? 0));
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.companyService.getCompaniesAsAdmin({ q: this.q(), status: this.status(), page: this.page(), size: this.size }).subscribe({
      next: res => {
        this.companies.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load companies.'));
        this.loading.set(false);
      }
    });
    this.companyService.getStatusCounts().subscribe({ next: c => this.counts.set(c) });
  }

  setFilters(changes: Record<string, string | number | null>) {
    const queryParams: Record<string, string | number | null> = { page: null, ...changes };
    for (const key of Object.keys(queryParams)) {
      const value = queryParams[key];
      if (value === '' || (key === 'page' && value === 0)) queryParams[key] = null;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  async applyAction(company: CompanySummaryResponse, action: CompanyStatusAction) {
    if (action.confirm) {
      const ok = await this.confirm.ask({ title: `${action.label} ${company.name}?`, message: action.confirm, confirmLabel: action.label, tone: action.danger ? 'danger' : 'primary' });
      if (!ok) return;
    }

    this.busyId.set(company.id);
    this.companyService.updateCompanyStatus(company.id, action.status).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`${company.name} is now ${humanize(action.status).toLowerCase()}.`);
        this.navCounts.refresh();
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not change the company status.'));
      }
    });
  }
}
