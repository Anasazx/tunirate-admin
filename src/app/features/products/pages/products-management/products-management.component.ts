import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../services/productService/product.service';
import { ProductResponse } from '../../models/productDTO/productResponse.model';
import {ProductStatus} from '../../enums/productStatus.enum.model';

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

  // ===== Archive STATE =====
  productToArchive: ProductResponse | null = null;

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
        p.subcategoryName?.toLowerCase().includes(q);

      const matchesStatus =
        !this.selectedStatus ||
        p.status === this.selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }

  // ===== Archive FLOW =====

  confirmArchive(product: ProductResponse): void {
    this.productToArchive = product;
  }

  cancelArchive(): void {
    this.productToArchive = null;
  }

  archiveConfirmed(): void {
    if (!this.productToArchive) return;

    const id = this.productToArchive.id;

    this.productService.archiveProductAsAdmin(id).subscribe({
      next: () => {
        this.products = this.products.map(p =>
          p.id === id
            ? { ...p, status: ProductStatus.ARCHIVED }
            : p
        );
        this.productToArchive = null;
      },
      error: (err) => {
        console.error('Archive failed', err);
      }
    });
  }
}
