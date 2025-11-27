import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { first, finalize } from 'rxjs/operators';
import { AuthenticationService } from '../../authentication.service';

interface TeacherLoginFormControls {
  usuario: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-teacher-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-gray-900">
        <div>
          <div class="flex justify-center">
            <img src="/logo.png" alt="Skill Class logo" class="mx-auto h-16 w-auto" />
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-indigo-100">
            Panel de profesores
          </h2>
          <p class="mt-2 text-center text-sm text-gray-400">
            Inicia sesión con tu cuenta de profesor
          </p>
        </div>

        <div class="mt-8 space-y-6 bg-gray-800/80 p-6 rounded-xl shadow-xl border border-gray-700">
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-6">
            <div>
              <label for="usuario" class="block text-sm font-medium text-gray-200 mb-1">Usuario</label>
              <input
                id="usuario"
                type="text"
                formControlName="usuario"
                [class.border-red-500]="submitted && loginForm.controls.usuario.errors"
                class="block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tu usuario de profesor"
              />
              <div *ngIf="submitted && loginForm.controls.usuario.errors" class="text-red-400 text-xs mt-1">
                <div *ngIf="loginForm.controls.usuario.errors['required']">El usuario es requerido</div>
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-200 mb-1">Contraseña</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                [class.border-red-500]="submitted && loginForm.controls.password.errors"
                class="block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
              <div *ngIf="submitted && loginForm.controls.password.errors" class="text-red-400 text-xs mt-1">
                <div *ngIf="loginForm.controls.password.errors['required']">La contraseña es requerida</div>
              </div>
            </div>

            <div *ngIf="error" class="text-red-400 text-sm">
              {{ error }}
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-offset-gray-900"
              >
                <span *ngIf="!loading">Iniciar sesión como profesor</span>
                <span *ngIf="loading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              </button>
            </div>
          </form>

          <div class="text-center text-xs text-gray-400">
            <p>
              ¿Eres estudiante?
              <a [routerLink]="['/login-estudiante']" class="font-medium text-indigo-300 hover:text-indigo-200">
                Ir al login de estudiante
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TeacherLoginComponent {
  public loading = false;
  public submitted = false;
  public error: string = '';

  public loginForm: FormGroup<TeacherLoginFormControls>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthenticationService);

  constructor() {
    this.loginForm = this.fb.group<TeacherLoginFormControls>({
      usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });
  }

  public onLogin(): void {
    this.submitted = true;
    this.error = '';
    this.loginForm.markAllAsTouched();
    this.loginForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    let { usuario, password } = this.loginForm.getRawValue();
    usuario = (usuario || '').trim();
    password = (password || '').trim();
    this.loginForm.patchValue({ usuario, password });

    if (!usuario || !password) {
      this.error = 'Por favor ingresa usuario y contraseña';
      this.loading = false;
      return;
    }

    this.authService
      .login({ usuario, password })
      .pipe(first(), finalize(() => (this.loading = false)))
      .subscribe({
        next: (user: any) => {
          this.navigateByRoleFrom(user);
        },
        error: (err: any) => {
          this.error =
            err?.error?.message ||
            err?.error?.error ||
            'Error al iniciar sesión. Por favor, verifica tus credenciales e inténtalo de nuevo.';
        },
      });
  }

  private navigateByRoleFrom(user: any): void {
    const role = user?.rol;
    if (role === 'instructor' || role === 'profesor') {
      this.router.navigate(['/profesor']);
    } else {
      this.router.navigate(['/estudiante']);
    }
  }
}
