import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompanyResponse } from '../../models/companyDTO/companyResponse.model';
import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyService } from '../../services/companyService/company.service';


@Component({
  selector: 'app-company-management',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './company-management.component.html',
  styleUrl: './company-management.component.css'
})
export class CompanyManagementComponent implements OnInit {

  companies: CompanyResponse[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';
  filteredCompanies: CompanyResponse[] = [];


  constructor(private companyService: CompanyService) {}


  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;

    this.companyService.getAllCompaniesAsAdmin().subscribe({
      next: (res) => {
        this.companies = res;
        this.filteredCompanies = res; // IMPORTANT FIX
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load companies';
        this.loading = false;
      }
    });
  }

  // DELETE
  delete(id: number) {
    if (!confirm('Delete this company?')) return;

    this.companyService.deleteCompany(id).subscribe({
      next: () => this.loadCompanies(),
      error: (err) => {
        console.error(err);
        this.error = 'Failed to delete company';
      }
    });
  }

  filterCompanies(): void {

    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredCompanies = this.companies;
      return;
    }

    this.filteredCompanies = this.companies.filter(c =>
      c.name.toLowerCase().includes(term)
    );

  }


}
