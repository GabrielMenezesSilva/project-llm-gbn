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
  selector: 'app-register',
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
          <h1>Inscription</h1>
          <p class="subtitle">Créez votre compte pour commencer</p>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">Nom</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                placeholder="Entrez votre nom"
              />
              <div
                class="error-message"
                *ngIf="
                  registerForm.get('name')?.invalid &&
                  registerForm.get('name')?.touched
                "
              >
                <span *ngIf="registerForm.get('name')?.errors?.['required']"
                  >Le nom est requis</span
                >
                <span *ngIf="registerForm.get('name')?.errors?.['minlength']"
                  >Le nom doit contenir au moins 3 caractères</span
                >
              </div>
            </div>

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
                  registerForm.get('email')?.invalid &&
                  registerForm.get('email')?.touched
                "
              >
                <span *ngIf="registerForm.get('email')?.errors?.['required']"
                  >L'email est requis</span
                >
                <span *ngIf="registerForm.get('email')?.errors?.['email']"
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
                  registerForm.get('password')?.invalid &&
                  registerForm.get('password')?.touched
                "
              >
                <span *ngIf="registerForm.get('password')?.errors?.['required']"
                  >Le mot de passe est requis</span
                >
                <span
                  *ngIf="registerForm.get('password')?.errors?.['minlength']"
                  >Le mot de passe doit contenir au moins 8 caractères</span
                >
                <span *ngIf="registerForm.get('password')?.errors?.['pattern']"
                  >Le mot de passe doit contenir des lettres et des
                  chiffres</span
                >
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="Confirmez votre mot de passe"
              />
              <div
                class="error-message"
                *ngIf="
                  registerForm.get('confirmPassword')?.invalid &&
                  registerForm.get('confirmPassword')?.touched
                "
              >
                <span
                  *ngIf="registerForm.get('confirmPassword')?.errors?.['required']"
                  >La confirmation du mot de passe est requise</span
                >
                <span
                  *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']"
                  >Les mots de passe ne correspondent pas</span
                >
              </div>
            </div>

            <div class="error-message" *ngIf="error">
              {{ error }}
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
            >
              {{ isLoading ? 'Inscription en cours...' : "S'inscrire" }}
            </button>

            <p class="register-link">
              Déjà un compte?
              <a routerLink="/login">Se connecter</a>
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
        padding: 1.5rem;
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
      }

      .subtitle {
        color: #64748b;
        margin: 0.5rem 0 1.5rem;
      }

      .form-group {
        margin-bottom: 0.75rem;
      }

      label {
        display: block;
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
      }

      input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        font-size: 0.95rem;
        color: #1a1a1a;
        transition: all 0.2s;
      }

      input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
      }

      input::placeholder {
        color: #94a3b8;
      }

      .error-message {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }

      button {
        width: 100%;
        padding: 0.625rem;
        background: linear-gradient(to right, #4a90e2, #357abd);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 0.5rem;
      }

      button:hover {
        background: linear-gradient(to right, #357abd, #2d6ba7);
      }

      button:disabled {
        background: #e2e8f0;
        cursor: not-allowed;
      }

      .register-link {
        text-align: center;
        margin-top: 0.75rem;
        color: #64748b;
      }

      .register-link a {
        color: #4a90e2;
        text-decoration: none;
        font-weight: 500;
        margin-left: 0.25rem;
      }

      .register-link a:hover {
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .split-container {
          flex-direction: column;
        }

        .image-section {
          min-height: 30vh;
        }

        .login-section {
          padding: 1.5rem;
        }

        .login-box {
          padding: 1.5rem;
        }
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';

      const { name, email, password, confirmPassword } =
        this.registerForm.value;

      this.authService
        .register(email, password, name, confirmPassword)
        .subscribe({
          next: () => {
            this.router.navigate(['/chat']);
          },
          error: (error) => {
            this.isLoading = false;
            this.error = error.error.error || 'Erro ao registrar';
          },
        });
    }
  }
}
