import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../sharedService/shared.service';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../model/dto/productDTO/productResponse.model';
import { DetailedProduct } from '../../model/detailedProduct.model';
import { ProductRequest } from '../../model/dto/productDTO/productRequest.model';
import {CompanyProductRequest} from '../../model/dto/productDTO/companyProductRequest.model';



@Injectable({
  providedIn: 'root'
})



export class ProductService {

  productUrl : String;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.productUrl = this.sharedService.publicUrl + "/product"
  }

  getProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.productUrl.toString());
  }


  getDetailedProductById(productId: number): Observable<DetailedProduct> {
    return this.http.get<DetailedProduct>(`${this.productUrl.toString()}/${productId}/details`);
  }


  updateProduct(productId: number, payload: ProductRequest): Observable<DetailedProduct> {
    return this.http.put<DetailedProduct>(`${this.productUrl.toString()}/${productId}`, payload);
  }

  //Admin method
  createProductAsAdmin(payload: ProductRequest): Observable<DetailedProduct> {
    return this.http.post<DetailedProduct>(this.productUrl.toString(), payload);
  }

  //Company method
  createProductAsCompany(payload: CompanyProductRequest): Observable<DetailedProduct> {
    return this.http.post<DetailedProduct>(this.productUrl.toString(), payload);
  }

  getProductsByCompanyId(companyId: number): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.productUrl.toString()}/company/${companyId}`
    );
  }

  //Company method
  getMyCompanyProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.productUrl.toString()}/my`
    );
  }

  //Admin method
  getProductsAsAdmin(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.productUrl.toString()}/op`
    );
  }

}
