import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../models/productDTO/productResponse.model';
import { DetailedProductResponse } from '../../models/productDTO/detailedProductResponse.model';
import { ProductRequest } from '../../models/productDTO/productRequest.model';



@Injectable({
  providedIn: 'root'
})



export class ProductService {

  productUrl : string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.productUrl = this.sharedService.publicUrl + "/product"
  }

  updateProductAsAdmin(productId: number, payload: ProductRequest): Observable<DetailedProductResponse> {
    return this.http.put<DetailedProductResponse>(`${this.productUrl.toString()}/${productId}`, payload);
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

  archiveProductAsAdmin(productId: number): Observable<void> {
    return this.http.post<void>(`${this.productUrl}/op/${productId}/archive`, {});
  }


}
