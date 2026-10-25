import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedService/shared.service';
import { Page } from '../../model/page.model';

// Review as returned by GET /reviews/product/{id}
export interface ProductReview {
  id: number;
  rating: number;
  content: string | null;
  user: { id: number; name: string; avatarUrl: string | null } | null;
  commentsCount: number;
  likeCount: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private readonly reviewUrl: string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.reviewUrl = `${this.sharedService.publicUrl}/reviews`;
  }

  getProductReviews(productId: number, page = 0, size = 5): Observable<{ reviews: Page<ProductReview> }> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt,desc');
    return this.http.get<{ reviews: Page<ProductReview> }>(`${this.reviewUrl}/product/${productId}`, { params });
  }
}
