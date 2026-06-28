
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/authService/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(username: string, email: string, password: string, confirm: string, event: Event) {
    event.preventDefault();
    this.error = null;
    if (!username || !email || !password) {
      this.error = 'All fields are required.';
      return;
    }
    if (password !== confirm) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.auth.register({ name: username, email, password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Registration failed';
      }
    });
  }
}
