import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { CompanyService } from '../../services/companyService/company.service';

import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';
import {Country} from '../../../../core/model/enums/country.enum.model';
import {Industry} from '../../../../core/model/enums/industry.enum.model';

@Component({
  selector: 'app-edit-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.css'
})
export class EditCompanyComponent implements OnInit {

  companyId!: number;

  company!: CompanyResponse;

  countries = Object.values(Country);
  industries = Object.values(Industry);

  form: CompanyRequest = {
    name: '',
    description: '',
    phoneNumber: '',
    websiteUrl: '',
    address: '',
    country: Country.TUNISIA,
    industry: Industry.OTHER,
    status: null
  };

  constructor(
    public sharedService: SharedService,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCompany();
  }

  loadCompany() {
    this.companyService
      .getCompanyDetailsByIdAsAdmin(this.companyId)
      .subscribe(company => {

        this.company = company;

        this.form = {
          name: company.name,
          description: company.description,
          phoneNumber: company.phoneNumber,
          websiteUrl: company.websiteUrl,
          address: company.address,
          country: company.country,
          industry: company.industry,
          status: company.status
        };

      });
  }

  message: string | null = null;

  isError: boolean = false;

  save() {
    this.companyService
      .updateCompany(this.companyId, this.form)
      .subscribe(updated => {

        this.company = updated;

        this.loadCompany();
      });



    this.companyService.updateCompany(this.companyId, this.form).subscribe({
      next: () => {
        this.message = 'Company updated successfully';
        this.isError = false;
        setTimeout(() => this.message = null, 2500);
      },

      error: () => {
        this.message = 'Something went wrong, please try again';
        this.isError = true;
        setTimeout(() => this.message = null, 2500);
      }

    });
  }

  cancel() {
    this.router.navigate(['/admin/companies']);
  }

  onLogoSelected(event: any) {

    const file = event.target.files?.[0];

    if (!file) return;

    this.companyService
      .uploadLogo(this.companyId, file)
      .subscribe(() => this.loadCompany());
  }

  onBannerSelected(event: any) {

    const file = event.target.files?.[0];

    if (!file) return;

    this.companyService
      .uploadBanner(this.companyId, file)
      .subscribe(() => this.loadCompany());
  }

  deleteLogo() {
    this.companyService
      .deleteLogo(this.companyId)
      .subscribe(() => this.loadCompany());
  }

  deleteBanner() {
    this.companyService
      .deleteBanner(this.companyId)
      .subscribe(() => this.loadCompany());
  }
}
