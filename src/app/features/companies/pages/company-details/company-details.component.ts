import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyService } from '../../services/companyService/company.service';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';
import { CompanyMemberResponse } from '../../models/companyMemberDTO/CompanyMemberResponse.model';
import { CompanyRole } from '../../enums/companyRole.enum.model';
import { CompanyStatus } from '../../enums/companyStatus.enum.model';
import { CompanyStatusAction, companyStatusActions } from '../../ui/company-status-actions';
import { CompanyMemberService } from '../../../../core/services/companyMemberService/company-member.service';
import { UserService } from '../../../users/services/userService/user.service';
import { UserResponse } from '../../../users/models/userDTO/userResponse.model';
import { ProductService } from '../../../products/services/productService/product.service';
import { ProductResponse } from '../../../products/models/productDTO/productResponse.model';
import { ProductStatus } from '../../../products/enums/productStatus.enum.model';
import { ProductStatusCounts } from '../../../products/models/productDTO/productFilters.model';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { NavCountsService } from '../../../../core/services/navCounts.service';
import { SOCIAL_ICON_MAP } from '../../../../core/mapping/social-icon-map';
import { Page, emptyPage } from '../../../../core/model/page.model';
import { BadgeComponent } from '../../../../core/ui/badge.component';
import { PaginationComponent } from '../../../../core/ui/pagination.component';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { SearchInputComponent } from '../../../../core/ui/search-input.component';
import { ToastService } from '../../../../core/ui/toast.service';
import { ConfirmService } from '../../../../core/ui/confirm.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { humanize, initials } from '../../../../core/ui/format';
import { ArrowLeft, Calendar, ExternalLink, Globe, MapPin, Package, Pencil, Phone, Plus, ShieldCheck, Trash2, UserPlus, Users } from '../../../../core/ui/icons';

type Tab = 'overview' | 'products' | 'members';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink, LucideAngularModule, BadgeComponent, PaginationComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './company-details.component.html',
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private companyMemberService = inject(CompanyMemberService);
  private userService = inject(UserService);
  private productService = inject(ProductService);
  private navCounts = inject(NavCountsService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  public sharedService = inject(SharedService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly company = signal<CompanyResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly statusBusy = signal(false);
  readonly tab = signal<Tab>('overview');

  // Archiving is refused by the backend while the company has products, so don't offer it
  readonly statusActions = computed(() => {
    const c = this.company();
    if (!c) return [];
    return companyStatusActions(c.status).filter(a => a.status !== CompanyStatus.ARCHIVED || c.productCount === 0);
  });
  readonly socialIcons = SOCIAL_ICON_MAP;
  readonly humanize = humanize;
  readonly initials = initials;

  // ── Products tab (paginated, loaded on demand) ──
  readonly products = signal<Page<ProductResponse>>(emptyPage());
  readonly productCounts = signal<ProductStatusCounts>({});
  readonly productsLoading = signal(false);
  readonly productQuery = signal('');
  readonly productStatus = signal<ProductStatus | null>(null);
  readonly productPageSize = 10;
  private productsLoaded = false;
  readonly productTabs = [
    { value: null, label: 'All' },
    { value: ProductStatus.PUBLISHED, label: 'Published' },
    { value: ProductStatus.PENDING_REVIEW, label: 'Pending review' },
    { value: ProductStatus.REJECTED, label: 'Rejected' },
    { value: ProductStatus.ARCHIVED, label: 'Archived' },
  ];

  // ── Members tab ──
  memberQuery = '';
  readonly searchResults = signal<UserResponse[]>([]);
  readonly searching = signal(false);
  readonly selectedUser = signal<UserResponse | null>(null);
  newMemberRole: CompanyRole = CompanyRole.WORKER;
  readonly memberBusy = signal(false);
  readonly roleOptions = [CompanyRole.WORKER, CompanyRole.HEAD];
  private search$ = new Subject<string>();
  private searchSub?: Subscription;

  protected readonly ProductStatus = ProductStatus;
  protected readonly icons = { ArrowLeft, Pencil, Plus, Package, Users, Globe, Phone, MapPin, Calendar, ShieldCheck, ExternalLink, UserPlus, Trash2 };

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab') as Tab | null;
    if (tab) this.selectTab(tab);
    this.loadCompany();

    // Debounced user search for the "add member" field
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) return of([] as UserResponse[]);
        this.searching.set(true);
        return this.userService.searchUsers(term).pipe(catchError(() => of([] as UserResponse[])));
      })
    ).subscribe(users => {
      this.searching.set(false);
      this.searchResults.set(users.slice(0, 8));
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadCompany() {
    this.loading.set(!this.company());
    this.companyService.getCompanyDetailsByIdAsAdmin(this.id).subscribe({
      next: res => {
        this.company.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load this company.'));
        this.loading.set(false);
      }
    });
  }

  selectTab(tab: Tab) {
    this.tab.set(tab);
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab: tab === 'overview' ? null : tab }, queryParamsHandling: 'merge', replaceUrl: true });
    if (tab === 'products' && !this.productsLoaded) {
      this.productsLoaded = true;
      this.loadProducts(0);
    }
  }

  async applyStatus(action: CompanyStatusAction) {
    const c = this.company();
    if (!c) return;
    if (action.confirm) {
      const ok = await this.confirm.ask({ title: `${action.label} ${c.name}?`, message: action.confirm, confirmLabel: action.label, tone: action.danger ? 'danger' : 'primary' });
      if (!ok) return;
    }
    this.statusBusy.set(true);
    this.companyService.updateCompanyStatus(c.id, action.status).subscribe({
      next: () => {
        this.statusBusy.set(false);
        this.toast.success(`${c.name} is now ${humanize(action.status).toLowerCase()}.`);
        this.navCounts.refresh();
        this.loadCompany();
      },
      error: err => {
        this.statusBusy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not change the company status.'));
      }
    });
  }

  // ── Products ──

  loadProducts(page: number) {
    this.productsLoading.set(true);
    this.productService.getProductsAsAdmin({
      companyId: this.id, q: this.productQuery(), status: this.productStatus(), page, size: this.productPageSize,
    }).subscribe({
      next: res => {
        this.products.set(res);
        this.productsLoading.set(false);
      },
      error: err => {
        this.productsLoading.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not load products.'));
      }
    });
    if (page === 0) {
      this.productService.getStatusCounts(this.id).subscribe({ next: c => this.productCounts.set(c) });
    }
  }

  filterProducts(changes: { q?: string; status?: ProductStatus | null }) {
    if (changes.q !== undefined) this.productQuery.set(changes.q);
    if (changes.status !== undefined) this.productStatus.set(changes.status);
    this.loadProducts(0);
  }

  // ── Members ──

  onMemberQueryChange(term: string) {
    this.selectedUser.set(null);
    this.search$.next(term.trim());
  }

  selectUser(user: UserResponse) {
    this.selectedUser.set(user);
    this.memberQuery = `${user.name} (${user.email})`;
    this.searchResults.set([]);
  }

  isAlreadyMember(user: UserResponse): boolean {
    return !!this.company()?.members?.some(m => m.user.id === user.id);
  }

  addMember() {
    const user = this.selectedUser();
    if (!user || this.memberBusy()) return;
    const role = this.newMemberRole;

    this.memberBusy.set(true);
    this.companyMemberService.assignMemberToCompany({ userId: user.id, companyId: this.id, companyRole: role }).subscribe({
      next: () => {
        this.memberBusy.set(false);
        this.toast.success(`${user.name} was added as ${role.toLowerCase()}.`);
        this.memberQuery = '';
        this.selectedUser.set(null);
        this.newMemberRole = CompanyRole.WORKER;
        this.loadCompany();
      },
      error: err => {
        this.memberBusy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not add the member.'));
      }
    });
  }

  changeRole(member: CompanyMemberResponse, role: CompanyRole) {
    if (role === member.companyRole || this.memberBusy()) return;
    this.memberBusy.set(true);
    this.companyMemberService.updateRole({ userId: member.user.id, companyId: this.id, companyRole: role }).subscribe({
      next: () => {
        this.memberBusy.set(false);
        this.toast.success(`${member.user.name} is now ${role.toLowerCase()}.`);
        this.loadCompany();
      },
      error: err => {
        this.memberBusy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not change the role.'));
        this.loadCompany();
      }
    });
  }

  async removeMember(member: CompanyMemberResponse) {
    const ok = await this.confirm.ask({
      title: `Remove ${member.user.name}?`,
      message: `They lose access to the ${this.company()?.name} company portal right away.`,
      confirmLabel: 'Remove', tone: 'danger',
    });
    if (!ok) return;

    this.memberBusy.set(true);
    this.companyMemberService.removeMemberFromCompany(member.user.id, this.id).subscribe({
      next: () => {
        this.memberBusy.set(false);
        this.toast.success(`${member.user.name} was removed.`);
        this.loadCompany();
      },
      error: err => {
        this.memberBusy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not remove the member.'));
      }
    });
  }
}
