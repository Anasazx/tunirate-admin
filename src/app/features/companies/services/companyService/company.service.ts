import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';
import {CompanyStatus} from '../../enums/companyStatus.enum.model';


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

  getCompanyDetailsByIdAsAdmin(id: number): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.companyUrl}/op/details/${id}`);
  }

  createCompany(payload: CompanyRequest, logo?: File, banner?: File): Observable<CompanyResponse> {

    const formData = new FormData();

    // JSON part
    formData.append(
      'data',
      new Blob(
        [JSON.stringify(payload)],
        { type: 'application/json' }
      )
    );

    // Logo file
    if (logo) {
      formData.append('logo', logo);
    }

    // Banner file
    if (banner) {
      formData.append('banner', banner);
    }

    return this.http.post<CompanyResponse>(this.companyUrl, formData);

  }

  updateCompany(id: number, payload: CompanyRequest, logo?: File, banner?: File): Observable<CompanyResponse> {

    const formData = new FormData();

    // JSON part
    formData.append(
      'data',
      new Blob(
        [JSON.stringify(payload)],
        { type: 'application/json' }
      )
    );

    // Logo
    if (logo) {
      formData.append('logo', logo);
    }

    // Banner
    if (banner) {
      formData.append('banner', banner);
    }

    return this.http.put<CompanyResponse>(
      `${this.companyUrl}/${id}`,
      formData
    );

  }

  updateCompanyStatus(companyId: number, status: CompanyStatus): Observable<void> {
    return this.http.patch<void>(`${this.companyUrl}/${companyId}/status`, status);
  }

}
