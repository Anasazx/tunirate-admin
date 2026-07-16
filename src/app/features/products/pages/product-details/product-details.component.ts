import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DetailedProductResponse } from '../../models/productDTO/detailedProductResponse.model';
import { ProductService } from '../../services/productService/product.service';
import { SharedService } from '../../../../core/services/sharedService/shared.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  product: DetailedProductResponse | null = null;

  loading = false;
  error: string | null = null;

  id: number | null = null;

  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.id = Number(
      this.route.snapshot.paramMap.get('id')
    );
    if (!this.id) {
      this.error = 'Invalid product id';
      return;
    }
    this.loadProduct(this.id);
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error = null;
    this.productService
      .getDetailedProductByIdAsAdmin(id)
      .subscribe({
        next: (res) => {
          this.product = res;
          // default image
          this.selectedImage =
            res.images?.find(img => img.isMain)?.url ??
            res.images?.[0]?.url ??
            null;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load product details';
          this.loading = false;
        }
      });
  }

  selectImage(url: string) {
    this.selectedImage = url;
  }

  get mainImage(): string | null {
    return this.selectedImage;
  }
}
