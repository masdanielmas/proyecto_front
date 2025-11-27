import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AuthenticationService, User } from './authentication.service';
import { CoursesService } from './courses.service';
import { UsersService } from './users.service';
import { CategoriesService } from './categories.service';
import { LessonsService } from './lessons.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="flex">
        <app-sidebar></app-sidebar>
        <main class="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">
          <div class="mx-auto max-w-7xl">
            <div class="mb-6">
              <h1 class="text-2xl font-semibold text-gray-800">Panel del Profesor</h1>
              <p class="mt-2 text-gray-600">Bienvenido, {{ user?.nombre || user?.usuario }}.</p>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <!-- Gestionar cursos -->
              <section class="rounded-lg border bg-white p-5 shadow-sm flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">Gestionar cursos</h2>
                    <p class="mt-1 text-sm text-gray-600">Listado de cursos creados por ti.</p>
                  </div>
                  <button
                    class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                    (click)="loadCourses()"
                  >
                    Ver cursos
                  </button>
                </div>

                <div *ngIf="coursesLoading" class="text-sm text-gray-500">Cargando cursos...</div>
                <div *ngIf="coursesError" class="text-sm text-red-600">{{ coursesError }}</div>

                <div *ngIf="!coursesLoading && courses.length === 0" class="text-sm text-gray-500">
                  Aún no hay cursos registrados.
                </div>

                <div *ngIf="courses.length > 0" class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="border-b text-left text-gray-700">
                        <th class="py-2 pr-2">ID</th>
                        <th class="py-2 pr-2">Título</th>
                        <th class="py-2 pr-2">Descripción</th>
                        <th class="py-2 pr-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let c of courses" class="border-b last:border-0">
                        <td class="py-1 pr-2 text-gray-500">{{ c._id || c.id }}</td>
                        <td class="py-1 pr-2 font-medium text-gray-900">{{ c.titulo || c.nombre || 'Sin título' }}</td>
                        <td class="py-1 pr-2 text-gray-600 line-clamp-2">{{ c.descripcion || c.description || 'Sin descripción' }}</td>
                        <td class="py-1 pr-2 text-right space-x-2">
                          <button
                            class="rounded-md bg-slate-600 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                            (click)="showCourseDetails(c)"
                          >
                            Detalles
                          </button>
                          <button
                            class="rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                            (click)="startEditCourse(c)"
                          >
                            Editar
                          </button>
                          <button
                            class="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                            (click)="deleteCourse(c)"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- Registrar / editar curso -->
              <section class="rounded-lg border bg-white p-5 shadow-sm">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ editingCourse ? 'Editar curso' : 'Registrar nuevo curso' }}
                </h2>
                <p class="mt-1 text-sm text-gray-600">
                  {{ editingCourse ? 'Actualiza la información del curso seleccionado.' : 'Completa los campos para crear un curso.' }}
                </p>

                <form class="mt-4 space-y-3" (ngSubmit)="submitCourse()">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      [(ngModel)]="courseForm.titulo"
                      name="titulo"
                      class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Nombre del curso"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      [(ngModel)]="courseForm.descripcion"
                      name="descripcion"
                      rows="3"
                      class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Descripción breve del curso"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                    <select
                      [(ngModel)]="courseForm.nivel"
                      name="nivel"
                      class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      required
                    >
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                      <input
                        type="number"
                        [(ngModel)]="courseForm.precio"
                        name="precio"
                        min="0"
                        step="0.01"
                        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                      <input
                        type="number"
                        [(ngModel)]="courseForm.duracion"
                        name="duracion"
                        min="1"
                        step="1"
                        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Ej. 120"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Miniatura (URL)</label>
                    <input
                      type="url"
                      [(ngModel)]="courseForm.miniatura"
                      name="miniatura"
                      class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="https://.../imagen.jpg"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      [(ngModel)]="courseForm.categoria"
                      name="categoria"
                      class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      required
                    >
                      <option value="" disabled>Selecciona una categoría</option>
                      <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name || cat.nombre }}</option>
                    </select>
                  </div>

                  <div class="flex items-center justify-between pt-2">
                    <div class="text-xs text-gray-500" *ngIf="courseMessage">{{ courseMessage }}</div>
                    <div class="space-x-2 ml-auto">
                      <button
                        type="button"
                        *ngIf="editingCourse"
                        class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        (click)="cancelEdit()"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        [disabled]="courseSaving"
                      >
                        {{ editingCourse ? 'Guardar cambios' : 'Crear curso' }}
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              <!-- Gestionar estudiantes -->
              <section class="rounded-lg border bg-white p-5 shadow-sm flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">Gestionar estudiantes</h2>
                    <p class="mt-1 text-sm text-gray-600">Usuarios con rol estudiante.</p>
                  </div>
                  <button
                    class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                    (click)="loadStudents()"
                  >
                    Ver estudiantes
                  </button>
                </div>

                <div *ngIf="studentsLoading" class="text-sm text-gray-500">Cargando estudiantes...</div>
                <div *ngIf="studentsError" class="text-sm text-red-600">{{ studentsError }}</div>

                <div *ngIf="!studentsLoading && students.length === 0" class="text-sm text-gray-500">
                  No se encontraron estudiantes.
                </div>

                <div *ngIf="students.length > 0" class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="border-b text-left text-gray-700">
                        <th class="py-2 pr-2">ID</th>
                        <th class="py-2 pr-2">Usuario</th>
                        <th class="py-2 pr-2">Nombre</th>
                        <th class="py-2 pr-2">Correo</th>
                        <th class="py-2 pr-2 text-right">Cursos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let s of students" class="border-b last:border-0">
                        <td class="py-1 pr-2 text-gray-500">{{ s._id || s.id }}</td>
                        <td class="py-1 pr-2 font-medium text-gray-900">{{ s.usuario }}</td>
                        <td class="py-1 pr-2 text-gray-700">{{ s.nombre }} {{ s.apellido }}</td>
                        <td class="py-1 pr-2 text-gray-600">{{ s.correo }}</td>
                        <td class="py-1 pr-2 text-right">
                          <button
                            class="rounded-md bg-slate-600 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                            (click)="viewStudentCourses(s)"
                          >
                            Ver cursos
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="selectedStudent" class="mt-4 border-t pt-3 text-sm">
                  <h3 class="font-semibold text-gray-900 mb-1">
                    Cursos de {{ selectedStudent.nombre }} {{ selectedStudent.apellido }}
                  </h3>
                  <div *ngIf="selectedStudentCoursesLoading" class="text-gray-500">Cargando cursos...</div>
                  <div *ngIf="selectedStudentCoursesError" class="text-red-600">{{ selectedStudentCoursesError }}</div>
                  <div *ngIf="!selectedStudentCoursesLoading && !selectedStudentCoursesError && selectedStudentCourses.length === 0" class="text-gray-500">
                    Este estudiante no está inscrito en ningún curso.
                  </div>
                  <ul *ngIf="selectedStudentCourses.length > 0" class="mt-1 space-y-1">
                    <li *ngFor="let c of selectedStudentCourses" class="rounded border px-2 py-1">
                      <div class="font-medium text-gray-900">{{ c.titulo || 'Sin título' }}</div>
                      <div class="text-xs text-gray-500">Duración: {{ c.duracion || 0 }} min · Nivel: {{ c.nivel || 'N/D' }}</div>
                    </li>
                  </ul>
                </div>
              </section>


            </div>

            <section *ngIf="selectedCourse" class="mt-6 rounded-lg border bg-white p-5 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Detalles del curso</h2>
                  <p class="mt-1 text-sm text-gray-600">
                    Información ampliada del curso seleccionado desde la tabla.
                  </p>
                </div>
                <button
                  class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  (click)="selectedCourse = null"
                >
                  Cerrar
                </button>
              </div>

              <dl class="mt-4 grid grid-cols-1 gap-y-2 gap-x-6 sm:grid-cols-2 text-sm">
                <div>
                  <dt class="font-medium text-gray-700">ID</dt>
                  <dd class="text-gray-900">{{ selectedCourse._id || selectedCourse.id }}</dd>
                </div>
                <div>
                  <dt class="font-medium text-gray-700">Título</dt>
                  <dd class="text-gray-900">{{ selectedCourse.titulo || selectedCourse.nombre || 'Sin título' }}</dd>
                </div>
                <div>
                  <dt class="font-medium text-gray-700">Descripción</dt>
                  <dd class="text-gray-700">{{ selectedCourse.descripcion || selectedCourse.description || 'Sin descripción' }}</dd>
                </div>
                <div *ngIf="selectedCourse.nivel">
                  <dt class="font-medium text-gray-700">Nivel</dt>
                  <dd class="text-gray-900">{{ selectedCourse.nivel }}</dd>
                </div>
                <div *ngIf="selectedCourse.categoria">
                  <dt class="font-medium text-gray-700">Categoría</dt>
                  <dd class="text-gray-900">{{ selectedCourse.categoria }}</dd>
                </div>
                <div *ngIf="selectedCourse.duracion">
                  <dt class="font-medium text-gray-700">Duración</dt>
                  <dd class="text-gray-900">{{ selectedCourse.duracion }}</dd>
                </div>
              </dl>

              <div class="mt-6 border-t pt-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-base font-semibold text-gray-900">Lecciones</h3>
                  <button
                    class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    (click)="reloadLessons()"
                  >
                    Recargar lecciones
                  </button>
                </div>

                <div *ngIf="lessonsLoading" class="text-sm text-gray-500">Cargando lecciones...</div>
                <div *ngIf="lessonsError" class="text-sm text-red-600">{{ lessonsError }}</div>

                <div *ngIf="!lessonsLoading && !lessonsError && lessons.length === 0" class="text-sm text-gray-500">
                  Este curso aún no tiene lecciones registradas.
                </div>

                <ul *ngIf="lessons.length > 0" class="mt-2 space-y-2 text-sm">
                  <li *ngFor="let l of lessons" class="flex items-center justify-between rounded border px-3 py-2">
                    <div>
                      <p class="font-medium text-gray-900">{{ l.titulo || 'Sin título' }}</p>
                      <p class="text-xs text-gray-500">Orden: {{ l.orden }} · Duración: {{ l.duracion }} min</p>
                    </div>
                    <div class="space-x-2">
                      <button
                        class="rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                        (click)="startEditLesson(l)"
                      >
                        Editar
                      </button>
                      <button
                        class="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        (click)="deleteLesson(l)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                </ul>

                <form class="mt-4 space-y-2 text-sm" (ngSubmit)="submitLesson()">
                  <h4 class="font-semibold text-gray-900 mb-1">
                    {{ editingLesson ? 'Editar lección' : 'Nueva lección' }}
                  </h4>
                  <div>
                    <label class="block mb-1 text-gray-700">Título</label>
                    <input
                      type="text"
                      [(ngModel)]="lessonForm.titulo"
                      name="lessonTitulo"
                      class="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block mb-1 text-gray-700">Orden</label>
                      <input
                        type="number"
                        [(ngModel)]="lessonForm.orden"
                        name="lessonOrden"
                        min="1"
                        class="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label class="block mb-1 text-gray-700">Duración (min)</label>
                      <input
                        type="number"
                        [(ngModel)]="lessonForm.duracion"
                        name="lessonDuracion"
                        min="1"
                        class="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block mb-1 text-gray-700">Contenido</label>
                    <textarea
                      [(ngModel)]="lessonForm.contenido"
                      name="lessonContenido"
                      rows="2"
                      class="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block mb-1 text-gray-700">URL de video (YouTube)</label>
                    <input
                      type="url"
                      [(ngModel)]="lessonForm.urlVideo"
                      name="lessonUrlVideo"
                      class="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div class="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      *ngIf="editingLesson"
                      class="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      (click)="cancelEditLesson()"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      class="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      [disabled]="lessonSaving"
                    >
                      {{ editingLesson ? 'Guardar lección' : 'Crear lección' }}
                    </button>
                  </div>
                  <div class="text-xs text-gray-500" *ngIf="lessonMessage">{{ lessonMessage }}</div>
                </form>
              </div>
            </section>

            <!-- Preguntas de lecciones -->
            <section class="mt-6 rounded-lg border bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Preguntas de lecciones</h2>
                  <p class="mt-1 text-sm text-gray-600">Selecciona un curso y una lección para ver y responder las preguntas de los estudiantes.</p>
                </div>
                <button
                  class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  (click)="loadCourses()"
                >
                  Cargar cursos
                </button>
              </div>

              <div class="text-sm" *ngIf="coursesLoading">Cargando cursos...</div>
              <div class="text-sm text-red-600" *ngIf="coursesError">{{ coursesError }}</div>

              <div class="mt-2 space-y-3">
                <div>
                  <h3 class="mb-1 text-xs font-semibold text-gray-700">Cursos</h3>
                  <div *ngIf="courses.length === 0" class="text-xs text-gray-500">Aún no tienes cursos creados.</div>
                  <div *ngIf="courses.length > 0" class="flex flex-wrap gap-2">
                    <button
                      *ngFor="let c of courses"
                      class="rounded-full border px-3 py-1 text-xs"
                      [ngClass]="{
                        'bg-blue-600 text-white border-blue-600': qaSelectedCourse && (qaSelectedCourse._id || qaSelectedCourse.id) === (c._id || c.id),
                        'bg-white text-gray-700 border-gray-300 hover:bg-gray-50': !qaSelectedCourse || (qaSelectedCourse._id || qaSelectedCourse.id) !== (c._id || c.id)
                      }"
                      (click)="selectQaCourse(c)"
                    >
                      {{ c.titulo || c.nombre || 'Curso' }}
                    </button>
                  </div>
                </div>

                <div *ngIf="qaSelectedCourse">
                  <h3 class="mb-1 text-xs font-semibold text-gray-700">Lecciones del curso seleccionado</h3>
                  <div *ngIf="qaLoadingLessons" class="text-xs text-gray-500">Cargando lecciones...</div>
                  <div *ngIf="!qaLoadingLessons && qaLessons.length === 0" class="text-xs text-gray-500">Este curso no tiene lecciones.</div>
                  <ul *ngIf="qaLessons.length > 0" class="mt-1 flex flex-wrap gap-2 text-xs">
                    <li
                      *ngFor="let l of qaLessons"
                      class="cursor-pointer rounded border px-2 py-1"
                      [ngClass]="{
                        'border-blue-600 bg-blue-50 text-blue-700': qaSelectedLesson && (qaSelectedLesson._id || qaSelectedLesson.id) === (l._id || l.id),
                        'border-gray-300 text-gray-700 hover:bg-gray-50': !qaSelectedLesson || (qaSelectedLesson._id || qaSelectedLesson.id) !== (l._id || l.id)
                      }"
                      (click)="selectQaLesson(l)"
                    >
                      {{ l.orden }}. {{ l.titulo || 'Lección' }}
                    </li>
                  </ul>
                </div>

                <div *ngIf="qaSelectedLesson" class="mt-2 border-t pt-3 text-sm">
                  <h3 class="font-semibold text-gray-900 mb-1">Preguntas de la lección: {{ qaSelectedLesson.titulo || 'Lección' }}</h3>
                  <div *ngIf="qaLoadingQuestions" class="text-xs text-gray-500">Cargando preguntas...</div>
                  <div *ngIf="qaError" class="text-xs text-red-600">{{ qaError }}</div>
                  <div *ngIf="!qaLoadingQuestions && !qaError && qaQuestions.length === 0" class="text-xs text-gray-500">
                    Aún no hay preguntas para esta lección.
                  </div>
                  <ul *ngIf="qaQuestions.length > 0" class="mt-1 space-y-2">
                    <li *ngFor="let q of qaQuestions" class="rounded border px-3 py-2 text-xs">
                      <div class="text-gray-700">
                        <span class="font-semibold">{{ q.autor?.nombre }} {{ q.autor?.apellido }}</span>
                        <span class="ml-1 text-[11px] text-gray-500" *ngIf="q.estado">· {{ q.estado }}</span>
                      </div>
                      <div class="mt-0.5 text-gray-900 whitespace-pre-line">{{ q.contenido }}</div>
                      <div *ngIf="q.respuestas?.length" class="mt-1 border-l pl-2 space-y-1">
                        <div *ngFor="let r of q.respuestas" class="text-[11px] text-gray-800">
                          <span class="font-semibold">{{ r.autor?.nombre }} {{ r.autor?.apellido }}</span>
                          <span *ngIf="r.es_respuesta_instructor" class="ml-1 rounded bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700">Profesor</span>
                          : {{ r.contenido }}
                        </div>
                      </div>
                      <div class="mt-2">
                        <textarea
                          [(ngModel)]="qaAnswers[q._id]"
                          rows="2"
                          placeholder="Escribe tu respuesta"
                          class="block w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        ></textarea>
                        <div class="mt-1 flex justify-end">
                          <button
                            class="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                            (click)="submitQaAnswer(q)"
                          >
                            Responder
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class TeacherDashboardComponent implements OnInit {
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private usersService = inject(UsersService);
  private categoriesService = inject(CategoriesService);
  private lessonsService = inject(LessonsService);
  user: User | null = null;

  // Cursos
  courses: any[] = [];
  coursesLoading = false;
  coursesError = '';
  editingCourse: any | null = null;
  courseForm: { titulo: string; descripcion: string; nivel: string; precio: number | null; duracion: number | null; miniatura: string; categoria: string } = { titulo: '', descripcion: '', nivel: 'principiante', precio: null, duracion: null, miniatura: '', categoria: '' };
  courseSaving = false;
  courseMessage = '';
  selectedCourse: any | null = null;

  // Lecciones del curso seleccionado
  lessons: any[] = [];
  lessonsLoading = false;
  lessonsError = '';
  editingLesson: any | null = null;
  lessonForm: { titulo: string; orden: number | null; duracion: number | null; contenido: string; urlVideo: string } = { titulo: '', orden: null, duracion: null, contenido: '', urlVideo: '' };
  lessonSaving = false;
  lessonMessage = '';

  // Estudiantes
  students: any[] = [];
  studentsLoading = false;
  studentsError = '';
  selectedStudent: any | null = null;
  selectedStudentCourses: any[] = [];
  selectedStudentCoursesLoading = false;
  selectedStudentCoursesError = '';
  // Pestaña de preguntas
  teacherTab: 'principal' | 'preguntas' = 'principal';
  qaSelectedCourse: any | null = null;
  qaLessons: any[] = [];
  qaSelectedLesson: any | null = null;
  qaQuestions: any[] = [];
  qaLoadingLessons = false;
  qaLoadingQuestions = false;
  qaError = '';
  qaAnswers: { [preguntaId: string]: string } = {};
  categories: any[] = [];

  ngOnInit(): void {
    const user = this.authService.currentUserValue as any;
    if (!user || (user.rol !== 'instructor' && user.rol !== 'profesor')) {
      this.router.navigate(['/login-profesor']);
      return;
    }
    this.user = user;
    this.loadCategories();
  }

  showCourseDetails(course: any): void {
    this.selectedCourse = course;
    this.loadLessonsForSelectedCourse();
  }

  // Cursos
  loadCourses(): void {
    this.coursesLoading = true;
    this.coursesError = '';
    this.coursesService.getAll().subscribe({
      next: (data) => {
        this.courses = Array.isArray(data) ? data : [];
        this.coursesLoading = false;
        if (this.selectedCourse) {
          const id = this.selectedCourse._id || this.selectedCourse.id;
          this.selectedCourse = this.courses.find(c => (c._id || c.id) === id) || null;
        }
      },
      error: (err) => {
        this.coursesError = err?.error?.message || 'No se pudieron cargar los cursos';
        this.coursesLoading = false;
      }
    });
  }

  viewStudentCourses(student: any): void {
    const id = student._id || student.id;
    if (!id) {
      return;
    }
    this.selectedStudent = student;
    this.selectedStudentCourses = [];
    this.selectedStudentCoursesError = '';
    this.selectedStudentCoursesLoading = true;

    this.usersService.getCursosInscritos(id).subscribe({
      next: (data) => {
        this.selectedStudentCourses = Array.isArray(data) ? data : [];
        this.selectedStudentCoursesLoading = false;
      },
      error: (err) => {
        this.selectedStudentCoursesError = err?.error?.message || 'No se pudieron cargar los cursos del estudiante';
        this.selectedStudentCoursesLoading = false;
      }
    });
  }

  startEditLesson(lesson: any): void {
    this.editingLesson = lesson;
    this.lessonForm = {
      titulo: lesson.titulo || '',
      orden: typeof lesson.orden === 'number' ? lesson.orden : (lesson.orden ? Number(lesson.orden) : null),
      duracion: typeof lesson.duracion === 'number' ? lesson.duracion : (lesson.duracion ? Number(lesson.duracion) : null),
      contenido: lesson.contenido || '',
      urlVideo: lesson.urlVideo || ''
    };
    this.lessonMessage = '';
  }

  cancelEditLesson(): void {
    this.editingLesson = null;
    this.lessonForm = { titulo: '', orden: null, duracion: null, contenido: '', urlVideo: '' };
    this.lessonMessage = '';
  }

  submitLesson(): void {
    if (!this.selectedCourse) {
      this.lessonMessage = 'Selecciona un curso primero';
      return;
    }
    if (!this.lessonForm.titulo?.trim()) {
      this.lessonMessage = 'El título es obligatorio';
      return;
    }
    if (this.lessonForm.orden == null || isNaN(Number(this.lessonForm.orden))) {
      this.lessonMessage = 'El orden es obligatorio';
      return;
    }
    if (this.lessonForm.duracion == null || isNaN(Number(this.lessonForm.duracion))) {
      this.lessonMessage = 'La duración es obligatoria';
      return;
    }

    const cursoId = this.selectedCourse._id || this.selectedCourse.id;
    if (!cursoId) {
      this.lessonMessage = 'Curso inválido';
      return;
    }

    const payload: any = {
      titulo: this.lessonForm.titulo.trim(),
      orden: Number(this.lessonForm.orden),
      duracion: Number(this.lessonForm.duracion),
      contenido: this.lessonForm.contenido?.trim() || '',
      urlVideo: this.lessonForm.urlVideo?.trim() || ''
    };

    this.lessonSaving = true;
    this.lessonMessage = '';

    if (this.editingLesson && (this.editingLesson._id || this.editingLesson.id)) {
      const leccionId = this.editingLesson._id || this.editingLesson.id;
      this.lessonsService.update(cursoId, leccionId, payload).subscribe({
        next: (updated) => {
          this.lessonMessage = 'Lección actualizada correctamente';
          this.lessonSaving = false;
          this.lessons = this.lessons.map(l => (l._id || l.id) === leccionId ? { ...l, ...updated } : l);
          this.cancelEditLesson();
        },
        error: (err) => {
          this.lessonMessage = err?.error?.message || 'No se pudo actualizar la lección';
          this.lessonSaving = false;
        }
      });
    } else {
      this.lessonsService.create(cursoId, payload).subscribe({
        next: (created) => {
          this.lessonMessage = 'Lección creada correctamente';
          this.lessonSaving = false;
          this.lessons.push(created);
          this.lessonForm = { titulo: '', orden: null, duracion: null, contenido: '', urlVideo: '' };
        },
        error: (err) => {
          this.lessonMessage = err?.error?.message || 'No se pudo crear la lección';
          this.lessonSaving = false;
        }
      });
    }
  }

  deleteLesson(lesson: any): void {
    if (!this.selectedCourse) {
      return;
    }
    const cursoId = this.selectedCourse._id || this.selectedCourse.id;
    const leccionId = lesson._id || lesson.id;
    if (!cursoId || !leccionId) {
      return;
    }
    if (!confirm('¿Seguro que quieres eliminar esta lección?')) return;

    this.lessonsService.delete(cursoId, leccionId).subscribe({
      next: () => {
        this.lessons = this.lessons.filter(l => (l._id || l.id) !== leccionId);
      },
      error: (err) => {
        alert(err?.error?.message || 'No se pudo eliminar la lección');
      }
    });
  }

  private loadLessonsForSelectedCourse(): void {
    this.lessons = [];
    this.lessonsError = '';
    if (!this.selectedCourse) {
      return;
    }
    const id = this.selectedCourse._id || this.selectedCourse.id;
    if (!id) {
      return;
    }
    this.lessonsLoading = true;
    this.lessonsService.getAll(id).subscribe({
      next: (data) => {
        this.lessons = Array.isArray(data) ? data : [];
        this.lessonsLoading = false;
      },
      error: (err) => {
        this.lessonsError = err?.error?.message || 'No se pudieron cargar las lecciones';
        this.lessonsLoading = false;
      }
    });
  }

  reloadLessons(): void {
    this.loadLessonsForSelectedCourse();
  }

  teacherTabClass(tab: 'principal' | 'preguntas') {
    const base = 'border-b-2 px-3 py-2 text-sm font-medium';
    const active = 'border-blue-600 text-blue-600';
    const inactive = 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300';
    return `${base} ${this.teacherTab === tab ? active : inactive}`;
  }

  selectQaCourse(course: any): void {
    this.qaSelectedCourse = course;
    this.qaSelectedLesson = null;
    this.qaLessons = [];
    this.qaQuestions = [];
    this.qaError = '';
    if (!course || !(course._id || course.id)) {
      return;
    }
    const id = course._id || course.id;
    this.qaLoadingLessons = true;
    this.lessonsService.getAll(id).subscribe({
      next: (data) => {
        this.qaLessons = Array.isArray(data) ? data : [];
        this.qaLoadingLessons = false;
      },
      error: (err) => {
        this.qaError = err?.error?.message || 'No se pudieron cargar las lecciones para preguntas';
        this.qaLoadingLessons = false;
      }
    });
  }

  selectQaLesson(lesson: any): void {
    this.qaSelectedLesson = lesson;
    this.qaQuestions = [];
    this.qaError = '';
    if (!this.qaSelectedCourse || !lesson || !(lesson._id || lesson.id)) {
      return;
    }
    const cursoId = this.qaSelectedCourse._id || this.qaSelectedCourse.id;
    const leccionId = lesson._id || lesson.id;
    this.qaLoadingQuestions = true;
    this.lessonsService.getPreguntas(cursoId, leccionId).subscribe({
      next: (data) => {
        this.qaQuestions = Array.isArray(data) ? data : [];
        this.qaLoadingQuestions = false;
      },
      error: (err) => {
        this.qaError = err?.error?.message || 'No se pudieron cargar las preguntas';
        this.qaLoadingQuestions = false;
      }
    });
  }

  submitQaAnswer(pregunta: any): void {
    if (!this.qaSelectedCourse || !this.qaSelectedLesson) {
      return;
    }
    const contenido = (this.qaAnswers[pregunta._id] || '').trim();
    if (!contenido) {
      return;
    }
    const cursoId = this.qaSelectedCourse._id || this.qaSelectedCourse.id;
    const leccionId = this.qaSelectedLesson._id || this.qaSelectedLesson.id;
    const preguntaId = pregunta._id || pregunta.id;

    this.lessonsService.responderPregunta(cursoId, leccionId, preguntaId, contenido).subscribe({
      next: (updated) => {
        this.qaQuestions = this.qaQuestions.map(q => (q._id || q.id) === (updated._id || updated.id) ? updated : q);
        this.qaAnswers[pregunta._id] = '';
      },
      error: (err) => {
        this.qaError = err?.error?.message || 'No se pudo enviar la respuesta';
      }
    });
  }

  startEditCourse(course: any): void {
    this.editingCourse = course;
    this.courseForm = {
      titulo: course.titulo || course.nombre || '',
      descripcion: course.descripcion || course.description || '',
      nivel: course.nivel || 'principiante',
      precio: typeof course.precio === 'number' ? course.precio : (course.precio ? Number(course.precio) : null),
      duracion: typeof course.duracion === 'number' ? course.duracion : (course.duracion ? Number(course.duracion) : null),
      miniatura: course.miniatura || '',
      categoria: (course.categoria && (course.categoria._id || course.categoria)) || ''
    };
    this.courseMessage = '';
  }

  cancelEdit(): void {
    this.editingCourse = null;
    this.courseForm = { titulo: '', descripcion: '', nivel: 'principiante', precio: null, duracion: null, miniatura: '', categoria: '' };
    this.courseMessage = '';
  }

  submitCourse(): void {
    if (!this.courseForm.titulo?.trim()) {
      this.courseMessage = 'El título es obligatorio';
      return;
    }
    if (!this.courseForm.descripcion?.trim()) {
      this.courseMessage = 'La descripción es obligatoria';
      return;
    }
    if (!this.courseForm.nivel) {
      this.courseMessage = 'El nivel es obligatorio';
      return;
    }
    if (this.courseForm.precio == null || isNaN(Number(this.courseForm.precio))) {
      this.courseMessage = 'El precio es obligatorio';
      return;
    }
    if (this.courseForm.duracion == null || isNaN(Number(this.courseForm.duracion))) {
      this.courseMessage = 'La duración es obligatoria';
      return;
    }
    if (!this.courseForm.miniatura?.trim()) {
      this.courseMessage = 'La miniatura es obligatoria';
      return;
    }
    if (!this.courseForm.categoria?.trim()) {
      this.courseMessage = 'La categoría es obligatoria';
      return;
    }

    const payload: any = {
      titulo: this.courseForm.titulo.trim(),
      descripcion: this.courseForm.descripcion.trim(),
      nivel: this.courseForm.nivel,
      precio: Number(this.courseForm.precio),
      duracion: Number(this.courseForm.duracion),
      miniatura: this.courseForm.miniatura.trim(),
      categoria: this.courseForm.categoria.trim(),
      estaPublicado: true,
    };

    this.courseSaving = true;
    this.courseMessage = '';

    if (this.editingCourse && (this.editingCourse._id || this.editingCourse.id)) {
      const id = this.editingCourse._id || this.editingCourse.id;
      this.coursesService.update(id, payload).subscribe({
        next: (updated) => {
          this.courseMessage = 'Curso actualizado correctamente';
          this.courseSaving = false;
          // Actualizar lista local
          this.courses = this.courses.map(c =>
            (c._id || c.id) === id ? { ...c, ...updated } : c
          );
          this.cancelEdit();
        },
        error: (err) => {
          this.courseMessage = err?.error?.message || 'No se pudo actualizar el curso';
          this.courseSaving = false;
        }
      });
    } else {
      this.coursesService.create(payload).subscribe({
        next: (created) => {
          this.courseMessage = 'Curso creado correctamente';
          this.courseSaving = false;
          this.courses.push(created);
          this.courseForm = { titulo: '', descripcion: '', nivel: 'principiante', precio: null, duracion: null, miniatura: '', categoria: '' };
        },
        error: (err) => {
          this.courseMessage = err?.error?.message || 'No se pudo crear el curso';
          this.courseSaving = false;
        }
      });
    }
  }

  deleteCourse(course: any): void {
    const id = course._id || course.id;
    if (!id) return;
    if (!confirm('¿Seguro que quieres eliminar este curso?')) return;

    this.coursesService.delete(id).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => (c._id || c.id) !== id);
      },
      error: (err) => {
        alert(err?.error?.message || 'No se pudo eliminar el curso');
      }
    });
  }

  // Estudiantes
  loadStudents(): void {
    this.studentsLoading = true;
    this.studentsError = '';
    this.usersService.getUsers().subscribe({
      next: (data) => {
        const arr = Array.isArray(data) ? data : [];
        this.students = arr.filter((u: any) => {
          const roleRaw = (u.rol ?? u.role ?? u.tipo ?? '').toString().toLowerCase();
          return ['student', 'estudiante', 'alumno'].includes(roleRaw);
        });
        this.studentsLoading = false;
      },
      error: (err) => {
        this.studentsError = err?.error?.message || 'No se pudieron cargar los estudiantes';
        this.studentsLoading = false;
      }
    });
  }

  removeStudent(student: any): void {
    const id = student._id || student.id;
    if (!id) return;
    if (!confirm('¿Seguro que quieres eliminar este estudiante?')) return;

    this.usersService.eliminarUsuario(id).subscribe({
      next: () => {
        this.students = this.students.filter(s => (s._id || s.id) !== id);
      },
      error: (err) => {
        alert(err?.error?.message || 'No se pudo eliminar el estudiante');
      }
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (data) => {
        this.categories = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }
}
