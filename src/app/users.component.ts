import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from './users.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styles: [`
    .spinner {
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 3px solid #3b82f6;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class UsersComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;
  eliminandoId: number | null = null;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usersService.getUsers()
      .pipe(
        finalize(() => this.cargando = false),
        catchError(error => {
          console.error('Error al cargar usuarios:', error);
          // Aquí podrías mostrar un mensaje de error al usuario
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.usuarios = data;
          console.log('Usuarios cargados:', data);
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          alert('Error al cargar los usuarios. Por favor, intente nuevamente.');
        }
      });
  }

  editarUsuario(usuario: Usuario): void {
    // Aquí podrías implementar la lógica para editar el usuario
    // Por ejemplo, abrir un modal o navegar a una ruta de edición
    console.log('Editando usuario:', usuario);
    alert(`Modo edición para el usuario: ${usuario.nombre} ${usuario.apellido}`);
    
    // Ejemplo de implementación con un modal (descomenta y adapta según necesites):
    // this.dialog.open(EditarUsuarioComponent, {
    //   data: { usuario }
    // }).afterClosed().subscribe(resultado => {
    //   if (resultado) {
    //     this.cargarUsuarios(); // Recargar la lista si se realizaron cambios
    //   }
    // });
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.eliminandoId = id;
      this.usersService.eliminarUsuario(id)
        .pipe(finalize(() => this.eliminandoId = null))
        .subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter(u => u.id !== id);
            // Aquí podrías mostrar un mensaje de éxito
            alert('Usuario eliminado correctamente');
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            alert('Ocurrió un error al intentar eliminar el usuario');
          }
        });
    }
  }
}