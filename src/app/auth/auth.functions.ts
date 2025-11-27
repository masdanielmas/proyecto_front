import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// Estado de autenticación
let currentUserSubject = new BehaviorSubject<any>(null);
let currentUser: Observable<any> = currentUserSubject.asObservable();

// Funciones puras de autenticación
export const authFunctions = {
  // Inicializar estado de autenticación
  initializeAuth: () => {
    const storedUser = localStorage.getItem('currentUser');
    currentUserSubject = new BehaviorSubject<any>(
      storedUser ? JSON.parse(storedUser) : null
    );
    currentUser = currentUserSubject.asObservable();
  },

  // Obtener usuario actual
  getCurrentUserValue: () => currentUserSubject.value,

  // Obtener observable del usuario actual
  getCurrentUser: () => currentUser,

  // Login
  login: (http: HttpClient, credentials: { username: string; password: string }): Observable<any> => {
    const apiUrl = 'http://localhost:3000/api/login';
    
    return http.post(apiUrl, credentials).pipe(
      map((response: any) => {
        const userData = response.user || response;
        const token = response.token || userData?.token;
        
        if (userData && token) {
          const user = { ...userData, token };
          localStorage.setItem('currentUser', JSON.stringify(user));
          currentUserSubject.next(user);
          return user;
        }
        throw new Error('Respuesta de autenticación inválida');
      }),
      catchError(error => {
        console.error('Error en el login:', error);
        throw error;
      })
    );
  },

  // Logout
  logout: (router: Router) => {
    localStorage.removeItem('currentUser');
    currentUserSubject.next(null);
    router.navigate(['/login']);
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    const user = currentUserSubject.value;
    return !!user && !!user.token;
  },

  // Registro
  register: (http: HttpClient, userData: any): Observable<any> => {
    const apiUrl = 'http://localhost:3000/api/register';
    return http.post(apiUrl, userData);
  },

  // Obtener perfil
  getProfile: (http: HttpClient, token: string): Observable<any> => {
    const apiUrl = 'http://localhost:3000/api/profile';
    return http.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// Inicializar el módulo
@Injectable({
  providedIn: 'root'
})
export class AuthModule {
  constructor() {
    authFunctions.initializeAuth();
  }
}
