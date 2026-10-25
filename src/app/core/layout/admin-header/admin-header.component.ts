import { Component, ElementRef, HostListener, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../features/auth/services/authService/auth.service';
import { ChevronDown, LogOut, Menu } from '../../ui/icons';
import { initials } from '../../ui/format';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './admin-header.component.html',
})
export class AdminHeaderComponent {
  menu = output<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private host = inject(ElementRef);

  readonly user = toSignal(this.authService.currentUser$);
  readonly userMenuOpen = signal(false);
  readonly initials = initials;

  protected readonly Menu = Menu;
  protected readonly LogOut = LogOut;
  protected readonly ChevronDown = ChevronDown;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Close the user menu when clicking anywhere else
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target)) {
      this.userMenuOpen.set(false);
    }
  }
}
