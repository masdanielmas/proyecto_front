import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root'
})
export class LessonsService {
    private baseUrl = 'http://localhost:3000/api/cursos';

    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    private authOptions() {
        const user = this.authService.currentUserValue as any;
        const token = user?.token;
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return { headers };
    }

    getAll(cursoId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/${cursoId}/lecciones`, this.authOptions());
    }

    getById(cursoId: string, leccionId: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}`, this.authOptions());
    }

    create(cursoId: string, data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/${cursoId}/lecciones`, data, this.authOptions());
    }

    update(cursoId: string, leccionId: string, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}`, data, this.authOptions());
    }

    completarLeccion(cursoId: string, leccionId: string, data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}/completar`, data, this.authOptions());
    }

    desmarcarLeccion(cursoId: string, leccionId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}/desmarcar`, {}, this.authOptions());
    }

    delete(cursoId: string, leccionId: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}`, this.authOptions());
    }

    getPreguntas(cursoId: string, leccionId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}/preguntas`, this.authOptions());
    }

    crearPregunta(cursoId: string, leccionId: string, contenido: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}/preguntas`, { contenido }, this.authOptions());
    }

    responderPregunta(cursoId: string, leccionId: string, preguntaId: string, contenido: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/${cursoId}/lecciones/${leccionId}/preguntas/${preguntaId}/responder`, { contenido }, this.authOptions());
    }
}
