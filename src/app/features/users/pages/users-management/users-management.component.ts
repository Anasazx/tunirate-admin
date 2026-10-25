import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';

import { UserService } from '../../services/userService/user.service';
import { AdminUserResponse } from '../../models/userDTO/userResponse.model';
import { AuthService } from '../../../auth/services/authService/auth.service';
import { Page, emptyPage } from '../../../../core/model/page.model';
import { BadgeComponent } from '../../../../core/ui/badge.component';
import { PaginationComponent } from '../../../../core/ui/pagination.component';
import { EmptyStateComponent } from '../../../../core/ui/empty-state.component';
import { SearchInputComponent } from '../../../../core/ui/search-input.component';
import { ToastService } from '../../../../core/ui/toast.service';
import { ConfirmService } from '../../../../core/ui/confirm.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { humanize, initials } from '../../../../core/ui/format';
import { Ban, Crown, ShieldCheck, UserCheck, Users } from '../../../../core/ui/icons';

type UserTab = 'all' | 'admins' | 'suspended';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule, BadgeComponent, PaginationComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './users-management.component.html',
})
export class UsersManagementComponent implements OnInit {
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly me = toSignal(inject(AuthService).currentUser$);

  readonly tabs: { value: UserTab; label: string }[] = [
    { value: 'all', label: 'All users' },
    { value: 'admins', label: 'Admins' },
    { value: 'suspended', label: 'Suspended' },
  ];

  readonly tab = signal<UserTab>('all');
  readonly q = signal('');
  readonly page = signal(0);
  readonly size = 20;

  readonly users = signal<Page<AdminUserResponse>>(emptyPage());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);

  readonly initials = initials;
  readonly humanize = humanize;
  protected readonly icons = { Users, Crown, Ban, UserCheck, ShieldCheck };

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.tab.set((params.get('tab') as UserTab) || 'all');
      this.q.set(params.get('q') ?? '');
      this.page.set(Number(params.get('page') ?? 0));
      this.load();
    });
  }

  isMe(user: AdminUserResponse): boolean {
    return user.id === this.me()?.user?.id;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.userService.getUsersAsAdmin({
      q: this.q(),
      role: this.tab() === 'admins' ? 'ADMIN' : null,
      status: this.tab() === 'suspended' ? 'SUSPENDED' : null,
      page: this.page(),
      size: this.size,
    }).subscribe({
      next: res => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load users.'));
        this.loading.set(false);
      }
    });
  }

  setFilters(changes: Record<string, string | number | null>) {
    const queryParams: Record<string, string | number | null> = { page: null, ...changes };
    for (const key of Object.keys(queryParams)) {
      const value = queryParams[key];
      if (value === '' || (key === 'page' && value === 0) || (key === 'tab' && value === 'all')) queryParams[key] = null;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  async toggleAdmin(user: AdminUserResponse) {
    const promote = user.globalRole !== 'ADMIN';
    const ok = await this.confirm.ask({
      title: promote ? `Make ${user.name} an admin?` : `Remove admin access from ${user.name}?`,
      message: promote
        ? 'Admins can manage every product, company and user on the platform, including other admins.'
        : 'They become a regular user right away and lose access to this panel.',
      confirmLabel: promote ? 'Make admin' : 'Remove access',
      tone: promote ? 'primary' : 'danger',
    });
    if (!ok) return;

    this.busyId.set(user.id);
    this.userService.updateUser(user.id, { globalRole: promote ? 'ADMIN' : 'USER' }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(promote ? `${user.name} is now an admin.` : `${user.name} is no longer an admin.`);
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not change the role.'));
      }
    });
  }

  async toggleSuspended(user: AdminUserResponse) {
    const suspend = user.status !== 'SUSPENDED';
    if (suspend) {
      const ok = await this.confirm.ask({
        title: `Suspend ${user.name}?`,
        message: 'They are signed out everywhere and cannot use their account until you reactivate it. Their reviews stay visible.',
        confirmLabel: 'Suspend', tone: 'danger',
      });
      if (!ok) return;
    }

    this.busyId.set(user.id);
    this.userService.updateStatus(user.id, suspend ? 'SUSPENDED' : 'ACTIVE').subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(suspend ? `${user.name} is suspended.` : `${user.name} is active again.`);
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not change the account status.'));
      }
    });
  }
}
