import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {DashboardService} from '../../services/dashboardService/dashboard.service';
import {AdminDashboardResponse} from '../../models/dashboardDTO/adminDashboardResponse.model';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  stats: Array<{ label: string; value: string; icon: string }> = [];

  data!: AdminDashboardResponse;

  loading = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard() {
    this.loading = true;

    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data = res;

        this.stats = [
          { label: 'Users', value: this.format(res.totalUsers), icon: '👥' },
          { label: 'Companies', value: this.format(res.totalCompanies), icon: '🏢' },
          { label: 'Verified companies', value: this.format(res.totalVerifiedCompanies), icon: '✅' },
          { label: 'Products', value: this.format(res.totalProducts), icon: '📦' },
          { label: 'Reviews', value: this.format(res.totalReviews), icon: '⭐' },
          { label: 'Pending approval products', value: this.format(res.totalPendingApprovals), icon: '⏳' },
        ];

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
}
