import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private apiUrl = 'http://localhost:3000/api';
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Inicializar con el usuario del localStorage si existe
        const storedUser = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<any>(
            storedUser ? JSON.parse(storedUser) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue() {
        return this.currentUserSubject.value;
    }

    login(credentials: { username: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            map((response: any) => {
                // Asegurarse de que la respuesta tenga el formato esperado
                const userData = response.user || response;
                const token = response.token || userData?.token;
                
                if (userData && token) {
                    const user = { ...userData, token };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    return user;
                }
                throw new Error('Respuesta de autenticación inválida');
            }),
            catchError(error => {
                console.error('Error en el login:', error);
                throw error;
            })
        );
    }

    logout(): void {
        // Eliminar el usuario del localStorage
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        const user = this.currentUserValue;
        return !!user && !!user.token;
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    getProfile(token: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}
