import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../sharedService/shared.service';
import { Observable } from 'rxjs';




@Injectable({
	providedIn: 'root'
})
export class ProductImageService {

	private baseUrl = '';

	constructor(private http: HttpClient, private sharedService: SharedService) {
		this.baseUrl = `${this.sharedService.publicUrl}/productImage`;
	}


	/** Mark an image as the main image for a product */
	setMainImage(imageId: number, productId: number): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}/${imageId}/main?productId=${productId}`, {});
	}


}



