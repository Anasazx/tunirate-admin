import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../models/productDTO/productResponse.model';
import { DetailedProduct } from '../../models/detailedProduct.model';
import { ProductRequest } from '../../models/productDTO/productRequest.model';



@Injectable({
  providedIn: 'root'
})



export class ProductService {

  productUrl : String;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.productUrl = this.sharedService.publicUrl + "/product"
  }



  getDetailedProductById(productId: number): Observable<DetailedProduct> {
    return this.http.get<DetailedProduct>(`${this.productUrl.toString()}/${productId}/details`);
  }


  updateProductAsAdmin(productId: number, payload: ProductRequest): Observable<DetailedProduct> {
    return this.http.put<DetailedProduct>(`${this.productUrl.toString()}/${productId}`, payload);
  }

  //Admin method
  createProductAsAdmin(payload: ProductRequest): Observable<DetailedProduct> {
    return this.http.post<DetailedProduct>(this.productUrl.toString(), payload);
  }



  //Admin method
  getProductsAsAdmin(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.productUrl.toString()}/op`
    );
  }

}
