import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/productService/product.service';
import { ProductResponse } from '../../../core/model/dto/productDTO/productResponse.model';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products-management.component.html',
  styleUrl: './products-management.component.css'
})
export class ProductsManagementComponent implements OnInit {

  // ===== FILTERS =====
  query = '';
  selectedStatus = '';

  // ===== DATA =====
  products: ProductResponse[] = [];

  // ===== UI STATE =====
  loading = false;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ===== API =====
  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductsAsAdmin().subscribe({
      next: (res) => {
        this.products = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  // ===== FILTERED VIEW =====
  get filtered(): ProductResponse[] {

    const q = this.query.trim().toLowerCase();

    return this.products.filter(p => {

      const matchesQuery =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.companyName?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q);

      const matchesStatus =
        !this.selectedStatus ||
        p.status === this.selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }

  // ===== DELETE (TEMP LOCAL) =====
  deleteProduct(id: number): void {
    this.products = this.products.filter(p => p.id !== id);
  }
}
