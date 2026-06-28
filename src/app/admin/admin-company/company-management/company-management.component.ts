import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompanyResponse } from '../../../core/model/dto/companyDTO/companyResponse.model';
import { CompanyRequest } from '../../../core/model/dto/companyDTO/companyRequest.model';
import { CompanyService } from '../../../core/services/companyService/company.service';


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


  showModal = false;
  editId: number | null = null;

  form: CompanyRequest = {
    name: '',
    description: null,
    verified: false
  };

  constructor(private companyService: CompanyService) {}

ngOnInit(): void {

  this.load();

}

load() {
  this.loading = true;

  this.companyService.getAllCompanies().subscribe({
    next: (res) => {
      this.companies = res;
      this.filteredCompanies = res; // ✅ IMPORTANT FIX
      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.error = 'Failed to load companies';
      this.loading = false;
    }
  });
}
  // OPEN CREATE
  openCreateModal() {
    this.editId = null;
    this.form = { name: '', description: null, verified: false };
    this.showModal = true;
  }

  // OPEN EDIT
  openEdit(c: CompanyResponse) {
    this.editId = c.id;
    this.form = {
      name: c.name,
      description: c.description ?? null,
      verified: c.verified ?? false
    };
    this.showModal = true;
  }

  // CLOSE MODAL
  closeModal() {
    this.showModal = false;
    this.editId = null;
    this.form = {
      name: '',
      description: null,
      verified: false
    };
  }

  // SAVE
  save() {
    this.error = null;

    if (!this.form.name?.trim()) {
      this.error = 'Name is required';
      return;
    }

    const request$ = this.editId
      ? this.companyService.updateCompany(this.editId, this.form)
      : this.companyService.createCompany(this.form);

    request$.subscribe({
      next: () => {
        this.load();
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        this.error = this.editId
          ? 'Failed to update company'
          : 'Failed to create company';
      }
    });
  }

  // DELETE
  delete(id: number) {
    if (!confirm('Delete this company?')) return;

    this.companyService.deleteCompany(id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error(err);
        this.error = 'Failed to delete company';
      }
    });
  }

  searchTerm: string = '';

  filteredCompanies: any[] = [];



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