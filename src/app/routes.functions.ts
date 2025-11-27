import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { isAuthenticated } from './authentication.service';

// Guard funcional
export const authGuard = () => {
  if (isAuthenticated()) {
    return true;
  }
  return ['/login'];
};

// Rutas configuradas
export const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginComponent,
    title: 'Login'
  },
  // Ruta de ejemplo para usuarios (reemplaza UsersComponent con el componente correcto)
  // { 
  //   path: 'usuarios', 
  //   component: UsersComponent,
  //   canActivate: [authGuard],
  //   title: 'Usuarios'
  // },
  { 
    path: '**', 
    redirectTo: '/login'
  }
];
