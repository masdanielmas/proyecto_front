import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Configuración de la API
const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api'
};

// Funciones puras para manejo de usuarios
export const usersFunctions = {
  // Obtener todos los usuarios
  getUsers: (http: HttpClient): Observable<any[]> => {
    return http.get<any[]>(`${API_CONFIG.baseUrl}/users`).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return of([]);
      })
    );
  },

  // Eliminar un usuario
  eliminarUsuario: (http: HttpClient, id: number): Observable<any> => {
    return http.delete(`${API_CONFIG.baseUrl}/users/${id}`).pipe(
      catchError(error => {
        console.error('Error al eliminar usuario:', error);
        throw error;
      })
    );
  },

  // Actualizar un usuario
  actualizarUsuario: (http: HttpClient, id: string | number, userData: any): Observable<any> => {
    return http.put(`${API_CONFIG.baseUrl}/users/${id}`, userData).pipe(
      catchError(error => {
        console.error('Error al actualizar usuario:', error);
        throw error;
      })
    );
  },

  // Crear un nuevo usuario
  crearUsuario: (http: HttpClient, userData: any): Observable<any> => {
    return http.post(`${API_CONFIG.baseUrl}/users`, userData).pipe(
      catchError(error => {
        console.error('Error al crear usuario:', error);
        throw error;
      })
    );
  },

  // Obtener un usuario por ID
  getUsuarioPorId: (http: HttpClient, id: string | number): Observable<any> => {
    return http.get(`${API_CONFIG.baseUrl}/users/${id}`).pipe(
      catchError(error => {
        console.error('Error al obtener usuario:', error);
        throw error;
      })
    );
  },

  // Buscar usuarios
  buscarUsuarios: (http: HttpClient, termino: string): Observable<any[]> => {
    return http.get<any[]>(`${API_CONFIG.baseUrl}/users/buscar?q=${termino}`).pipe(
      catchError(error => {
        console.error('Error al buscar usuarios:', error);
        return of([]);
      })
    );
  }
};

// Módulo de inicialización
@Injectable({
  providedIn: 'root'
})
export class UsersModule {
  constructor() {
    // Inicialización si es necesaria
  }
}
