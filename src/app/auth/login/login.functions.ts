import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { authFunctions } from '../auth.functions';

// Estado del formulario de login
let loginState = {
  form: null as FormGroup | null,
  loading: false,
  submitted: false,
  error: ''
};

// Observable del estado
const loginStateSubject = new BehaviorSubject(loginState);
export const loginState$ = loginStateSubject.asObservable();

// Funciones puras del login
export const loginFunctions = {
  // Inicializar formulario
  initializeForm: (fb: FormBuilder) => {
    loginState.form = fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    loginStateSubject.next({ ...loginState });
  },

  // Obtener estado actual
  getLoginState: () => loginState,

  // Obtener observable del estado
  getLoginState$: () => loginState$,

  // Manejar envío del formulario
  onSubmit: (http: HttpClient, router: Router) => {
    if (!loginState.form || loginState.loading) return;

    loginState.submitted = true;
    loginState.error = '';
    
    if (loginState.form.invalid) {
      loginStateSubject.next({ ...loginState });
      return;
    }

    loginState.loading = true;
    loginStateSubject.next({ ...loginState });

    const credentials = loginState.form.value;
    
    authFunctions.login(http, credentials).subscribe({
      next: (user) => {
        loginState.loading = false;
        loginStateSubject.next({ ...loginState });
        router.navigate(['/usuarios']);
      },
      error: (error) => {
        loginState.loading = false;
        loginState.error = error.error?.message || 'Error al iniciar sesión';
        loginStateSubject.next({ ...loginState });
      }
    });
  },

  // Resetear estado
  resetState: () => {
    loginState = {
      form: loginState.form,
      loading: false,
      submitted: false,
      error: ''
    };
    loginStateSubject.next({ ...loginState });
  },

  // Obtener mensaje de error para un campo
  getErrorMessage: (fieldName: string) => {
    if (!loginState.form) return '';
    
    const field = loginState.form.get(fieldName);
    if (field?.errors && loginState.submitted) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    return '';
  }
};

// Componente funcional
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loginState$ = loginFunctions.getLoginState$();
  state = loginFunctions.getLoginState();

  ngOnInit() {
    loginFunctions.initializeForm(this.fb);
    this.loginState$.subscribe(state => {
      this.state = state;
    });
  }

  onSubmit() {
    loginFunctions.onSubmit(this.http, this.router);
  }

  getErrorMessage(fieldName: string) {
    return loginFunctions.getErrorMessage(fieldName);
  }
}
