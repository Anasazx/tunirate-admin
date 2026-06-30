import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardService} from '../../services/dashboardService/dashboard.service';
import {AdminDashboardResponse} from '../../models/dashboardDTO/adminDashboardResponse.model';

import { Users, Building2, CheckCircle, Package, Star, Clock } from 'lucide';
import { LucideAngularModule } from 'lucide-angular';
import {AuthService} from '../../../auth/services/authService/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  stats: Array<{ label: string; value: string; icon: any }> = [];

  data!: AdminDashboardResponse;

  loading = false;

  currentUser$: any;

  ngOnInit(): void {
    this.loadDashboard();
  }

  username: any;

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.username = this.currentUser$.source._value.username;
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
