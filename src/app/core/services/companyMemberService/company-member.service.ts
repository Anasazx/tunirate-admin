import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyMemberRequest } from '../../model/dto/companyMemberDTO/companyMemberRequest.model';
import { SharedService } from '../sharedService/shared.service';
import { UpdateMemberRoleRequest } from '../../model/dto/companyMemberDTO/updateMemberRoleRequest.model';
import { CompanyMemberResponse } from '../../model/dto/companyMemberDTO/CompanyMemberResponse.model';



@Injectable({
  providedIn: 'root'
})
export class CompanyMemberService {

  private companyMemberUrl = '';

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.companyMemberUrl = this.sharedService.publicUrl + '/membership';
  }
  


  // GET /membership/company/{companyId}
  getMembersByCompanyId(companyId: number): Observable<CompanyMemberResponse[]> {
    return this.http.get<CompanyMemberResponse[]>(
      `${this.companyMemberUrl}/company/${companyId}`
    );
  }

  getMyCompanyMembers(): Observable<CompanyMemberResponse[]> {
    return this.http.get<CompanyMemberResponse[]>(
      `${this.companyMemberUrl}`
    );
  }


  // GET /membership/user/{userId}
  getCompaniesByUserId(userId: number): Observable<CompanyMemberResponse[]> {
    return this.http.get<CompanyMemberResponse[]>(
      `${this.companyMemberUrl}/user/${userId}`
    );
  }

  // POST /membership/assign
  assignMemberToCompany(request: CompanyMemberRequest): Observable<CompanyMemberResponse> {
    return this.http.post<CompanyMemberResponse>(
      `${this.companyMemberUrl}/assign`,
      request
    );
  }

  // DELETE /membership/remove?userId=&companyId=
  removeMemberFromCompany(userId: number, companyId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.companyMemberUrl}/remove`,
      {
        params: {
          userId,
          companyId
        }
      }
    );
  }

  // DELETE /membership
  removeMemberFromMyCompany(removedUserId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.companyMemberUrl}`,
      {
        params: {
          userId: removedUserId.toString()
        }
      }
    );
  }

  // PATCH /membership/role
  updateRole(request: UpdateMemberRoleRequest): Observable<CompanyMemberResponse> {
    return this.http.patch<CompanyMemberResponse>(
      `${this.companyMemberUrl}/role`,
      request
    );
  }


}