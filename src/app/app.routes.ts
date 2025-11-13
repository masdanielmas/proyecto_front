import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { LoginComponent } from './auth/login/login.component';
import { inject } from '@angular/core';
import { AuthenticationService } from './auth/authentication.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Guard para rutas que requieren autenticación
export const authGuard = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  return authService.currentUser.pipe(
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'usuarios', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent,
    title: 'Iniciar Sesión'
  },
  { 
    path: 'usuarios', 
    component: UsersComponent,
    title: 'Gestión de Usuarios',
    canActivate: [() => authGuard()]
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];