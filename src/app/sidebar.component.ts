import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthenticationService, User } from './authentication.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="h-full w-64 shrink-0 border-r bg-white">
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">Menú</h2>
        <p class="mt-1 text-sm text-gray-500" *ngIf="user">Rol: {{ user && user.rol }}</p>
      </div>
      <nav class="p-2">
        <ng-container *ngIf="isTeacher(); else studentMenu">
          <a routerLink="/profesor" routerLinkActive="bg-gray-100 text-blue-700" class="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Panel Profesor</a>
          <a routerLink="/calendario" routerLinkActive="bg-gray-100 text-blue-700" class="mt-1 block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Calendario</a>
        </ng-container>
        <ng-template #studentMenu>
          <a routerLink="/estudiante" routerLinkActive="bg-gray-100 text-blue-700" class="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Cursos</a>
          <a routerLink="/perfil-estudiante" routerLinkActive="bg-gray-100 text-blue-700" class="mt-1 block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Perfil</a>
          <a routerLink="/calendario" routerLinkActive="bg-gray-100 text-blue-700" class="mt-1 block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Calendario</a>
        </ng-template>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  constructor(private auth: AuthenticationService) {}
  get user(): User | null { return this.auth.currentUserValue; }
  isTeacher(): boolean {
    const role = this.user?.rol;
    return role === 'instructor' || role === 'profesor';
  }
}
