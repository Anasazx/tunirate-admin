import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CompanyService } from '../../services/companyService/company.service';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import {CompanyStatus} from '../../enums/companyStatus.enum.model';
import { CompanyRole } from '../../enums/companyRole.enum.model';
import { CompanyMemberResponse } from '../../models/companyMemberDTO/CompanyMemberResponse.model';
import { CompanyMemberService } from '../../../../core/services/companyMemberService/company-member.service';
import { UserService } from '../../../users/services/userService/user.service';
import { UserResponse } from '../../../users/models/userDTO/userResponse.model';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css'
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {

  company: CompanyResponse | null = null;
  loading = false;
  error: string | null = null;
  id: number | null = null;

  // Add member form
  memberQuery = '';
  searchResults: UserResponse[] = [];
  searching = false;
  selectedUser: UserResponse | null = null;
  newMemberRole: CompanyRole = CompanyRole.WORKER;

  memberBusy = false;
  memberError: string | null = null;
  memberSuccess: string | null = null;

  readonly roleOptions = [CompanyRole.WORKER, CompanyRole.HEAD];

  private search$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private companyMemberService: CompanyMemberService,
    private userService: UserService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.id) {
      this.error = 'Invalid company id';
      return;
    }

    this.loadCompany(this.id);

    // Debounced user search for the "add member" field
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          return of([] as UserResponse[]);
        }
        this.searching = true;
        return this.userService.searchUsers(term).pipe(catchError(() => of([] as UserResponse[])));
      })
    ).subscribe(users => {
      this.searching = false;
      this.searchResults = users.slice(0, 8);
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadCompany(id: number) {
    this.loading = true;
    this.error = null;

    this.companyService.getCompanyDetailsByIdAsAdmin(id).subscribe({
      next: (res) => {
        this.company = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load company';
        this.loading = false;
      }
    });
  }

  // -- Members --

  onMemberQueryChange(term: string) {
    this.selectedUser = null;
    this.memberError = null;
    this.memberSuccess = null;
    this.search$.next(term.trim());
  }

  selectUser(user: UserResponse) {
    this.selectedUser = user;
    this.memberQuery = `${user.name} (${user.email})`;
    this.searchResults = [];
  }

  isAlreadyMember(user: UserResponse): boolean {
    return !!this.company?.members?.some(m => m.user.id === user.id);
  }

  addMember() {
    if (!this.selectedUser || !this.id || this.memberBusy) return;

    const user = this.selectedUser;
    const role = this.newMemberRole;
    this.memberBusy = true;
    this.memberError = null;
    this.memberSuccess = null;

    this.companyMemberService.assignMemberToCompany({
      userId: user.id,
      companyId: this.id,
      companyRole: role
    }).subscribe({
      next: () => {
        this.memberBusy = false;
        this.memberSuccess = `${user.name} was added as ${role}.`;
        this.resetMemberForm();
        this.loadCompany(this.id!);
      },
      error: (err: HttpErrorResponse) => {
        this.memberBusy = false;
        this.memberError = this.memberErrorMessage(err, 'add');
      }
    });
  }

  changeRole(member: CompanyMemberResponse, role: CompanyRole) {
    if (!this.id || role === member.companyRole || this.memberBusy) return;

    this.memberBusy = true;
    this.memberError = null;
    this.memberSuccess = null;

    this.companyMemberService.updateRole({
      userId: member.user.id,
      companyId: this.id,
      companyRole: role
    }).subscribe({
      next: () => {
        this.memberBusy = false;
        this.memberSuccess = `${member.user.name} is now ${role}.`;
        this.loadCompany(this.id!);
      },
      error: (err: HttpErrorResponse) => {
        this.memberBusy = false;
        this.memberError = this.memberErrorMessage(err, 'update');
        // reload so the select shows the real role again
        this.loadCompany(this.id!);
      }
    });
  }

  removeMember(member: CompanyMemberResponse) {
    if (!this.id || this.memberBusy) return;
    if (!confirm(`Remove ${member.user.name} from ${this.company?.name}?`)) return;

    this.memberBusy = true;
    this.memberError = null;
    this.memberSuccess = null;

    this.companyMemberService.removeMemberFromCompany(member.user.id, this.id).subscribe({
      next: () => {
        this.memberBusy = false;
        this.memberSuccess = `${member.user.name} was removed.`;
        this.loadCompany(this.id!);
      },
      error: (err: HttpErrorResponse) => {
        this.memberBusy = false;
        this.memberError = this.memberErrorMessage(err, 'remove');
      }
    });
  }

  private resetMemberForm() {
    this.memberQuery = '';
    this.selectedUser = null;
    this.searchResults = [];
    this.newMemberRole = CompanyRole.WORKER;
  }

  private memberErrorMessage(err: HttpErrorResponse, action: 'add' | 'update' | 'remove'): string {
    switch (err.status) {
      case 409: return 'This user already belongs to a company. Remove them from it first.';
      case 404: return 'User, company or membership not found.';
      case 401:
      case 403: return 'You are not allowed to do this. Try signing in again.';
      default: return `Could not ${action} the member. Please try again.`;
    }
  }

  protected readonly CompanyStatus = CompanyStatus;
}
