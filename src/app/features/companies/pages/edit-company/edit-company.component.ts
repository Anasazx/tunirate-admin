import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { CompanyService } from '../../services/companyService/company.service';

import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';

import { Country } from '../../../../core/model/enums/country.enum.model';
import { Industry } from '../../../../core/model/enums/industry.enum.model';
import { SocialPlatform } from '../../enums/SocialPlatform.enum.model';


@Component({
  selector: 'app-edit-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.css'
})
export class EditCompanyComponent implements OnInit {

  companyId!: number;

  company!: CompanyResponse;

  countries = Object.values(Country);
  industries = Object.values(Industry);
  socialPlatforms = Object.values(SocialPlatform);

  form: CompanyRequest = {

    name: '',
    description: '',
    phoneNumber: null,
    address: null,

    country: Country.TUNISIA,
    industry: Industry.OTHER,

    socialLinks: [],

    status: null
  };

  selectedLogo?: File;
  selectedBanner?: File;

  loading = false;

  message: string | null = null;
  isError = false;

  constructor(
    public sharedService: SharedService,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.companyId =
      Number(this.route.snapshot.paramMap.get('id'));
    this.loadCompany();
  }

  loadCompany() {
    this.companyService
      .getCompanyDetailsByIdAsAdmin(this.companyId)
      .subscribe({
        next: company => {
          this.company = company;
          this.form = {
            name: company.name,
            description: company.description,
            phoneNumber: company.phoneNumber,
            address: company.address,
            country: company.country,
            industry: company.industry,
            socialLinks:
              (company.socialLinks ?? [])
                .map(link => ({
                  platform: link.platform,
                  url: link.url
                })),
            status: company.status
          };
        },
        error: err => {
          console.error(err);
          this.showMessage(
            "Failed to load company",
            true
          );
        }
      });
  }

  save() {
    if (this.loading) return;
    this.loading = true;
    this.companyService
      .updateCompany(
        this.companyId,
        this.form,
        this.selectedLogo,
        this.selectedBanner
      )
      .subscribe({
        next: updated => {
          this.company = updated;
          this.selectedLogo = undefined;
          this.selectedBanner = undefined;
          this.loading = false;
          this.showMessage("Company updated successfully", false);
        },
        error: err => {
          console.error(err);
          this.loading = false;
          this.showMessage("Something went wrong", true);
        }
      });
  }

  onLogoSelected(event: Event) {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (file) {
      this.selectedLogo = file;
    }
  }

  onBannerSelected(event: Event) {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (file) {
      this.selectedBanner = file;
    }
  }

  addSocialLink() {
    this.form.socialLinks.push({
      platform: SocialPlatform.WEBSITE,
      url: ''
    });
  }

  removeSocialLink(index: number) {
    this.form.socialLinks.splice(index,1);
  }

  cancel() {
    this.router.navigate(['/admin/companies']);
  }

  private showMessage(text: string, error: boolean) {
    this.message = text;
    this.isError = error;

    setTimeout(() => {
      this.message = null;
    },2500);
  }

}
