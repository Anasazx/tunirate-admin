import { Injectable } from '@angular/core';
import { SharedService } from '../sharedService/shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyDashboardResponse } from '../../model/dto/companyDashboardDTO/companyDashboardResponse.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyDashboardService {

  private companyDashboardUrl: string;

  constructor(
    private sharedService: SharedService,
    private http: HttpClient
  ) {
    this.companyDashboardUrl = this.sharedService.publicUrl + '/dashboard';
  }

  getMyCompanyDashboard(): Observable<CompanyDashboardResponse> {
    return this.http.get<CompanyDashboardResponse>(`${this.companyDashboardUrl}`);
  }
}
