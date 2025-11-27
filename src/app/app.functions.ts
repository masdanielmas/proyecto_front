import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { authFunctions } from './auth/auth.functions';

// Estado del componente principal
let appState = {
  title: 'webproyecto',
  currentUser: null as any,
  isAuthenticated: false
};

// Observable del estado
const appStateSubject = new BehaviorSubject(appState);
export const appState$ = appStateSubject.asObservable();

// Funciones puras del componente principal
export const appFunctions = {
  // Obtener estado actual
  getAppState: () => appState,

  // Obtener observable del estado
  getAppState$: () => appState$,

  // Inicializar estado de la aplicación
  initializeApp: () => {
    authFunctions.initializeAuth();
    const currentUser = authFunctions.getCurrentUserValue();
    appState.currentUser = currentUser;
    appState.isAuthenticated = authFunctions.isAuthenticated();
    appStateSubject.next({ ...appState });
  },

  // Actualizar estado de autenticación
  updateAuthState: () => {
    const currentUser = authFunctions.getCurrentUserValue();
    appState.currentUser = currentUser;
    appState.isAuthenticated = authFunctions.isAuthenticated();
    appStateSubject.next({ ...appState });
  },

  // Logout
  logout: (router: Router, http: HttpClient) => {
    authFunctions.logout(router);
    appFunctions.updateAuthState();
  },

  // Cambiar título
  setTitle: (newTitle: string) => {
    appState.title = newTitle;
    appStateSubject.next({ ...appState });
  },

  // Resetear estado
  resetState: () => {
    appState = {
      title: 'webproyecto',
      currentUser: null,
      isAuthenticated: false
    };
    appStateSubject.next({ ...appState });
  }
};

// Componente funcional
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  appState$ = appFunctions.getAppState$();
  state = appFunctions.getAppState();

  title = 'webproyecto';

  ngOnInit() {
    appFunctions.initializeApp();
    this.appState$.subscribe(state => {
      this.state = state;
      this.title = state.title;
    });

    // Suscribirse a cambios de autenticación
    authFunctions.getCurrentUser().subscribe(() => {
      appFunctions.updateAuthState();
    });
  }

  logout() {
    appFunctions.logout(this.router, this.http);
  }

  get currentUser() {
    return this.state.currentUser;
  }

  get isAuthenticated() {
    return this.state.isAuthenticated;
  }
}
