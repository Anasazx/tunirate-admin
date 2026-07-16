import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../models/productDTO/productResponse.model';
import { DetailedProductResponse } from '../../models/productDTO/detailedProductResponse.model';
import { ProductRequest } from '../../models/productDTO/productRequest.model';
import {CompanyStatus} from '../../../companies/enums/companyStatus.enum.model';
import {ProductStatus} from '../../enums/productStatus.enum.model';



@Injectable({
  providedIn: 'root'
})

export class ProductService {

  productUrl : string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.productUrl = this.sharedService.publicUrl + "/product"
  }

  updateProductAsAdmin(id: number, payload: ProductRequest, images?: File[]): Observable<DetailedProductResponse> {

    const formData = new FormData();

    formData.append('data', new Blob(
        [JSON.stringify(payload)], { type: 'application/json' }
      )
    );

    if (images && images.length > 0) {images.forEach(image => {
        formData.append('images', image);
      });
    }

    return this.http.put<DetailedProductResponse>(`${this.productUrl}/${id}`, formData);
  }

  createProductAsAdmin(payload: ProductRequest, images?: File[]): Observable<DetailedProductResponse> {

    const formData = new FormData();

    // JSON part
    formData.append('data', new Blob(
        [JSON.stringify(payload)],
        { type: 'application/json' }
      )
    );

    // Images
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    return this.http.post<DetailedProductResponse>(
      this.productUrl,
      formData
    );
  }

  getProductsAsAdmin(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.productUrl.toString()}/op`
    );
  }

  getDetailedProductByIdAsAdmin(productId: number): Observable<DetailedProductResponse> {
    return this.http.get<DetailedProductResponse>(`${this.productUrl.toString()}/op/${productId}/details`);
  }

  updateProductStatusAsAdmin(productId: number, status: ProductStatus): Observable<void> {
    return this.http.patch<void>(`${this.productUrl}/op/${productId}/status`, status);
  }

}
