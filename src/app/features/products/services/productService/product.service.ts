import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { Page } from '../../../../core/model/page.model';
import { ProductResponse } from '../../models/productDTO/productResponse.model';
import { DetailedProductResponse } from '../../models/productDTO/detailedProductResponse.model';
import { ProductRequest } from '../../models/productDTO/productRequest.model';
import { ProductFilters, ProductStatusCounts } from '../../models/productDTO/productFilters.model';
import { ProductStatus } from '../../enums/productStatus.enum.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly productUrl: string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.productUrl = this.sharedService.publicUrl + '/product';
  }

  // Paginated admin products table; drafts are never included
  getProductsAsAdmin(filters: ProductFilters = {}): Observable<Page<ProductResponse>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20)
      .set('sort', 'createdAt,desc');
    if (filters.q) params = params.set('q', filters.q);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.companyId) params = params.set('companyId', filters.companyId);
    if (filters.subcategoryId) params = params.set('subcategoryId', filters.subcategoryId);
    if (filters.uncategorized) params = params.set('uncategorized', true);
    return this.http.get<Page<ProductResponse>>(`${this.productUrl}/op`, { params });
  }

  getStatusCounts(companyId?: number | null): Observable<ProductStatusCounts> {
    const params = companyId ? new HttpParams().set('companyId', companyId) : undefined;
    return this.http.get<ProductStatusCounts>(`${this.productUrl}/op/status-counts`, { params });
  }

  getDetailedProductByIdAsAdmin(productId: number): Observable<DetailedProductResponse> {
    return this.http.get<DetailedProductResponse>(`${this.productUrl}/op/${productId}/details`);
  }

  createProductAsAdmin(payload: ProductRequest, images?: File[]): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.productUrl, this.toFormData(payload, images));
  }

  updateProductAsAdmin(id: number, payload: ProductRequest, images?: File[]): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.productUrl}/${id}`, this.toFormData(payload, images));
  }

  updateProductStatusAsAdmin(productId: number, status: ProductStatus): Observable<void> {
    return this.http.patch<void>(`${this.productUrl}/op/${productId}/status`, { status });
  }

  // Multipart body: the JSON "data" part plus optional "images" files
  private toFormData(payload: ProductRequest, images?: File[]): FormData {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    images?.forEach(image => formData.append('images', image));
    return formData;
  }
}
