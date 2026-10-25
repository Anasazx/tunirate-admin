import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../../../core/services/sharedService/shared.service';
import { SuggestionResponse, SuggestionStatus } from '../models/suggestion.model';

@Injectable({ providedIn: 'root' })
export class SuggestionService {

  private readonly url: string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.url = `${this.sharedService.publicUrl}/suggestions`;
  }

  getSuggestions(status?: SuggestionStatus | null): Observable<SuggestionResponse[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<SuggestionResponse[]>(this.url, { params });
  }

  // Approving links the suggestion to the product that now exists on the platform
  approve(id: number, productId: number): Observable<SuggestionResponse> {
    return this.http.patch<SuggestionResponse>(`${this.url}/${id}/status`, { status: 'APPROVED', productId });
  }

  reject(id: number): Observable<SuggestionResponse> {
    return this.http.patch<SuggestionResponse>(`${this.url}/${id}/status`, { status: 'REJECTED' });
  }
}
