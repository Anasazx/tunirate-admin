import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { CompanyService } from '../../services/companyService/company.service';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import {CompanyStatus} from '../../enums/companyStatus.enum.model';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css'
})
export class CompanyDetailsComponent implements OnInit {

  company: CompanyResponse | null = null;
  loading = false;
  error: string | null = null;
  id: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.id) {
      this.error = 'Invalid company id';
      return;
    }

    this.loadCompany(this.id);
  }

  loadCompany(id: number) {
    this.loading = true;
    this.error = null;

    this.companyService.getCompanyDetailsByIdAsAdmin(id).subscribe({
      next: (res) => {
        this.company = res;
        console.log("this is the result : ", res);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load company';
        this.loading = false;
      }
    });
  }

  protected readonly CompanyStatus = CompanyStatus;
}
