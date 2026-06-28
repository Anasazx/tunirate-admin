import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CompanyResponse } from '../../../core/model/dto/companyDTO/companyResponse.model';
import { CompanyMemberResponse } from '../../../core/model/dto/companyMemberDTO/CompanyMemberResponse.model';
import { CompanyRole } from '../../../core/model/enums/companyRole.enum.model';
import { CompanyService } from '../../../core/services/companyService/company.service';
import { CompanyMemberService } from '../../../core/services/companyMemberService/company-member.service';
import { UserService } from '../../../core/services/userService/user.service';
import { SharedService } from '../../../core/services/sharedService/shared.service';


@Component({
  selector: 'app-edit-company',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.css'
})
export class EditCompanyComponent implements OnInit {

  form: CompanyResponse = {
    id: 0,
    name: '',
    description: null,
    logoUrl: undefined,
    bannerUrl: undefined,
    verified: false
  };

  companyId: number | null = null;
  isEditMode = false;

  members: CompanyMemberResponse[] = [];
  loadingMembers = false;

  logoFile: File | null = null;
  bannerFile: File | null = null;

  showMemberModal = false;
  searchTerm = '';
  searchResults: any[] = [];

  selectedRole: CompanyRole = CompanyRole.WORKER;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private companyMemberService: CompanyMemberService,
    private userService: UserService,
    private router: Router,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;

      this.companyId = Number(id);
      this.isEditMode = true;

      this.loadCompany(this.companyId);
      this.loadCompanyMembers(this.companyId);
    });
  }

  // ---------------- COMPANY ----------------

  loadCompany(companyId: number) {
    this.companyService.getCompanyById(companyId)
      .subscribe((data: CompanyResponse) => {
        this.form = {
          id: data.id,
          name: data.name,
          description: data.description ?? '',
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          verified: data.verified ?? false
        };
      });
  }

  reloadCompany() {
    if (!this.companyId) return;
    this.loadCompany(this.companyId);
  }

  save() {
    const req = this.isEditMode && this.companyId
      ? this.companyService.updateCompany(this.companyId, this.form)
      : this.companyService.createCompany(this.form);

    req.subscribe((savedCompany: any) => {
      const id = savedCompany?.id ?? this.companyId;

      if (!id) {
        this.router.navigate(['/admin/companies']);
        return;
      }

      const uploads = [];

      if (this.logoFile) {
        uploads.push(this.companyService.uploadLogo(id, this.logoFile));
      }

      if (this.bannerFile) {
        uploads.push(this.companyService.uploadBanner(id, this.bannerFile));
      }

      if (uploads.length === 0) {
        this.router.navigate(['/admin/companies']);
        return;
      }

      forkJoin(uploads).subscribe({
        next: () => this.router.navigate(['/admin/companies']),
        error: () => this.router.navigate(['/admin/companies'])
      });
    });
  }

  cancel() {
    this.router.navigate(['/admin/companies']);
  }

  // ---------------- MEMBERS ----------------

  loadCompanyMembers(companyId: number) {
    this.loadingMembers = true;

    this.companyMemberService.getMembersByCompanyId(companyId)
      .subscribe({
        next: (res) => {
          this.members = res;
          this.loadingMembers = false;
        },
        error: () => {
          this.members = [];
          this.loadingMembers = false;
        }
      });
  }

  openMemberModal() {
    if (!this.companyId) return;

    this.showMemberModal = true;
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedRole = CompanyRole.WORKER;
  }

  closeMemberModal() {
    this.showMemberModal = false;
  }

  onSearch() {
    if (this.searchTerm.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.userService.searchUsers(this.searchTerm)
      .subscribe(res => this.searchResults = res);
  }

  addMember(userId: number) {
    if (!this.companyId) return;

    this.companyMemberService.assignMemberToCompany({
      userId,
      companyId: this.companyId
    }).subscribe(() => {
      this.loadCompanyMembers(this.companyId!);
      this.closeMemberModal();
    });
  }

  removeMember(userId: number) {
    if (!this.companyId) return;

    this.companyMemberService.removeMemberFromCompany(userId, this.companyId)
      .subscribe(() => this.loadCompanyMembers(this.companyId!));
  }

  updateMemberRole(member: CompanyMemberResponse, role: CompanyRole) {
    if (!this.companyId) return;

    this.companyMemberService.updateRole({
      userId: member.user.id,
      companyId: this.companyId,
      companyRole: role
    }).subscribe({
      next: (updated) => {
        member.companyRole = updated.companyRole;
      },
      error: () => this.loadCompanyMembers(this.companyId!)
    });
  }

  // ---------------- IMAGES ----------------

  onLogoSelected(event: any) {
    this.logoFile = event.target.files?.[0] ?? null;
  }

  onBannerSelected(event: any) {
    this.bannerFile = event.target.files?.[0] ?? null;
  }

  deleteLogo() {
    if (!this.companyId) return;

    this.companyService.deleteLogo(this.companyId)
      .subscribe(() => this.reloadCompany());
  }

  deleteBanner() {
    if (!this.companyId) return;

    this.companyService.deleteBanner(this.companyId)
      .subscribe(() => this.reloadCompany());
  }
}