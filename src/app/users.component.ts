import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { usersFunctions } from './users.functions';

// Estado del componente de usuarios
let usersState = {
  usuarios: [] as any[],
  cargando: false,
  error: '',
  searchTerm: ''
};

// Observable del estado
const usersStateSubject = new BehaviorSubject(usersState);
export const usersState$ = usersStateSubject.asObservable();

// Funciones puras del componente de usuarios
export const usersComponentFunctions = {
  // Obtener estado actual
  getUsersState: () => usersState,

  // Obtener observable del estado
  getUsersState$: () => usersState$,

  // Cargar usuarios
  cargarUsuarios: (http: HttpClient) => {
    usersState.cargando = true;
    usersState.error = '';
    usersStateSubject.next({ ...usersState });

    usersFunctions.getUsers(http).pipe(
      finalize(() => {
        usersState.cargando = false;
        usersStateSubject.next({ ...usersState });
      })
    ).subscribe({
      next: (data) => {
        usersState.usuarios = data;
        usersStateSubject.next({ ...usersState });
      },
      error: (error) => {
        usersState.error = 'Error al cargar los usuarios. Por favor, intente nuevamente.';
        console.error('Error al cargar usuarios:', error);
        usersStateSubject.next({ ...usersState });
      }
    });
  },

  // Editar usuario
  editarUsuario: (router: Router, usuario: any) => {
    const id = usuario?.id ?? usuario?._id ?? usuario?.idUsuario;
    if (id === undefined || id === null) {
      console.error('Editar usuario: ID indefinido', usuario);
      return;
    }
    router.navigate(['/usuarios', 'editar', id]);
  },

  // Eliminar usuario
  eliminarUsuario: (http: HttpClient, id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    usersState.cargando = true;
    usersStateSubject.next({ ...usersState });

    usersFunctions.eliminarUsuario(http, id).pipe(
      finalize(() => {
        usersState.cargando = false;
        usersStateSubject.next({ ...usersState });
      })
    ).subscribe({
      next: () => {
        usersState.usuarios = usersState.usuarios.filter(u => u.id !== id);
        usersStateSubject.next({ ...usersState });
        alert('Usuario eliminado exitosamente');
      },
      error: (error) => {
        usersState.error = 'Error al eliminar el usuario. Por favor, intente nuevamente.';
        console.error('Error al eliminar usuario:', error);
        usersStateSubject.next({ ...usersState });
      }
    });
  },

  // Buscar usuarios
  buscarUsuarios: (http: HttpClient, termino: string) => {
    usersState.searchTerm = termino;
    usersState.cargando = true;
    usersStateSubject.next({ ...usersState });

    if (termino.trim() === '') {
      usersComponentFunctions.cargarUsuarios(http);
      return;
    }

    usersFunctions.buscarUsuarios(http, termino).pipe(
      finalize(() => {
        usersState.cargando = false;
        usersStateSubject.next({ ...usersState });
      })
    ).subscribe({
      next: (data) => {
        usersState.usuarios = data;
        usersStateSubject.next({ ...usersState });
      },
      error: (error) => {
        usersState.error = 'Error al buscar usuarios. Por favor, intente nuevamente.';
        console.error('Error al buscar usuarios:', error);
        usersStateSubject.next({ ...usersState });
      }
    });
  },

  // Resetear estado
  resetState: () => {
    usersState = {
      usuarios: [],
      cargando: false,
      error: '',
      searchTerm: ''
    };
    usersStateSubject.next({ ...usersState });
  },

  // Filtrar usuarios locales
  filtrarUsuarios: () => {
    if (!usersState.searchTerm.trim()) {
      return usersState.usuarios;
    }
    return usersState.usuarios.filter(usuario =>
      usuario.nombre?.toLowerCase().includes(usersState.searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(usersState.searchTerm.toLowerCase()) ||
      usuario.username?.toLowerCase().includes(usersState.searchTerm.toLowerCase())
    );
  }
};

// Componente funcional
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  usersState$ = usersComponentFunctions.getUsersState$();
  state = usersComponentFunctions.getUsersState();

  ngOnInit() {
    this.usersState$.subscribe(state => {
      this.state = state;
    });
    usersComponentFunctions.cargarUsuarios(this.http);
  }

  cargarUsuarios() {
    usersComponentFunctions.cargarUsuarios(this.http);
  }

  editarUsuario(usuario: any) {
    usersComponentFunctions.editarUsuario(this.router, usuario);
  }

  eliminarUsuario(id: number) {
    usersComponentFunctions.eliminarUsuario(this.http, id);
  }

  buscarUsuarios(termino: string) {
    usersComponentFunctions.buscarUsuarios(this.http, termino);
  }

  get usuariosFiltrados() {
    return usersComponentFunctions.filtrarUsuarios();
  }
}
