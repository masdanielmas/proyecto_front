import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from './authentication.service';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="flex">
        <app-sidebar></app-sidebar>

        <main class="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">
          <div class="mx-auto max-w-7xl">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-semibold text-gray-800">Perfil de estudiante</h1>
                <p class="mt-1 text-sm text-gray-500" *ngIf="user">
                  {{ user.nombre }} {{ user.apellido }} · {{ user.correo }}
                </p>
              </div>
            </div>

            <div class="mb-5 border-b border-gray-200">
              <nav class="-mb-px flex gap-4" aria-label="Tabs">
                <button (click)="activeTab = 'resumen'" [class]="tabClass('resumen')">Resumen</button>
                <button (click)="activeTab = 'certificados'" [class]="tabClass('certificados')">Certificados</button>
                <button (click)="activeTab = 'actividad'" [class]="tabClass('actividad')">Actividad</button>
              </nav>
            </div>

            <div *ngIf="loading" class="text-gray-600">Cargando información...</div>
            <div *ngIf="error" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{{ error }}</div>

            <!-- Resumen -->
            <section *ngIf="!loading && activeTab === 'resumen'">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                <div class="rounded-lg border bg-white p-4">
                  <p class="text-sm text-gray-500">Cursos inscritos</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900">{{ dashboard?.resumen?.totalCursosInscritos || 0 }}</p>
                </div>
                <div class="rounded-lg border bg-white p-4">
                  <p class="text-sm text-gray-500">En curso</p>
                  <p class="mt-2 text-2xl font-semibold text-blue-600">{{ dashboard?.resumen?.cursosEnCurso || 0 }}</p>
                </div>
                <div class="rounded-lg border bg-white p-4">
                  <p class="text-sm text-gray-500">Completados</p>
                  <p class="mt-2 text-2xl font-semibold text-emerald-600">{{ dashboard?.resumen?.cursosCompletados || 0 }}</p>
                </div>
              </div>

              <h2 class="mb-3 text-lg font-semibold text-gray-800">Últimos cursos</h2>
              <div *ngIf="!dashboard?.ultimosCursos?.length" class="rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
                Aún no hay progreso registrado.
              </div>
              <div *ngIf="dashboard?.ultimosCursos?.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article *ngFor="let c of dashboard.ultimosCursos" class="rounded-lg border bg-white p-4">
                  <div class="flex items-center gap-3">
                    <div class="h-12 w-12 overflow-hidden rounded bg-gray-200">
                      <img *ngIf="c.miniatura" [src]="c.miniatura" alt="Miniatura" class="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h3 class="line-clamp-1 text-sm font-semibold text-gray-900">{{ c.titulo }}</h3>
                      <p class="text-xs text-gray-500">Progreso: {{ c.progreso | number:'1.0-0' }}%</p>
                    </div>
                  </div>
                  <p *ngIf="c.ultimaLeccion" class="mt-2 text-xs text-gray-500">
                    Última lección: {{ c.ultimaLeccion.titulo }}
                  </p>
                </article>
              </div>
            </section>

            <!-- Certificados -->
            <section *ngIf="!loading && activeTab === 'certificados'">
              <div *ngIf="!certificados.length" class="rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
                Aún no tienes certificados emitidos.
              </div>
              <div *ngIf="certificados.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article *ngFor="let cert of certificados" class="flex flex-col justify-between rounded-lg border bg-white p-4">
                  <div>
                    <h3 class="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">{{ cert.titulo }}</h3>
                    <p class="text-xs text-gray-500">Nivel: {{ cert.nivel || 'N/D' }}</p>
                    <p class="text-xs text-gray-500">Duración: {{ cert.duracion || 0 }} min</p>
                    <p class="mt-2 text-xs text-gray-500">Emitido: {{ cert.fechaEmision | date:'shortDate' }}</p>
                  </div>
                  <a *ngIf="cert.certificadoUrl" [href]="cert.certificadoUrl" target="_blank" class="mt-3 inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                    Ver certificado
                  </a>
                </article>
              </div>
            </section>

            <!-- Actividad -->
            <section *ngIf="!loading && activeTab === 'actividad'">
              <div *ngIf="!actividad.length" class="rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
                Aún no hay actividad registrada.
              </div>
              <ul *ngIf="actividad.length" class="space-y-3">
                <li *ngFor="let ev of actividad" class="flex items-start gap-3 rounded-lg border bg-white p-3 text-sm">
                  <div class="mt-1 h-2 w-2 rounded-full"
                       [ngClass]="{
                         'bg-blue-500': ev.tipo === 'inscripcion',
                         'bg-amber-500': ev.tipo === 'leccion_completada',
                         'bg-emerald-500': ev.tipo === 'certificado'
                       }"></div>
                  <div>
                    <p class="text-gray-800">
                      <ng-container [ngSwitch]="ev.tipo">
                        <span *ngSwitchCase="'inscripcion'">Te inscribiste en <strong>{{ ev.curso?.titulo }}</strong></span>
                        <span *ngSwitchCase="'leccion_completada'">Completaste la lección <strong>{{ ev.leccion?.titulo }}</strong> del curso <strong>{{ ev.curso?.titulo }}</strong></span>
                        <span *ngSwitchCase="'certificado'">Obtuviste el certificado de <strong>{{ ev.curso?.titulo }}</strong></span>
                        <span *ngSwitchDefault>Actividad en {{ ev.curso?.titulo }}</span>
                      </ng-container>
                    </p>
                    <p class="mt-1 text-xs text-gray-500">{{ ev.fecha | date:'short' }}</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class StudentProfileComponent implements OnInit {
  private auth = inject(AuthenticationService);

  user = this.auth.currentUserValue;
  activeTab: 'resumen' | 'certificados' | 'actividad' = 'resumen';

  dashboard: any = null;
  certificados: any[] = [];
  actividad: any[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.error = '';

    this.auth.getStudentDashboard().subscribe({
      next: (data) => {
        this.dashboard = data || {};
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar el resumen';
      }
    });

    this.auth.getStudentCertificates().subscribe({
      next: (data) => {
        this.certificados = data?.certificados || [];
      },
      error: (err) => {
        if (!this.error) {
          this.error = err?.error?.message || 'No se pudieron cargar los certificados';
        }
      }
    });

    this.auth.getStudentActivity().subscribe({
      next: (data) => {
        this.actividad = data?.actividad || [];
        this.loading = false;
      },
      error: (err) => {
        if (!this.error) {
          this.error = err?.error?.message || 'No se pudo cargar la actividad';
        }
        this.loading = false;
      }
    });
  }

  tabClass(tab: 'resumen' | 'certificados' | 'actividad') {
    const base = 'border-b-2 px-3 py-2 text-sm font-medium';
    const active = 'border-blue-600 text-blue-600';
    const inactive = 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300';
    return `${base} ${this.activeTab === tab ? active : inactive}`;
  }
}
