import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/users'; // Asegúrate de que esta URL sea correcta

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    eliminarUsuario(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Ocurrió un error al procesar tu solicitud'));
    }
}
