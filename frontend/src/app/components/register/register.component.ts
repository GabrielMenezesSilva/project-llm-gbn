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
    <div class="register-container">
      <div class="register-box">
        <h1>Inscription</h1>
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
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']"
                >Le mot de passe doit contenir au moins 8 caractères</span
              >
              <span *ngIf="registerForm.get('password')?.errors?.['pattern']"
                >Le mot de passe doit contenir des lettres et des chiffres</span
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

          <button type="submit" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Inscription en cours...' : "S'inscrire" }}
          </button>

          <p class="login-link">
            Déjà un compte?
            <a routerLink="/login">Se connecter</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .register-container {
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

      .login-link {
        text-align: center;
        margin-top: 1rem;
      }

      .login-link a {
        color: #007bff;
        text-decoration: none;
      }

      .login-link a:hover {
        text-decoration: underline;
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
