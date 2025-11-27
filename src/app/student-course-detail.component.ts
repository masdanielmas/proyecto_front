import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar.component';
import { CoursesService } from './courses.service';
import { LessonsService } from './lessons.service';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-student-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="flex">
        <app-sidebar></app-sidebar>

        <main class="min-h-screen flex-1 p-4 sm:p-6 lg:p-8 relative">
          <div class="mx-auto max-w-7xl" *ngIf="!loading && !error; else loadingOrError">
            <button
              class="mb-4 inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              (click)="goBack()"
            >
              Volver a mis cursos
            </button>

            <section *ngIf="course" class="rounded-lg border bg-white p-5 shadow-sm mb-6">
              <h1 class="text-xl font-semibold text-gray-900 mb-1">{{ course.titulo || course.nombre || 'Curso' }}</h1>
              <p class="text-sm text-gray-600 mb-2">{{ course.descripcion || course.description || 'Sin descripción' }}</p>
              <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                <span *ngIf="course.nivel">Nivel: {{ course.nivel }}</span>
                <span *ngIf="course.duracion">Duración: {{ course.duracion }} min</span>
              </div>
            </section>

            <section class="rounded-lg border bg-white p-5 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Lecciones del curso</h2>

              <div *ngIf="lessonsLoading" class="text-sm text-gray-500">Cargando lecciones...</div>
              <div *ngIf="lessonsError" class="text-sm text-red-600">{{ lessonsError }}</div>
              <div *ngIf="!lessonsLoading && !lessonsError && lessons.length === 0" class="text-sm text-gray-500">
                Este curso aún no tiene lecciones.
              </div>

              <div *ngIf="lessons.length > 0" class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
                <ul class="space-y-2 text-sm">
                  <li
                    *ngFor="let l of lessons"
                    class="cursor-pointer rounded border px-3 py-2 hover:bg-gray-50"
                    [class.border-blue-500]="selectedLesson && (selectedLesson._id || selectedLesson.id) === (l._id || l.id)"
                    (click)="selectLesson(l)"
                  >
                    <p class="font-medium text-gray-900 flex items-center justify-between">
                      <span>{{ l.titulo || 'Sin título' }}</span>
                      <span *ngIf="l.urlVideo" class="ml-2 text-[11px] font-normal text-emerald-600">Video</span>
                    </p>
                    <p class="text-xs text-gray-500">Orden: {{ l.orden }} · {{ l.duracion }} min</p>
                  </li>
                </ul>

                <div class="space-y-3" *ngIf="selectedLesson">
                  <div>
                    <h3 class="text-base font-semibold text-gray-900">{{ selectedLesson.titulo || 'Lección' }}</h3>
                    <p class="mt-1 text-xs text-gray-500">Duración: {{ selectedLesson.duracion }} min</p>
                  </div>

                  <div *ngIf="selectedLesson.contenido" class="rounded border bg-gray-50 p-3 text-sm text-gray-800 whitespace-pre-line">
                    {{ selectedLesson.contenido }}
                  </div>

                  <div *ngIf="selectedLesson.urlVideo" class="rounded border bg-black overflow-hidden">
                    <div class="aspect-video w-full">
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

                  <div class="flex items-center gap-2 pt-1 text-xs">
                    <button
                      class="rounded-md px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      [ngClass]="selectedLesson.completada ? 'bg-gray-600 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700'"
                      (click)="toggleLessonCompleted()"
                      [disabled]="markingLesson"
                    >
                      {{ selectedLesson.completada ? 'Marcar como pendiente' : 'Marcar como completada' }}
                    </button>
                    <span *ngIf="markLessonMessage" class="text-gray-600">{{ markLessonMessage }}</span>
                  </div>

                  <div class="mt-4 border-t pt-3 text-sm">
                    <h4 class="font-semibold text-gray-900 mb-1">Preguntas de esta lección</h4>
                    <div *ngIf="questionsLoading" class="text-xs text-gray-500">Cargando preguntas...</div>
                    <div *ngIf="questionsError" class="text-xs text-red-600">{{ questionsError }}</div>

                    <div class="mb-2">
                      <textarea
                        [(ngModel)]="newQuestion"
                        rows="2"
                        placeholder="Escribe tu pregunta sobre esta lección"
                        class="block w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      ></textarea>
                      <div class="mt-1 flex justify-end">
                        <button
                          class="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          (click)="submitQuestion()"
                          [disabled]="questionSubmitting"
                        >
                          Enviar pregunta
                        </button>
                      </div>
                    </div>

                    <div *ngIf="!questionsLoading && !questionsError && lessonQuestions.length === 0" class="text-xs text-gray-500">
                      Aún no hay preguntas para esta lección.
                    </div>

                    <ul *ngIf="lessonQuestions.length > 0" class="mt-1 space-y-2">
                      <li *ngFor="let q of lessonQuestions" class="rounded border px-2 py-1.5">
                        <div class="text-xs text-gray-700">
                          <span class="font-semibold">{{ q.autor?.nombre }} {{ q.autor?.apellido }}</span>
                          <span class="text-[11px] text-gray-500" *ngIf="q.estado"> · {{ q.estado }}</span>
                        </div>
                        <div class="mt-0.5 text-xs text-gray-900 whitespace-pre-line">{{ q.contenido }}</div>
                        <div *ngIf="q.respuestas?.length" class="mt-1 border-l pl-2 space-y-1">
                          <div *ngFor="let r of q.respuestas" class="text-[11px] text-gray-800">
                            <span class="font-semibold">{{ r.autor?.nombre }} {{ r.autor?.apellido }}</span>
                            <span *ngIf="r.es_respuesta_instructor" class="ml-1 rounded bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700">Profesor</span>
                            : {{ r.contenido }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <ng-template #loadingOrError>
            <div class="mx-auto max-w-3xl">
              <div *ngIf="loading" class="text-gray-600">Cargando curso...</div>
              <div *ngIf="!loading && error" class="rounded bg-red-50 p-3 text-sm text-red-700">{{ error }}</div>
            </div>
          </ng-template>

          <!-- Celebración al completar el curso -->
          <div
            *ngIf="showCelebration"
            class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div class="relative mx-4 max-w-lg rounded-2xl bg-white px-6 py-5 text-center shadow-2xl">
              <div class="pointer-events-none absolute -top-6 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 to-emerald-400 opacity-80 blur-sm"></div>

              <div class="relative flex flex-col items-center gap-2">
                <div class="flex gap-2">
                  <span class="inline-block h-2 w-2 rounded-full bg-pink-400 animate-bounce"></span>
                  <span class="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]"></span>
                  <span class="inline-block h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:300ms]"></span>
                </div>

                <h2 class="text-xl font-extrabold tracking-tight text-gray-900">
                  ¡Felicidades por terminar el curso!
                </h2>
                <p class="text-sm text-gray-600 max-w-md">
                  Has completado el 100% de las lecciones. Sigue aprendiendo y revisa tu certificado en tu perfil de estudiante.
                </p>

                <div class="mt-2 grid grid-cols-3 gap-2 text-[10px] font-medium text-gray-700">
                  <div class="rounded-lg bg-pink-50 px-2 py-1">🎉 Logro desbloqueado</div>
                  <div class="rounded-lg bg-emerald-50 px-2 py-1">🏅 Curso completado</div>
                  <div class="rounded-lg bg-sky-50 px-2 py-1">📜 Certificado disponible</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class StudentCourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private lessonsService = inject(LessonsService);
  private authService = inject(AuthenticationService);
  private sanitizer = inject(DomSanitizer);

  course: any = null;
  lessons: any[] = [];
  selectedLesson: any | null = null;
  loading = false;
  error = '';
  lessonsLoading = false;
  lessonsError = '';
  questionsLoading = false;
  questionsError = '';
  lessonQuestions: any[] = [];
  newQuestion = '';
  questionSubmitting = false;
  markingLesson = false;
  markLessonMessage = '';
  courseProgress: number | null = null;
  showCelebration = false;
  private courseId: string | null = null;

  ngOnInit(): void {
    const user = this.authService.currentUserValue as any;
    if (!user || user.rol !== 'estudiante') {
      this.router.navigate(['/login-estudiante']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Curso inválido';
      return;
    }

    this.courseId = id;
    this.loadCourseAndLessons(id);
  }

  private loadCourseAndLessons(id: string): void {
    this.loading = true;
    this.error = '';

    this.coursesService.getById(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar el curso';
        this.loading = false;
      },
    });

    this.lessonsLoading = true;
    this.lessonsError = '';
    this.lessonsService.getAll(id).subscribe({
      next: (data) => {
        this.lessons = Array.isArray(data) ? data : [];
        this.lessonsLoading = false;
        this.selectedLesson = this.lessons[0] || null;
        if (this.selectedLesson) {
          this.loadQuestionsForSelectedLesson();
        }
      },
      error: (err) => {
        this.lessonsError = err?.error?.message || 'No se pudieron cargar las lecciones';
        this.lessonsLoading = false;
      },
    });
  }

  selectLesson(lesson: any) {
    this.selectedLesson = lesson;
    this.loadQuestionsForSelectedLesson();
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

  goBack() {
    this.router.navigate(['/estudiante']);
  }

  private loadQuestionsForSelectedLesson(): void {
    if (!this.courseId || !this.selectedLesson || !(this.selectedLesson._id || this.selectedLesson.id)) {
      this.lessonQuestions = [];
      return;
    }
    const cursoId = this.courseId;
    const leccionId = this.selectedLesson._id || this.selectedLesson.id;
    this.questionsLoading = true;
    this.questionsError = '';
    this.lessonQuestions = [];

    this.lessonsService.getPreguntas(cursoId, leccionId).subscribe({
      next: (data) => {
        this.lessonQuestions = Array.isArray(data) ? data : [];
        this.questionsLoading = false;
      },
      error: (err) => {
        this.questionsError = err?.error?.message || 'No se pudieron cargar las preguntas';
        this.questionsLoading = false;
      }
    });
  }

  submitQuestion(): void {
    if (!this.courseId || !this.selectedLesson || !(this.selectedLesson._id || this.selectedLesson.id)) {
      return;
    }
    const contenido = (this.newQuestion || '').trim();
    if (!contenido) {
      return;
    }
    const cursoId = this.courseId;
    const leccionId = this.selectedLesson._id || this.selectedLesson.id;
    this.questionSubmitting = true;

    this.lessonsService.crearPregunta(cursoId, leccionId, contenido).subscribe({
      next: (created) => {
        this.lessonQuestions = [created, ...this.lessonQuestions];
        this.newQuestion = '';
        this.questionSubmitting = false;
      },
      error: (err) => {
        this.questionsError = err?.error?.message || 'No se pudo enviar la pregunta';
        this.questionSubmitting = false;
      }
    });
  }

  toggleLessonCompleted(): void {
    if (!this.courseId || !this.selectedLesson || !(this.selectedLesson._id || this.selectedLesson.id)) {
      return;
    }
    const cursoId = this.courseId;
    const leccionId = this.selectedLesson._id || this.selectedLesson.id;
    this.markingLesson = true;
    this.markLessonMessage = '';

    const currentlyCompleted = !!this.selectedLesson.completada;
    const request$ = currentlyCompleted
      ? this.lessonsService.desmarcarLeccion(cursoId, leccionId)
      : this.lessonsService.completarLeccion(cursoId, leccionId, { tiempo_visto: 0 });

    request$.subscribe({
      next: (progreso) => {
        this.markingLesson = false;
        this.selectedLesson = { ...this.selectedLesson, completada: !currentlyCompleted };
        this.lessons = this.lessons.map(l =>
          (l._id || l.id) === leccionId ? { ...l, completada: !currentlyCompleted } : l
        );
        this.courseProgress = typeof progreso?.progreso_general === 'number' ? progreso.progreso_general : this.courseProgress;

        if (!currentlyCompleted) {
          this.markLessonMessage = 'Lección marcada como completada';
          if ((this.courseProgress || 0) >= 100) {
            this.triggerCelebration();
          }
        } else {
          this.markLessonMessage = 'Lección marcada como pendiente';
          if ((this.courseProgress || 0) < 100) {
            this.showCelebration = false;
          }
        }
      },
      error: (err) => {
        this.markingLesson = false;
        this.markLessonMessage = err?.error?.message || (currentlyCompleted
          ? 'No se pudo marcar la lección como pendiente'
          : 'No se pudo marcar la lección como completada');
      }
    });
  }

  private triggerCelebration(): void {
    this.showCelebration = true;
    setTimeout(() => {
      this.showCelebration = false;
    }, 6000);
  }
}
