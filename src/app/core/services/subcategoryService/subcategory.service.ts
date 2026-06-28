import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedService/shared.service';
import { SubcategoryRequest } from '../../model/dto/subcategoryDTO/subcategoryRequest.model';
import { SubcategoryResponse } from '../../model/dto/subcategoryDTO/subcategoryResponse.model';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
    
    private readonly subcategoryUrl: string;
    
    constructor(private sharedService: SharedService, private http: HttpClient) {
        this.subcategoryUrl = this.sharedService.publicUrl + '/subcategories';
    }

    getAllSubcategories(): Observable<SubcategoryResponse[]> {
        return this.http.get<SubcategoryResponse[]>(this.subcategoryUrl);
    }

    getSubcategoryById(id: number): Observable<SubcategoryResponse> {
        return this.http.get<SubcategoryResponse>(`${this.subcategoryUrl}/${id}`);
    }

    createSubcategory(payload: SubcategoryRequest): Observable<SubcategoryResponse> {
        return this.http.post<SubcategoryResponse>(this.subcategoryUrl, payload);
    }

    updateSubcategory(id: number, payload: SubcategoryRequest): Observable<SubcategoryResponse> {
        return this.http.put<SubcategoryResponse>(`${this.subcategoryUrl}/${id}`, payload);
    }

    deleteSubcategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.subcategoryUrl}/${id}`);
    }
}