import { Injectable } from '@angular/core';
import {SharedService} from '../../../../core/services/sharedService/shared.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AdminDashboardResponse} from '../../models/dashboardDTO/adminDashboardResponse.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {


  private readonly dashboardUrl: string;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.dashboardUrl = this.sharedService.publicUrl + '/admindashboard';
  }

  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(this.dashboardUrl);
  }


}
