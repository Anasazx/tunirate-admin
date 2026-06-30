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

  productUrl : String;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.productUrl = this.sharedService.publicUrl + "/product"
  }

  //Admin method
  updateProductAsAdmin(productId: number, payload: ProductRequest): Observable<DetailedProductResponse> {
    return this.http.put<DetailedProductResponse>(`${this.productUrl.toString()}/${productId}`, payload);
  }

  //Admin method
  createProductAsAdmin(payload: ProductRequest): Observable<DetailedProductResponse> {
    return this.http.post<DetailedProductResponse>(this.productUrl.toString(), payload);
  }

  //Admin method
  getProductsAsAdmin(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.productUrl.toString()}/op`
    );
  }

  //Admin method
  getDetailedProductByIdAsAdmin(productId: number): Observable<DetailedProductResponse> {
    return this.http.get<DetailedProductResponse>(`${this.productUrl.toString()}/op/${productId}/details`);
  }

  //Admin method
  archiveProductAsAdmin(productId: number): Observable<void> {
    return this.http.post<void>(`${this.productUrl}/op/${productId}/archive`, {});
  }


}
