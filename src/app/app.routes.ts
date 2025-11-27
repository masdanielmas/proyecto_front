import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TeacherDashboardComponent } from './teacher-dashboard.component';

// Guard para rutas que requieren autenticación
export const authGuard = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/login-estudiante']);
        return false;
      }
    })
  );
};

// Guard para estudiantes
export const studentGuard = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && user.rol === 'estudiante') {
        return true;
      }
      router.navigate(['/login-estudiante']);
      return false;
    })
  );
};

// Guard para profesores/instructores
export const teacherGuard = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && (user.rol === 'instructor' || user.rol === 'profesor')) {
        return true;
      }
      router.navigate(['/login-profesor']);
      return false;
    })
  );
};

// Función para cargar el componente de login de estudiante de manera perezosa
const loadStudentLogin = () => import('./auth/login/login.component').then(m => m.LoginComponent);
// Función para cargar el componente de login de profesor de manera perezosa
const loadTeacherLogin = () => import('./auth/teacher-login/teacher-login.component').then(m => m.TeacherLoginComponent);

// Función para cargar el dashboard de cursos de manera perezosa
const loadCoursesDashboard = () => import('./courses-dashboard.component').then(m => m.CoursesDashboardComponent);
// Función para cargar el detalle de curso de estudiante de manera perezosa
const loadStudentCourseDetail = () => import('./student-course-detail.component').then(m => m.StudentCourseDetailComponent);
// Función para cargar el perfil de estudiante de manera perezosa
const loadStudentProfile = () => import('./student-profile.component').then(m => m.StudentProfileComponent);
// Función para cargar el componente de calendario de manera perezosa
const loadCalendario = () => import('./calendario.component').then(m => m.CalendarioComponent);
// Función para cargar el registro de estudiante de manera perezosa
const loadStudentRegister = () => import('./auth/student-register/student-register.component').then(m => m.StudentRegisterComponent);
// Función para cargar el registro de profesor de manera perezosa
const loadTeacherRegister = () => import('./auth/teacher-register/teacher-register.component').then(m => m.TeacherRegisterComponent);
// Importación directa del dashboard del profesor (evita errores de resolución)

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login-estudiante', 
    pathMatch: 'full' 
  },
  { 
    path: 'login',
    redirectTo: 'login-estudiante',
    pathMatch: 'full'
  },
  { 
    path: 'login-estudiante', 
    loadComponent: loadStudentLogin,
    title: 'Iniciar Sesión Estudiante',
    providers: []
  },
  { 
    path: 'login-profesor', 
    loadComponent: loadTeacherLogin,
    title: 'Iniciar Sesión Profesor',
    providers: []
  },
  {
    path: 'estudiante',
    loadComponent: loadCoursesDashboard,
    title: 'Panel Estudiante',
    canActivate: [() => authGuard(), () => studentGuard()]
  },
  {
    path: 'curso/:id',
    loadComponent: loadStudentCourseDetail,
    title: 'Detalle de Curso',
    canActivate: [() => authGuard(), () => studentGuard()]
  },
  {
    path: 'profesor',
    component: TeacherDashboardComponent,
    title: 'Panel Profesor',
    canActivate: [() => authGuard(), () => teacherGuard()]
  },
  { 
    path: 'cursos', 
    loadComponent: loadCoursesDashboard,
    title: 'Cursos',
    canActivate: [() => authGuard()]
  },
  { 
    path: 'calendario', 
    loadComponent: loadCalendario,
    title: 'Calendario',
    canActivate: [() => authGuard()]
  },
  {
    path: 'perfil-estudiante',
    loadComponent: loadStudentProfile,
    title: 'Perfil de Estudiante',
    canActivate: [() => authGuard(), () => studentGuard()]
  },
  {
    path: 'registro-profesor',
    loadComponent: loadTeacherRegister,
    title: 'Registro de Profesor'
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];