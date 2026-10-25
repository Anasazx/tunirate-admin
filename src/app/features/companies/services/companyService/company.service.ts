import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { Page } from '../../../../core/model/page.model';
import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyOption, CompanyResponse, CompanyStatusCounts, CompanySummaryResponse } from '../../models/companyDTO/companyResponse.model';
import { CompanyStatus } from '../../enums/companyStatus.enum.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private readonly companyUrl: string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.companyUrl = this.sharedService.publicUrl + '/company';
  }

  // Every company, for dropdowns
  getCompanyOptions(): Observable<CompanyOption[]> {
    return this.http.get<CompanyOption[]>(this.companyUrl);
  }

  // Paginated admin companies table
  getCompaniesAsAdmin(filters: { q?: string; status?: CompanyStatus | null; page?: number; size?: number } = {}): Observable<Page<CompanySummaryResponse>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20)
      .set('sort', 'createdAt,desc');
    if (filters.q) params = params.set('q', filters.q);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<Page<CompanySummaryResponse>>(`${this.companyUrl}/op`, { params });
  }

  getStatusCounts(): Observable<CompanyStatusCounts> {
    return this.http.get<CompanyStatusCounts>(`${this.companyUrl}/op/status-counts`);
  }

  getCompanyDetailsByIdAsAdmin(id: number): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.companyUrl}/op/details/${id}`);
  }

  createCompany(payload: CompanyRequest, logo?: File, banner?: File): Observable<CompanySummaryResponse> {
    return this.http.post<CompanySummaryResponse>(this.companyUrl, this.toFormData(payload, logo, banner));
  }

  updateCompany(id: number, payload: CompanyRequest, logo?: File, banner?: File): Observable<CompanySummaryResponse> {
    return this.http.put<CompanySummaryResponse>(`${this.companyUrl}/${id}`, this.toFormData(payload, logo, banner));
  }

  updateCompanyStatus(companyId: number, status: CompanyStatus): Observable<void> {
    return this.http.patch<void>(`${this.companyUrl}/${companyId}/status`, { status });
  }

  // Multipart body: the JSON "data" part plus optional logo and banner files
  private toFormData(payload: CompanyRequest, logo?: File, banner?: File): FormData {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (logo) formData.append('logo', logo);
    if (banner) formData.append('banner', banner);
    return formData;
  }
}
