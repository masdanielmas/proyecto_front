import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  _id?: string;
  usuario: string;
  correo: string;
  nombre: string;
  apellido: string;
  rol: string;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private readonly API_URL = 'http://localhost:3000/api'; // Asegúrate de que el puerto sea correcto

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Modificado para coincidir exactamente con el contrato requerido: { usuario, password }
  login(credentials: { usuario: string; password: string }): Observable<User> {
    // Enviar EXACTAMENTE estos campos
    const payload: any = {
      usuario: (credentials.usuario || '').trim(),
      password: (credentials.password || '').trim(),
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<User | any>(`${this.API_URL}/login`, payload, httpOptions)
      .pipe(
        map((resp: any) => {
          // El backend devuelve { token, user: { ... } }
          const rawUser = resp?.usuario || resp?.user || resp; // flexible
          const normalized = this.normalizeUser(rawUser);
          const token = resp?.token || (rawUser as any)?.token;
          const withToken = (token
            ? ({ ...normalized, token } as User)
            : (normalized as User));

          localStorage.setItem('currentUser', JSON.stringify(withToken));
          this.currentUserSubject.next(withToken);
          return withToken;
        }),
        catchError((err) => throwError(() => err))
      );
  }

  private normalizeUser(u: any): User {
    if (!u || typeof u !== 'object') return u as User;
    const roleRaw = (u.rol ?? u.role ?? u.tipo ?? '').toString().toLowerCase();
    let rol = roleRaw;
    if (['teacher', 'profesor', 'instructor', 'docente'].includes(roleRaw)) {
      rol = 'instructor';
    } else if (['student', 'estudiante', 'alumno'].includes(roleRaw)) {
      rol = 'estudiante';
    }
    return { ...(u as any), rol } as User;
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param userData Datos del usuario a registrar
   */
  register(userData: { 
    usuario: string; 
    correo: string; 
    nombre: string; 
    apellido: string; 
    clave: string;
  }): Observable<any> {
    // Mantener compatibilidad: usar registro de estudiante por defecto
    return this.registerStudent(userData);
  }

  registerStudent(userData: {
    usuario: string;
    correo: string;
    nombre: string;
    apellido: string;
    clave: string;
  }): Observable<any> {
    // Preparar los datos para el registro con el formato exacto requerido
    const datosRegistro = {
      usuario: userData.usuario.trim(),
      correo: userData.correo.trim(),
      nombre: userData.nombre.trim(),
      apellido: userData.apellido.trim(),
      clave: userData.clave,
      rol: 'estudiante' // Rol fijo como 'estudiante'
    };
    
    console.log('Datos de registro normalizados:', datosRegistro);
    
    // Verificar que los datos requeridos estén presentes
    if (!datosRegistro.usuario || !datosRegistro.correo || !datosRegistro.nombre || !datosRegistro.apellido || !datosRegistro.clave) {
      const error = { error: { message: 'Todos los campos son obligatorios' } };
      console.error('Error de validación:', error);
      return throwError(() => error);
    }
    
    console.log('Enviando al backend:', datosRegistro);
    
    // Realizar la petición HTTP al backend
    // Usamos la ruta específica de estudiante
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: true,
      observe: 'response' as const
    };

    // Si estás en desarrollo, puedes desactivar temporalmente withCredentials para pruebas
    // httpOptions.withCredentials = false;
    return this.http.post(`${this.API_URL}/signup-estudiante`, datosRegistro, httpOptions).pipe(
      map((response: any) => {
        console.log('Respuesta completa del servidor:', response);
        
        // Verificar si la respuesta es exitosa (código 2xx)
        if (response.status >= 200 && response.status < 300) {
          const responseData = response.body;
          console.log('Datos de la respuesta:', responseData);
          
          if (responseData) {
            // Extraer y normalizar el usuario de la respuesta
            const rawUser = responseData.user || responseData.usuario || responseData;
            const normalized = this.normalizeUser(rawUser);
            const token = (responseData as any).token || (rawUser as any)?.token;
            const withToken = (token
              ? ({ ...normalized, token } as User)
              : (normalized as User));

            // Guardar el usuario normalizado con token (mismo formato que login)
            localStorage.setItem('currentUser', JSON.stringify(withToken));
            this.currentUserSubject.next(withToken);

            return withToken;
          } else {
            console.warn('La respuesta del servidor no incluye datos de usuario');
            return responseData; // Devolver la respuesta aunque no tenga datos claros
          }
        } else {
          console.warn('Respuesta con estado inesperado:', response.status, response.statusText);
          throw new Error(`Error en el registro: ${response.status} ${response.statusText}`);
        }
      }),
      catchError(error => {
        console.error('Error en la petición de registro:', error);
        
        let errorMessage = 'Error al conectar con el servidor';
        let errorDetails: any = {};
        
        if (error.error) {
          // Si hay un error de la API
          if (typeof error.error === 'string') {
            try {
              // Intentar parsear el error si es un string JSON
              const parsedError = JSON.parse(error.error);
              errorMessage = parsedError.message || errorMessage;
              errorDetails = { ...parsedError };
            } catch (e) {
              // Si no es JSON, usar el mensaje de error directamente
              errorMessage = error.error;
            }
          } else if (error.error.message) {
            errorMessage = error.error.message;
            errorDetails = { ...error.error };
          } else if (error.error.error) {
            errorMessage = error.error.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.error('Mensaje de error para el usuario:', errorMessage);
        
        // Devolver un objeto de error consistente
        return throwError(() => ({
          error: {
            message: errorMessage,
            details: errorDetails,
            status: error.status,
            statusText: error.statusText
          }
        }));
      })
    );
  }

  registerTeacher(userData: {
    usuario: string;
    correo: string;
    nombre: string;
    apellido: string;
    clave: string;
    pais: string;
  }): Observable<any> {
    const datosRegistro = {
      usuario: userData.usuario.trim(),
      correo: userData.correo.trim(),
      nombre: userData.nombre.trim(),
      apellido: userData.apellido.trim(),
      clave: userData.clave,
      rol: 'instructor',
      pais: (userData.pais || '').trim()
    };

    if (!datosRegistro.usuario || !datosRegistro.correo || !datosRegistro.nombre || !datosRegistro.apellido || !datosRegistro.clave || !datosRegistro.pais) {
      const error = { error: { message: 'Todos los campos son obligatorios' } };
      return throwError(() => error);
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: true,
      observe: 'response' as const
    };

    return this.http.post(`${this.API_URL}/signup`, datosRegistro, httpOptions).pipe(
      map((response: any) => {
        if (response.status >= 200 && response.status < 300) {
          const responseData = response.body;
          if (responseData) {
            const rawUser = responseData.user || responseData.usuario || responseData;
            const normalized = this.normalizeUser(rawUser);
            const token = (responseData as any).token || (rawUser as any)?.token;
            const withToken = (token
              ? ({ ...normalized, token } as User)
              : (normalized as User));

            localStorage.setItem('currentUser', JSON.stringify(withToken));
            this.currentUserSubject.next(withToken);

            return withToken;
          } else {
            return responseData;
          }
        } else {
          throw new Error(`Error en el registro: ${response.status} ${response.statusText}`);
        }
      }),
      catchError(error => {
        let errorMessage = 'Error al conectar con el servidor';
        let errorDetails: any = {};
        if (error.error) {
          if (typeof error.error === 'string') {
            try {
              const parsedError = JSON.parse(error.error);
              errorMessage = parsedError.message || errorMessage;
              errorDetails = { ...parsedError };
            } catch (e) {
              errorMessage = error.error;
            }
          } else if (error.error.message) {
            errorMessage = error.error.message;
            errorDetails = { ...error.error };
          } else if (error.error.error) {
            errorMessage = error.error.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => ({
          error: {
            message: errorMessage,
            details: errorDetails,
            status: error.status,
            statusText: error.statusText
          }
        }));
      })
    );
  }

  // ===== Endpoints de perfil de estudiante =====

  private authHeaders(): HttpHeaders {
    const token = this.currentUserValue?.token;
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getStudentDashboard(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/estudiante/dashboard`, {
      headers: this.authHeaders(),
      withCredentials: true
    });
  }

  getStudentCertificates(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/estudiante/certificados`, {
      headers: this.authHeaders(),
      withCredentials: true
    });
  }

  getStudentActivity(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/estudiante/actividad`, {
      headers: this.authHeaders(),
      withCredentials: true
    });
  }

  logout(): void {
    // Eliminar usuario del localStorage y limpiar estado en memoria
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Redirigir siempre al login de estudiante (pantalla principal)
    this.router.navigate(['/login-estudiante']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}