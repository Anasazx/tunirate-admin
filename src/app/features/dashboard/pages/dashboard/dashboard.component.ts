import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboardService/dashboard.service';
import { AdminDashboardResponse } from '../../models/dashboardDTO/adminDashboardResponse.model';

import { Users, Building2, CheckCircle, Package, Star, Clock } from 'lucide';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../auth/services/authService/auth.service';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  stats: Array<{ label: string; value: string; icon: any }> = [];

  data!: AdminDashboardResponse;

  loading = false;

  currentUser$: any;

  username: any;

  // ── Bar chart: entity counts overview ──
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Total',
        backgroundColor: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'],
        borderRadius: 6,
        barThickness: 32
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        ticks: { color: '#6B7280', font: { size: 12 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 12 } }
      }
    }
  };

  // ── Doughnut chart: companies status breakdown ──
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Active Companies', 'Inactive Companies'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#4F46E5', '#E5E7EB'],
        borderWidth: 0
      }
    ]
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6B7280',
          font: { size: 12 },
          padding: 16,
          usePointStyle: true
        }
      }
    }
  };

  // ── Line charts: entity growth over time ──
  public usersLineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'New Users',
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.08)',
      pointBackgroundColor: '#4F46E5',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      tension: 0.35,
      fill: true,
      borderWidth: 2
    }]
  };

  public companiesLineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'New Companies',
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.08)',
      pointBackgroundColor: '#059669',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      tension: 0.35,
      fill: true,
      borderWidth: 2
    }]
  };

  public reviewsLineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'New Reviews',
      borderColor: '#DB2777',
      backgroundColor: 'rgba(219, 39, 119, 0.08)',
      pointBackgroundColor: '#DB2777',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      tension: 0.35,
      fill: true,
      borderWidth: 2
    }]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        ticks: { color: '#6B7280', font: { size: 12 }, precision: 0 }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.username = this.currentUser$.source._value.username;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard() {
    this.loading = true;

    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data = res;

        this.stats = [
          {
            label: 'Users',
            value: this.format(res.totalUsers),
            icon: Users
          },
          {
            label: 'Companies',
            value: this.format(res.totalCompanies),
            icon: Building2
          },
          {
            label: 'Active companies',
            value: this.format(res.totalActiveCompanies),
            icon: CheckCircle
          },
          {
            label: 'Products',
            value: this.format(res.totalProducts),
            icon: Package
          },
          {
            label: 'Reviews',
            value: this.format(res.totalReviews),
            icon: Star
          },
          {
            label: 'Pending approval products',
            value: this.format(res.totalPendingApprovals),
            icon: Clock
          }
        ];

        // ── Populate bar chart from real data ──
        this.barChartData = {
          ...this.barChartData,
          labels: ['Users', 'Companies', 'Products', 'Reviews', 'Pending'],
          datasets: [
            {
              ...this.barChartData.datasets[0],
              data: [
                res.totalUsers,
                res.totalCompanies,
                res.totalProducts,
                res.totalReviews,
                res.totalPendingApprovals
              ]
            }
          ]
        };

        // ── Populate doughnut chart from real data ──
        const inactiveCompanies = res.totalCompanies - res.totalActiveCompanies;
        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [
            {
              ...this.doughnutChartData.datasets[0],
              data: [res.totalActiveCompanies, inactiveCompanies]
            }
          ]
        };

        // ── Populate line charts from time-series data ──
        this.usersLineChartData = {
          ...this.usersLineChartData,
          labels: res.usersOverTime.map(p => this.formatDate(p.date)),
          datasets: [{
            ...this.usersLineChartData.datasets[0],
            data: res.usersOverTime.map(p => p.count)
          }]
        };

        this.companiesLineChartData = {
          ...this.companiesLineChartData,
          labels: res.companiesOverTime.map(p => this.formatDate(p.date)),
          datasets: [{
            ...this.companiesLineChartData.datasets[0],
            data: res.companiesOverTime.map(p => p.count)
          }]
        };

        this.reviewsLineChartData = {
          ...this.reviewsLineChartData,
          labels: res.reviewsOverTime.map(p => this.formatDate(p.date)),
          datasets: [{
            ...this.reviewsLineChartData.datasets[0],
            data: res.reviewsOverTime.map(p => p.count)
          }]
        };

        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard error', err);
        this.loading = false;
      }
    });
  }

  private format(n: number): string {
    return n.toLocaleString();
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
