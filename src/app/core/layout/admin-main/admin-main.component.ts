import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { OverlaysComponent } from '../../ui/overlays.component';
import { NavCountsService } from '../../services/navCounts.service';

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent, OverlaysComponent],
  templateUrl: './admin-main.component.html',
})
export class AdminMainComponent {
  // Sidebar drawer on small screens
  readonly menuOpen = signal(false);

  constructor() {
    const navCounts = inject(NavCountsService);
    navCounts.refresh();

    // Close the mobile drawer and refresh the badges after each navigation
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
      navCounts.refresh();
    });
  }
}
