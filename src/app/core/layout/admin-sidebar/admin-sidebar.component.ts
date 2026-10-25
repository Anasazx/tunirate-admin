import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { NavCountsService } from '../../services/navCounts.service';
import { Building2, LayoutDashboard, Lightbulb, Package, Tags, Users, X } from '../../ui/icons';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIconData;
  exact?: boolean;
  badge?: () => number;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent {
  open = input(false);
  close = output<void>();

  private counts = inject(NavCountsService);
  protected readonly X = X;

  readonly sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Overview',
      items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true }],
    },
    {
      title: 'Catalog',
      items: [
        { label: 'Products', path: '/products', icon: Package, badge: () => this.counts.pendingProducts() },
        { label: 'Companies', path: '/companies', icon: Building2, badge: () => this.counts.pendingCompanies() },
        { label: 'Categories', path: '/categories', icon: Tags },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Users', path: '/users', icon: Users },
        { label: 'Suggestions', path: '/suggestions', icon: Lightbulb, badge: () => this.counts.pendingSuggestions() },
      ],
    },
  ];
}
