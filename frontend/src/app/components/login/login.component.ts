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
    <div class="split-container">
      <div class="image-section">
        <div class="overlay"></div>
        <div class="logo-area">
          <div class="welcome-text">
            <h2>BIENVENUE SUR</h2>
            <h2 class="chatbot-text">CHATBOT GBN</h2>
            <p>Votre assistant virtuel intelligent</p>
          </div>
        </div>
      </div>
      <div class="login-section">
        <div class="login-box">
          <h1>Connexion</h1>
          <p class="subtitle">Connectez-vous pour continuer</p>
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
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #1a1a1a;
        font-size: 16px;
        line-height: 1.5;
      }

      .split-container {
        display: flex;
        min-height: 100vh;
      }

      .image-section {
        flex: 1;
        background: url('/assets/images/gbnews_wallpaper.png') center/cover
          no-repeat;
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      }

      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.65) 0%,
          rgba(0, 0, 0, 0.55) 100%
        );
      }

      .logo-area {
        position: relative;
        z-index: 2;
        text-align: center;
        padding: 2rem;
        margin-top: 5vh;
      }

      .welcome-text {
        max-width: 600px;
      }

      .welcome-text h2 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        line-height: 1.2;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .chatbot-text {
        font-size: 3rem !important;
        font-weight: 800 !important;
        background: linear-gradient(to right, #ffffff, #4a90e2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem !important;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .welcome-text p {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.9);
        margin: 1rem 0 0 0;
      }

      .login-section {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: #f8fafc;
      }

      .login-box {
        width: 100%;
        max-width: 400px;
        background: white;
        padding: 2.5rem;
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      h1 {
        margin: 0;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        color: #1a1a1a;
        text-align: center;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        text-align: center;
        color: #4a5568;
        margin-bottom: 2rem;
        font-size: 1rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #4a5568;
        font-weight: 500;
        font-size: 0.9375rem;
      }

      input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid rgba(228, 231, 235, 0.8);
        border-radius: 12px;
        font-size: 0.9375rem;
        transition: all 0.2s ease;
        background: white;
        color: #2d3748;
        line-height: 1.6;
        letter-spacing: -0.011em;
      }

      input::placeholder {
        color: #a0aec0;
        font-weight: 400;
      }

      input:focus {
        outline: none;
        border-color: #0061f2;
        box-shadow: 0 0 0 3px rgba(0, 97, 242, 0.1);
      }

      .error-message {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }

      button {
        width: 100%;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #0061f2 0%, #0044bb 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        letter-spacing: -0.011em;
        box-shadow: 0 2px 4px rgba(0, 97, 242, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        margin-top: 1rem;
      }

      button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 97, 242, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      button:disabled {
        background: #e4e7eb;
        cursor: not-allowed;
        transform: none;
        color: #a0aec0;
        box-shadow: none;
      }

      .register-link {
        text-align: center;
        margin-top: 1.5rem;
        color: #4a5568;
        font-size: 0.9375rem;
      }

      .register-link a {
        color: #0061f2;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }

      .register-link a:hover {
        color: #0044bb;
        text-decoration: underline;
      }

      @media (max-width: 1024px) {
        .split-container {
          flex-direction: column;
        }

        .image-section {
          height: 400px;
        }

        .logo-area {
          margin-top: 0;
          padding: 1rem;
        }

        .welcome-text h2 {
          font-size: 2rem;
        }

        .chatbot-text {
          font-size: 2.5rem !important;
        }

        .welcome-text p {
          font-size: 1.125rem;
        }

        .login-section {
          padding: 2rem 1rem;
        }
      }

      @media (max-width: 640px) {
        .image-section {
          height: 300px;
        }

        .welcome-text h2 {
          font-size: 1.75rem;
        }

        .chatbot-text {
          font-size: 2rem !important;
        }

        .welcome-text p {
          font-size: 1rem;
        }

        .login-box {
          padding: 2rem;
        }
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
          this.error = error.error.error || 'Erreur lors de la connexion';
        },
      });
    }
  }
}
