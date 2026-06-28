import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedService/shared.service';
import { CompanyInvitationResponse } from '../../../features/companies/models/companyInvitationDTO/CompanyInvitationResponse.model';
import { CompanyInvitationRequest } from '../../../features/companies/models/companyInvitationDTO/CompanyInvitationRequest.model';



@Injectable({
  providedIn: 'root'
})
export class CompanyInvitationService {

  private baseUrl: string;

  constructor(private sharedService: SharedService,private http: HttpClient) {
    this.baseUrl = `${this.sharedService.publicUrl}/invitations`;
  }

  // CREATE invitation
  sendInvitation(request: CompanyInvitationRequest): Observable<CompanyInvitationResponse> {
    return this.http.post<CompanyInvitationResponse>(`${this.baseUrl}`, request);
  }

  // GET company invitations
  getCompanyInvitations(): Observable<CompanyInvitationResponse[]> {
    return this.http.get<CompanyInvitationResponse[]>(`${this.baseUrl}/company`);
  }

  // GET my invitations
  getMyInvitations(): Observable<CompanyInvitationResponse[]> {
    return this.http.get<CompanyInvitationResponse[]>(`${this.baseUrl}/me`);
  }

  // ACCEPT invitation
  acceptInvitation(invitationId: number): Observable<CompanyInvitationResponse> {
    return this.http.post<CompanyInvitationResponse>(
      `${this.baseUrl}/${invitationId}/accept`,
      {}
    );
  }

  // REJECT invitation
  rejectInvitation(invitationId: number): Observable<CompanyInvitationResponse> {
    return this.http.post<CompanyInvitationResponse>(
      `${this.baseUrl}/${invitationId}/reject`,
      {}
    );
  }

  // CANCEL invitation (HEAD only)
  cancelInvitation(invitationId: number): Observable<CompanyInvitationResponse> {
    return this.http.post<CompanyInvitationResponse>(
      `${this.baseUrl}/${invitationId}/cancel`,
      {}
    );
  }

}
