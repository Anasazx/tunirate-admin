import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyService } from '../../services/companyService/company.service';
import { CompanyRequest } from '../../models/companyDTO/companyRequest.model';
import { CompanyStatus } from '../../enums/companyStatus.enum.model';
import { SocialPlatform } from '../../enums/SocialPlatform.enum.model';
import { Country } from '../../../../core/model/enums/country.enum.model';
import { Industry } from '../../../../core/model/enums/industry.enum.model';
import { SOCIAL_ICON_MAP } from '../../../../core/mapping/social-icon-map';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { ToastService } from '../../../../core/ui/toast.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { humanize } from '../../../../core/ui/format';
import { ArrowLeft, ImagePlus, LoaderCircle, Plus, Trash2 } from '../../../../core/ui/icons';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

// Create and edit a company: /companies/new and /companies/:id/edit
@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './company-form.component.html',
})
export class CompanyFormComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private toast = inject(ToastService);
  public sharedService = inject(SharedService);

  readonly companyId = signal<number | null>(null);
  readonly isEdit = computed(() => this.companyId() !== null);

  form: CompanyRequest = {
    name: '',
    description: '',
    phoneNumber: null,
    address: null,
    country: Country.TUNISIA,
    industry: Industry.OTHER,
    socialLinks: [],
    status: CompanyStatus.ACTIVE,
  };

  // Current images (edit) and newly picked files with their previews
  readonly currentLogo = signal<string | null>(null);
  readonly currentBanner = signal<string | null>(null);
  logoFile?: File;
  bannerFile?: File;
  readonly logoPreview = signal<string | null>(null);
  readonly bannerPreview = signal<string | null>(null);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  readonly countries = Object.values(Country);
  readonly industries = Object.values(Industry);
  readonly platforms = Object.values(SocialPlatform);
  readonly statuses = Object.values(CompanyStatus);
  readonly socialIcons = SOCIAL_ICON_MAP;
  readonly humanize = humanize;

  protected readonly icons = { ArrowLeft, ImagePlus, LoaderCircle, Plus, Trash2 };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.companyId.set(Number(id));
      this.load();
    }
  }

  ngOnDestroy(): void {
    [this.logoPreview(), this.bannerPreview()].forEach(url => url && URL.revokeObjectURL(url));
  }

  private load() {
    this.loading.set(true);
    this.companyService.getCompanyDetailsByIdAsAdmin(this.companyId()!).subscribe({
      next: c => {
        this.form = {
          name: c.name,
          description: c.description ?? '',
          phoneNumber: c.phoneNumber,
          address: c.address,
          country: c.country,
          industry: c.industry,
          socialLinks: (c.socialLinks ?? []).map(l => ({ platform: l.platform, url: l.url })),
          status: c.status,
        };
        this.currentLogo.set(c.logoUrl ?? null);
        this.currentBanner.set(c.bannerUrl ?? null);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load this company.'));
        this.loading.set(false);
      }
    });
  }

  onImageSelected(event: Event, kind: 'logo' | 'banner') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      this.toast.error('Only JPEG, PNG, WEBP, GIF or AVIF images are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Images must be smaller than 10 MB.');
      return;
    }
    const preview = URL.createObjectURL(file);
    if (kind === 'logo') {
      if (this.logoPreview()) URL.revokeObjectURL(this.logoPreview()!);
      this.logoFile = file;
      this.logoPreview.set(preview);
    } else {
      if (this.bannerPreview()) URL.revokeObjectURL(this.bannerPreview()!);
      this.bannerFile = file;
      this.bannerPreview.set(preview);
    }
  }

  addSocialLink() {
    const used = new Set(this.form.socialLinks.map(l => l.platform));
    const next = this.platforms.find(p => !used.has(p)) ?? SocialPlatform.WEBSITE;
    this.form.socialLinks.push({ platform: next, url: '' });
  }

  removeSocialLink(index: number) {
    this.form.socialLinks.splice(index, 1);
  }

  save() {
    this.submitted.set(true);
    this.error.set(null);

    const badLink = this.form.socialLinks.find(l => !/^https?:\/\/\S+\.\S+/.test(l.url.trim()));
    if (!this.form.name.trim() || badLink) {
      this.error.set(badLink ? 'Every link must be a full address starting with http:// or https://' : 'Fill in the required fields.');
      return;
    }

    const payload: CompanyRequest = {
      ...this.form,
      name: this.form.name.trim(),
      description: this.form.description?.trim() || null,
      phoneNumber: this.form.phoneNumber?.trim() || null,
      address: this.form.address?.trim() || null,
      socialLinks: this.form.socialLinks.map(l => ({ platform: l.platform, url: l.url.trim() })),
    };
    const request$ = this.isEdit()
      ? this.companyService.updateCompany(this.companyId()!, payload, this.logoFile, this.bannerFile)
      : this.companyService.createCompany(payload, this.logoFile, this.bannerFile);

    this.saving.set(true);
    request$.subscribe({
      next: res => {
        this.saving.set(false);
        this.toast.success(this.isEdit() ? 'Company saved.' : 'Company created.');
        this.router.navigate(['/companies', this.companyId() ?? res.id]);
      },
      error: err => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err, 'Could not save the company.'));
      }
    });
  }

  cancel() {
    this.router.navigate(this.isEdit() ? ['/companies', this.companyId()] : ['/companies']);
  }
}
