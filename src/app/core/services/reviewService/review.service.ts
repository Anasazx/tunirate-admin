import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedService/shared.service';
import { ReviewResponse } from '../../model/dto/reviewDTO/reviewResponse.model';
import { ReviewRequest } from '../../model/dto/reviewDTO/reviewRequest.model';

export interface PageResponse<T> {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
  };
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private reviewUrl: string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.reviewUrl = `${this.sharedService.publicUrl}/reviews`;
  }

  getAllReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(this.reviewUrl);
  }

  getReviewById(id: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.reviewUrl}/${id}`);
  }

  getMyCompanyReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.reviewUrl}/my`);
  }

  getReviewsByProductId(productId: number, page = 0, size = 10): Observable<PageResponse<ReviewResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<ReviewResponse>>(`${this.reviewUrl}/by-product/${productId}`, { params });
  }

  getReviewsByUserId(userId: number, page = 0, size = 10): Observable<PageResponse<ReviewResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<ReviewResponse>>(`${this.reviewUrl}/by-user/${userId}`, { params });
  }

  createReview(request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.reviewUrl, request);
  }

  updateReview(id: number, request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${this.reviewUrl}/${id}`, request);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reviewUrl}/${id}`);
  }
}
