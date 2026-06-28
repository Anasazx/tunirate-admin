import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { forkJoin } from 'rxjs';
import { ProductService } from '../../core/services/productService/product.service';
import { CompanyService } from '../../core/services/companyService/company.service';
import { UserService } from '../../core/services/userService/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats: Array<{ label: string; value: string; icon: string }> = [];
  recentProducts: any[] = [];
  recentUsers: any[] = [];
  recentCompanies: any[] = [];
  loading = false;

  constructor(
    private productService: ProductService,
    private companyService: CompanyService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard() {
    this.loading = true;
    forkJoin({
      products: this.productService.getProducts(),
      companies: this.companyService.getAllCompanies(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ products, companies, users }) => {
        this.stats = [
          { label: 'Products', value: this.formatNumber(products.length), icon: '📦' },
          { label: 'Companies', value: this.formatNumber(companies.length), icon: '🏢' },
          { label: 'Users', value: this.formatNumber(users.length), icon: '👥' }
        ];

        this.recentProducts = products.slice(-5).reverse();
        this.recentCompanies = companies.slice(-5).reverse();
        this.recentUsers = users.slice(-5).reverse();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.loading = false;
      }
    });
  }

  private formatNumber(n: number) {
    return n.toLocaleString();
  }

}
