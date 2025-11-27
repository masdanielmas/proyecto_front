import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { usersFunctions } from './users.functions';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="mx-auto max-w-2xl bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg p-6">
      <h1 class="text-xl font-semibold text-gray-900 mb-4">Editar usuario</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Usuario</label>
          <input class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" type="text" formControlName="usuario" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Correo</label>
          <input class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" type="email" formControlName="correo" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <input class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" type="text" formControlName="nombre" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Apellido</label>
            <input class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" type="text" formControlName="apellido" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Rol</label>
          <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" formControlName="rol">
            <option value="admin">admin</option>
            <option value="instructor">instructor</option>
            <option value="estudiante">estudiante</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" (click)="onCancel()" class="px-4 py-2 rounded-md border border-gray-300 text-gray-700">Cancelar</button>
          <button type="submit" [disabled]="form.invalid || guardando" class="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class EditUserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  id!: string | number;
  cargando = false;
  guardando = false;

  form = this.fb.group({
    usuario: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    rol: ['estudiante', [Validators.required]]
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    if (!this.id) {
      // Si no hay id, regresar a la lista
      this.router.navigate(['/usuarios']);
      return;
    }

    this.cargarUsuario(this.id);
  }

  private cargarUsuario(id: string | number) {
    this.cargando = true;
    usersFunctions.getUsuarioPorId(this.http, id).subscribe({
      next: (usuario: any) => {
        // Mapear posibles nombres de campos
        const patch = {
          usuario: usuario?.usuario ?? usuario?.username ?? '',
          correo: usuario?.correo ?? usuario?.email ?? '',
          nombre: usuario?.nombre ?? '',
          apellido: usuario?.apellido ?? '',
          rol: usuario?.rol ?? 'estudiante'
        };
        this.form.patchValue(patch);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.router.navigate(['/usuarios']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.id) return;
    this.guardando = true;
    usersFunctions.actualizarUsuario(this.http, this.id, this.form.value).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/usuarios']);
      },
      error: () => {
        this.guardando = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/usuarios']);
  }
}
