import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';


@Injectable({
  providedIn: 'root'
})


export class CompanyService {

  private readonly companyUrl;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.companyUrl = this.sharedService.publicUrl + '/company';
  }

  getAllCompanies(): Observable<CompanyResponse[]> {
    return this.http.get<CompanyResponse[]>(this.companyUrl);
  }

  getAllCompaniesAsAdmin(): Observable<CompanyResponse[]> {
    return this.http.get<CompanyResponse[]>(`${this.companyUrl}`);
  }

  getCompanyById(id: number): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.companyUrl}/${id}`);
  }

  getCompanyDetailsByIdAsAdmin(id: number): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.companyUrl}/details/${id}`);
  }

  createCompany(payload: CompanyRequest): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(this.companyUrl, payload);
  }

  updateCompany(id: number, payload: CompanyRequest): Observable<CompanyResponse> {
    return this.http.put<CompanyResponse>(`${this.companyUrl}/${id}`, payload);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.companyUrl}/${id}`);
  }

  uploadLogo(companyId: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<void>(
      `${this.companyUrl}/${companyId}/logo`,
      formData
    );
  }

  uploadBanner(companyId: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(
      `${this.companyUrl}/${companyId}/banner`,
      formData
    );
  }

  deleteLogo(companyId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.companyUrl}/${companyId}/logo`
    );
  }

  deleteBanner(companyId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.companyUrl}/${companyId}/banner`
    );
  }

}
