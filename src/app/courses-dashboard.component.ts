import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { CoursesService } from './courses.service';
import { SidebarComponent } from './sidebar.component';
import { AuthenticationService } from './authentication.service';
import { LessonsService } from './lessons.service';

@Component({
  selector: 'app-courses-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="flex">
        <app-sidebar></app-sidebar>

        <main class="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">
          <div class="mx-auto max-w-7xl">
            <div class="mb-6 flex items-center justify-between">
              <h1 class="text-2xl font-semibold text-gray-800">Cursos</h1>
              <button class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      (click)="reload()">
                Recargar
              </button>
            </div>

            <div class="mb-5 border-b border-gray-200">
              <nav class="-mb-px flex gap-4" aria-label="Tabs">
                <button (click)="setTab('disponibles')" [class]="tabClass('disponibles')">Disponibles</button>
                <button (click)="setTab('mis')" [class]="tabClass('mis')">Mis cursos</button>
              </nav>
            </div>

            <div *ngIf="loading" class="text-gray-600">Cargando cursos...</div>
            <div *ngIf="error" class="rounded bg-red-50 p-3 text-sm text-red-700">{{ error }}</div>

            <!-- Disponibles -->
            <ng-container *ngIf="activeTab === 'disponibles'">
              <div *ngIf="!loading && !error && availableCourses.length === 0" class="rounded border border-dashed border-gray-300 p-8 text-center text-gray-600">
                No hay cursos disponibles para inscribirse.
              </div>
              <div *ngIf="availableCourses.length > 0" class="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <div *ngFor="let course of availableCourses; index as i" class="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div class="relative h-56 w-full overflow-hidden bg-gray-200">
                    <img *ngIf="courseThumbnail(course); else gradientDisponible" [src]="courseThumbnail(course)" alt="Miniatura del curso" class="h-full w-full object-cover" />
                    <ng-template #gradientDisponible>
                      <div class="h-full w-full bg-gradient-to-r from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300"></div>
                    </ng-template>
                  </div>
                  <div class="p-5">
                    <h2 class="mb-2 line-clamp-1 text-lg font-semibold text-gray-900">
                      {{ courseName(course, i) }}
                    </h2>
                    <p class="line-clamp-3 text-sm text-gray-600">
                      {{ courseDescription(course) }}
                    </p>
                    <div class="mt-4 flex items-center justify-between">
                      <span class="text-xs text-gray-500">ID: {{ courseId(course, i) }}</span>
                      <button class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700" (click)="enroll(course)" [disabled]="loading">Inscribirse</button>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- Mis cursos -->
            <ng-container *ngIf="activeTab === 'mis'">
              <div *ngIf="!loading && !error && myCourses.length === 0" class="rounded border border-dashed border-gray-300 p-8 text-center text-gray-600">
                Aún no estás inscrito en cursos.
              </div>
              <div *ngIf="myCourses.length > 0" class="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-2">
                <div *ngFor="let course of myCourses; index as i" class="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div class="relative h-56 w-full overflow-hidden bg-gray-200">
                    <img *ngIf="courseThumbnail(course); else gradientMis" [src]="courseThumbnail(course)" alt="Miniatura del curso" class="h-full w-full object-cover" />
                    <ng-template #gradientMis>
                      <div class="h-full w-full bg-gradient-to-r from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300"></div>
                    </ng-template>
                  </div>
                  <div class="p-4">
                    <h2 class="mb-1 line-clamp-1 text-base font-semibold text-gray-900">
                      {{ courseName(course, i) }}
                    </h2>
                    <p class="line-clamp-2 text-sm text-gray-600">
                      {{ courseDescription(course) }}
                    </p>
                    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span class="text-xs text-gray-500">ID: {{ courseId(course, i) }}</span>
                      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <a
                          class="w-full sm:w-auto rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center justify-center"
                          [routerLink]="['/curso', courseId(course, i)]"
                        >
                          Entrar al curso
                        </a>
                        <button
                          class="w-full sm:w-auto rounded-md bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                          (click)="toggleLessons(course, i)"
                          [disabled]="lessonsLoading && expandedCourseId === courseId(course, i)"
                        >
                          {{ expandedCourseId === courseId(course, i) ? 'Ocultar lecciones' : 'Ver lecciones' }}
                        </button>
                        <button
                          class="w-full sm:w-auto rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          (click)="unenroll(course)"
                          [disabled]="loading"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                    <div *ngIf="expandedCourseId === courseId(course, i)" class="mt-3 border-t pt-2 text-sm">
                      <div *ngIf="lessonsLoading" class="text-gray-500">Cargando lecciones...</div>
                      <div *ngIf="lessonsError" class="text-red-600">{{ lessonsError }}</div>
                      <div *ngIf="!lessonsLoading && !lessonsError && courseLessons.length === 0" class="text-gray-500">
                        Este curso aún no tiene lecciones.
                      </div>
                      <ul *ngIf="courseLessons.length > 0" class="mt-1 space-y-1">
                        <li
                          *ngFor="let l of courseLessons"
                          class="flex justify-between rounded border px-2 py-1 cursor-pointer hover:bg-gray-50"
                          (click)="selectLesson(l)"
                        >
                          <div>
                            <span class="block font-medium text-gray-900">{{ l.titulo || 'Sin título' }}</span>
                            <span class="block text-xs text-gray-500">Orden: {{ l.orden }} · {{ l.duracion }} min</span>
                            <span *ngIf="l.urlVideo" class="block text-[11px] text-emerald-600">Tiene video</span>
                          </div>
                        </li>
                      </ul>
                      <div *ngIf="selectedLesson && selectedLesson.urlVideo" class="mt-3 space-y-1">
                        <p class="text-xs text-gray-600">Reproduciendo: {{ selectedLesson.titulo || 'Lección' }}</p>
                        <div class="aspect-video w-full overflow-hidden rounded-md border bg-black">
                          <iframe
                            *ngIf="embedUrl(selectedLesson.urlVideo) as safeUrl"
                            class="h-full w-full"
                            [src]="safeUrl"
                            title="YouTube video player"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class CoursesDashboardComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private lessonsService = inject(LessonsService);
  private sanitizer = inject(DomSanitizer);

  courses: any[] = [];
  loading = false;
  error = '';
  activeTab: 'disponibles' | 'mis' = 'disponibles';
  enrolledIds = new Set<string>();
  availableCourses: any[] = [];
  myCourses: any[] = [];
  expandedCourseId: string | null = null;
  courseLessons: any[] = [];
  lessonsLoading = false;
  lessonsError = '';
  selectedLesson: any | null = null;

  ngOnInit(): void {
    const user = this.authService.currentUserValue as any;
    if (!user || user.rol !== 'estudiante') {
      this.router.navigate(['/login-estudiante']);
      return;
    }

    this.loadCourses();
  }

  reload(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.loading = true;
    this.error = '';
    this.coursesService.getAll().subscribe({
      next: (data) => {
        this.courses = Array.isArray(data) ? data : [];
        this.loadMyCourses();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudieron cargar los cursos';
        this.loading = false;
      }
    });
  }

  private loadMyCourses(): void {
    this.coursesService.getMyCourses().subscribe({
      next: (data) => {
        this.myCourses = Array.isArray(data) ? data : [];
        this.recomputeLists();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudieron cargar tus cursos';
        this.myCourses = [];
        this.recomputeLists();
        this.loading = false;
      }
    });
  }

  setTab(tab: 'disponibles' | 'mis') {
    this.activeTab = tab;
  }

  tabClass(tab: 'disponibles' | 'mis') {
    const base = 'border-b-2 px-3 py-2 text-sm font-medium';
    const active = 'border-blue-600 text-blue-600';
    const inactive = 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300';
    return `${base} ${this.activeTab === tab ? active : inactive}`;
  }

  courseId(c: any, idx: number): string {
    return String(c?.id ?? c?._id ?? idx);
  }

  courseName(c: any, idx: number): string {
    return c?.titulo || c?.nombre || c?.title || `Curso ${idx + 1}`;
  }

  courseDescription(c: any): string {
    return c?.descripcion || c?.description || 'Sin descripción';
  }

  courseThumbnail(c: any): string {
    return c?.miniatura || c?.thumbnail || '';
  }

  private recomputeLists() {
    const all = this.courses || [];
    const myIds = new Set((this.myCourses || []).map((c, i) => this.courseId(c, i)));
    this.availableCourses = all.filter((c, i) => !myIds.has(this.courseId(c, i)));
  }

  enroll(course: any) {
    const id = this.courseId(course, 0);
    this.loading = true;
    this.error = '';
    this.coursesService.enroll(id).subscribe({
      next: () => {
        this.reload();
        this.activeTab = 'mis';
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo inscribirse en el curso';
        this.loading = false;
      }
    });
  }

  unenroll(course: any) {
    const id = this.courseId(course, 0);
    if (!id) {
      return;
    }
    if (!confirm('¿Seguro que quieres cancelar la inscripción a este curso?')) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.coursesService.unenroll(id).subscribe({
      next: () => {
        // Recargar la lista de cursos y de mis cursos
        this.reload();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cancelar la inscripción en el curso';
        this.loading = false;
      }
    });
  }

  toggleLessons(course: any, idx: number) {
    const id = this.courseId(course, idx);
    if (this.expandedCourseId === id) {
      this.expandedCourseId = null;
      this.courseLessons = [];
      this.lessonsError = '';
      this.selectedLesson = null;
      return;
    }

    this.expandedCourseId = id;
    this.courseLessons = [];
    this.lessonsError = '';
    this.lessonsLoading = true;
    this.selectedLesson = null;

    this.lessonsService.getAll(id).subscribe({
      next: (data) => {
        this.courseLessons = Array.isArray(data) ? data : [];
        this.lessonsLoading = false;
      },
      error: (err) => {
        this.lessonsError = err?.error?.message || 'No se pudieron cargar las lecciones';
        this.lessonsLoading = false;
      }
    });
  }

  selectLesson(lesson: any) {
    this.selectedLesson = lesson;
  }

  embedUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;
    try {
      let videoId = '';
      const ytMatch = url.match(/[?&]v=([^&#]+)/);
      const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
      if (ytMatch && ytMatch[1]) {
        videoId = ytMatch[1];
      } else if (shortMatch && shortMatch[1]) {
        videoId = shortMatch[1];
      }
      if (!videoId) {
        return null;
      }
      const embed = `https://www.youtube.com/embed/${videoId}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    } catch {
      return null;
    }
  }
}
