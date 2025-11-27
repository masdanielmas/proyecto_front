import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private apiUrl = 'http://localhost:3000/api/cursos';
    private myCoursesUrl = 'http://localhost:3000/api/mis-cursos';

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

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, this.authOptions());
    }

    getById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`, this.authOptions());
    }

    create(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data, this.authOptions());
    }

    update(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data, this.authOptions());
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, this.authOptions());
    }

    getMyCourses(): Observable<any[]> {
        return this.http.get<any[]>(this.myCoursesUrl, this.authOptions());
    }

    enroll(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/inscribirse`, {}, this.authOptions());
    }

    unenroll(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}/inscribirse`, this.authOptions());
    }
}
