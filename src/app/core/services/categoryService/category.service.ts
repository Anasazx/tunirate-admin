import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedService/shared.service';
import { CategoryRequest } from '../../model/dto/categoryDTO/categoryRequest.model';
import { CategoryResponse } from '../../model/dto/categoryDTO/categoryResponse.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

    private readonly categoryUrl: string;
    
    constructor(private sharedService: SharedService, private http: HttpClient) {
        this.categoryUrl = this.sharedService.publicUrl + '/categories';
    }

    getAllCategories(): Observable<CategoryResponse[]> {
        return this.http.get<CategoryResponse[]>(this.categoryUrl);
    }

    getCategoryById(id: number): Observable<CategoryResponse> {
        return this.http.get<CategoryResponse>(`${this.categoryUrl}/${id}`);
    }

    createCategory(payload: CategoryRequest): Observable<CategoryResponse> {
        return this.http.post<CategoryResponse>(this.categoryUrl, payload);
    }

    updateCategory(id: number, payload: CategoryRequest): Observable<CategoryResponse> {
        return this.http.put<CategoryResponse>(`${this.categoryUrl}/${id}`, payload);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.categoryUrl}/${id}`);
    }
}