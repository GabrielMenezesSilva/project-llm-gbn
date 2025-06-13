import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1>Connexion</h1>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Entrez votre email"
            />
            <div
              class="error-message"
              *ngIf="
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
              "
            >
              <span *ngIf="loginForm.get('email')?.errors?.['required']"
                >L'email est requis</span
              >
              <span *ngIf="loginForm.get('email')?.errors?.['email']"
                >Format d'email invalide</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Entrez votre mot de passe"
            />
            <div
              class="error-message"
              *ngIf="
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
            >
              <span *ngIf="loginForm.get('password')?.errors?.['required']"
                >Le mot de passe est requis</span
              >
            </div>
          </div>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>

          <p class="register-link">
            Pas encore de compte?
            <a routerLink="/register">S'inscrire</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h2 {
        text-align: center;
        margin-bottom: 2rem;
        color: #333;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      input:focus {
        outline: none;
        border-color: #007bff;
      }

      button {
        width: 100%;
        padding: 0.75rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      button:hover {
        background-color: #0056b3;
      }

      button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .register-link {
        text-align: center;
        margin-top: 1rem;
      }

      .register-link a {
        color: #007bff;
        text-decoration: none;
      }

      .register-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/chat']);
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error.error || 'Erro ao fazer login';
        },
      });
    }
  }
}
