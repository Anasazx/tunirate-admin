import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/authService/auth.service';
import { apiErrorMessage } from '../../../../core/ui/api-error';
import { LoaderCircle } from '../../../../core/ui/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly LoaderCircle = LoaderCircle;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error.set(null);
    if (!this.email || !this.password) {
      this.error.set('Email and password are required.');
      return;
    }

    this.loading.set(true);
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        if (!this.auth.isAdmin()) {
          this.auth.logout();
          this.error.set('This account does not have admin access.');
          return;
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.status === 401 ? 'Wrong email or password.' : apiErrorMessage(err, 'Login failed.'));
      }
    });
  }
}
