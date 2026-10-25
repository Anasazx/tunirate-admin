import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

import { DashboardService } from '../../services/dashboardService/dashboard.service';
import { AdminDashboardResponse, TimeSeriesPoint } from '../../models/dashboardDTO/adminDashboardResponse.model';
import { AuthService } from '../../../auth/services/authService/auth.service';
import { ProductService } from '../../../products/services/productService/product.service';
import { ProductResponse } from '../../../products/models/productDTO/productResponse.model';
import { ProductStatus } from '../../../products/enums/productStatus.enum.model';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { NavCountsService } from '../../../../core/services/navCounts.service';
import { ToastService } from '../../../../core/ui/toast.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { humanize, timeAgo } from '../../../../core/ui/format';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { ArrowRight, Building2, Check, Lightbulb, MessageSquare, Package, RefreshCw, Star, Users, X } from '../../../../core/ui/icons';

interface Kpi {
  label: string;
  value: number;
  recent: number;
  icon: LucideIconData;
  link: string;
}

interface AttentionItem {
  label: string;
  description: string;
  count: number;
  icon: LucideIconData;
  link: string;
  query?: Record<string, string>;
}

// Categorical series colors, fixed order; checked with the dataviz palette validator
// (colorblind-safe; the aqua is under 3:1 on white, so every series also shows its total as a label)
const SERIES = {
  users: '#2a78d6',
  reviews: '#eb6834',
  companies: '#1baf7a',
};
// Status colors are reserved for product states and always shown with their label
const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: '#0ca30c',
  PENDING_REVIEW: '#fab219',
  REJECTED: '#d03b3b',
  ARCHIVED: '#94a3b8',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, LucideAngularModule, BaseChartDirective, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  // Chart.js is only needed here, so it stays out of the initial bundle
  providers: [provideCharts(withDefaultRegisterables())],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private productService = inject(ProductService);
  private navCounts = inject(NavCountsService);
  private toast = inject(ToastService);
  public sharedService = inject(SharedService);

  private readonly authUser = toSignal(inject(AuthService).currentUser$);
  readonly firstName = computed(() => this.authUser()?.user?.name?.split(' ')[0] ?? '');
  readonly today = new Date();

  readonly data = signal<AdminDashboardResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  // product id currently being approved/rejected from the dashboard
  readonly moderating = signal<number | null>(null);

  readonly timeAgo = timeAgo;
  readonly humanize = humanize;
  readonly stars = [1, 2, 3, 4, 5];

  protected readonly icons = { ArrowRight, Check, X, Star, RefreshCw, MessageSquare, Package };

  readonly kpis = computed<Kpi[]>(() => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Users', value: d.totalUsers, recent: this.sum(d.usersOverTime), icon: Users, link: '/users' },
      { label: 'Companies', value: d.totalCompanies, recent: this.sum(d.companiesOverTime), icon: Building2, link: '/companies' },
      { label: 'Products', value: d.totalProducts, recent: -1, icon: Package, link: '/products' },
      { label: 'Reviews', value: d.totalReviews, recent: this.sum(d.reviewsOverTime), icon: Star, link: '/products' },
    ];
  });

  readonly attention = computed<AttentionItem[]>(() => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Products to review', description: 'Submitted by companies, waiting for approval', count: d.totalPendingApprovals, icon: Package, link: '/products', query: { status: ProductStatus.PENDING_REVIEW } },
      { label: 'Companies to verify', description: 'New companies waiting for activation', count: d.totalPendingCompanies, icon: Building2, link: '/companies', query: { status: 'PENDING' } },
      { label: 'Product suggestions', description: 'Products users asked to add', count: d.totalPendingSuggestions, icon: Lightbulb, link: '/suggestions' },
    ];
  });

  readonly allCaughtUp = computed(() => this.attention().every(a => a.count === 0));

  // ── Activity chart: new users / reviews / companies per day ──
  readonly activityChart = computed<ChartConfiguration<'line'>['data']>(() => {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const line = (label: string, points: TimeSeriesPoint[], color: string) => ({
      label,
      data: points.map(p => p.count),
      borderColor: color,
      backgroundColor: color,
      pointRadius: 0,
      pointHoverRadius: 4,
      // monotone smoothing never dips below zero or overshoots a peak
      cubicInterpolationMode: 'monotone' as const,
      borderWidth: 2,
    });
    return {
      labels: d.usersOverTime.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        line('New users', d.usersOverTime, SERIES.users),
        line('New reviews', d.reviewsOverTime, SERIES.reviews),
        line('New companies', d.companiesOverTime, SERIES.companies),
      ],
    };
  });

  readonly activityOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0f172a', padding: 10, cornerRadius: 8, boxPadding: 4, usePointStyle: true },
    },
    scales: {
      y: { beginAtZero: true, border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', precision: 0, font: { size: 11 } } },
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 8, font: { size: 11 } } },
    },
  };

  // ── Products by status ──
  readonly productStatuses = computed(() => {
    const counts = this.data()?.productsByStatus ?? {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.keys(STATUS_COLORS).map(status => ({
      status,
      label: humanize(status),
      count: counts[status] ?? 0,
      percent: Math.round(((counts[status] ?? 0) / total) * 1000) / 10,
      color: STATUS_COLORS[status],
    }));
  });

  // Legend with each series' 30-day total, doubles as the chart's direct labels
  readonly activitySeries = computed(() => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'New users', total: this.sum(d.usersOverTime), color: SERIES.users },
      { label: 'New reviews', total: this.sum(d.reviewsOverTime), color: SERIES.reviews },
      { label: 'New companies', total: this.sum(d.companiesOverTime), color: SERIES.companies },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getDashboard().subscribe({
      next: res => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load the dashboard.'));
        this.loading.set(false);
      }
    });
  }

  moderate(product: ProductResponse, status: ProductStatus.PUBLISHED | ProductStatus.REJECTED) {
    this.moderating.set(product.id);
    this.productService.updateProductStatusAsAdmin(product.id, status).subscribe({
      next: () => {
        this.moderating.set(null);
        this.toast.success(`"${product.name}" ${status === ProductStatus.PUBLISHED ? 'is now published' : 'was rejected'}.`);
        this.navCounts.refresh();
        this.load();
      },
      error: err => {
        this.moderating.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not update the product.'));
      }
    });
  }

  protected readonly ProductStatus = ProductStatus;

  private sum(points: TimeSeriesPoint[]): number {
    return points.reduce((total, p) => total + p.count, 0);
  }
}
