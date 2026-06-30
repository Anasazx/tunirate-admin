import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CompanyService } from '../../services/companyService/company.service';
import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import {CompanyStatus} from '../../enums/companyStatus.enum.model';
import {Country} from '../../../../core/model/enums/country.enum.model';
import {Industry} from '../../../../core/model/enums/industry.enum.model';

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
    websiteUrl: null,
    address: null,
    country: Country.TUNISIA,
    industry: Industry.OTHER,
    status: CompanyStatus.PENDING
  };

  industries = Object.values(Industry);
  countries = Object.values(Country);

  loading = false;
  error: string | null = null;

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {}

  save() {
    this.loading = true;
    this.error = null;

    this.companyService.createCompany(this.form).subscribe({
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
