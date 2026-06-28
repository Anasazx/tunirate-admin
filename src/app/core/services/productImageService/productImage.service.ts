import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../sharedService/shared.service';
import { Observable } from 'rxjs';
import { ProductImageResponse } from '../../model/dto/productDTO/productImageResponse.model';




@Injectable({
	providedIn: 'root'
})
export class ProductImageService {

	private baseUrl = '';

	constructor(private http: HttpClient, private sharedService: SharedService) {
		this.baseUrl = `${this.sharedService.publicUrl}/productImage`;
	}

	/** Get all images for a product */
	getImagesByProduct(productId: number): Observable<ProductImageResponse[]> {
		return this.http.get<ProductImageResponse[]>(`${this.baseUrl}/product/${productId}`);
	}

	/** Add an image for a product by URL */
	addImageToProduct(productId: number, imageUrl: string): Observable<ProductImageResponse> {
		const encoded = encodeURIComponent(imageUrl);
		return this.http.post<ProductImageResponse>(`${this.baseUrl}/product/${productId}?url=${encoded}`, {});
	}

	/** Upload an image file for a product (Multipart form upload) */
	uploadImageFile(productId: number, file: File): Observable<ProductImageResponse> {
		const fd = new FormData();
		fd.append('file', file);
		// Server snippet suggests POST /productImage/{productId} with Multipart 'file'
		return this.http.post<ProductImageResponse>(`${this.baseUrl}/${productId}`, fd);
	}

	/** Delete an image by id */
	deleteImage(imageId: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}/${imageId}`);
	}

	/** Mark an image as the main image for a product */
	setMainImage(imageId: number, productId: number): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}/${imageId}/main?productId=${productId}`, {});
	}


}



