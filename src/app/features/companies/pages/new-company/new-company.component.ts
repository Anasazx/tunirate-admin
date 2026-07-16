import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CompanyService } from '../../services/companyService/company.service';
import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyStatus } from '../../enums/companyStatus.enum.model';
import { Country } from '../../../../core/model/enums/country.enum.model';
import { Industry } from '../../../../core/model/enums/industry.enum.model';

@Component({
  selector: 'app-new-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-company.component.html',
  styleUrl: './new-company.component.css'
})
export class NewCompanyComponent {

  form: CompanyRequest = {
    name: '',
    description: '',
    phoneNumber: null,
    address: null,
    country: Country.TUNISIA,
    industry: Industry.OTHER,
    socialLinks: [],
    status: CompanyStatus.PENDING
  };

  industries = Object.values(Industry);
  countries = Object.values(Country);

  logo?: File;
  banner?: File;

  loading = false;
  error: string | null = null;


  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {}


  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.logo = input.files[0];
    }
  }


  onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.banner = input.files[0];
    }
  }


  save() {

    this.loading = true;
    this.error = null;


    this.companyService
      .createCompany(
        this.form,
        this.logo,
        this.banner
      )
      .subscribe({

        next: (res) => {
          this.loading = false;
          this.router.navigate(['/admin/companies', res.id]);
        },

        error: (err) => {
          this.loading = false;
          this.error = 'Failed to create company';
          console.error(err);
        }

      });
  }


  cancel() {
    this.router.navigate(['/admin/companies']);
  }


  protected readonly CompanyStatus = CompanyStatus;

}
