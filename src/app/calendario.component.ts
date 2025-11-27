import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="flex">
        <app-sidebar></app-sidebar>

        <main class="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">
          <div class="mx-auto max-w-7xl">
            <h1 class="mb-6 text-2xl font-semibold text-gray-800">Calendario</h1>
            <div class="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <button (click)="prevMonth()" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Anterior</button>
                <div class="text-lg font-medium text-gray-800">{{ monthName }} {{ currentYear }}</div>
                <button (click)="nextMonth()" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Siguiente</button>
              </div>

              <div class="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
                <div *ngFor="let d of weekDays" class="py-2">{{ d }}</div>
              </div>

              <div class="mt-1 grid grid-cols-7 gap-2">
                <div *ngFor="let day of days" class="min-h-20 rounded border p-2 text-sm"
                     [ngClass]="{ 'bg-white': day.isCurrentMonth, 'bg-gray-50 text-gray-400': !day.isCurrentMonth }">
                  <div class="flex items-center justify-between">
                    <span>{{ day.date.getDate() }}</span>
                    <span *ngIf="day.pendingCount > 0" class="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{{ day.pendingCount }}</span>
                  </div>
                  <div class="mt-2 space-y-1">
                    <div *ngFor="let t of day.previewTasks" class="truncate text-xs" [title]="t.title">
                      • {{ t.title }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
              <h2 class="mb-3 text-lg font-semibold text-gray-800">Tareas pendientes del mes</h2>
              <div *ngIf="monthPendingTasks.length === 0" class="text-sm text-gray-500">No hay tareas pendientes este mes.</div>
              <ul class="divide-y">
                <li *ngFor="let t of monthPendingTasks" class="py-2 text-sm">
                  <span class="font-medium text-gray-800">{{ t.title }}</span>
                  <span class="ml-2 text-gray-500">({{ t.date | date:'mediumDate' }})</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class CalendarioComponent {
  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  days: Array<{ date: Date; isCurrentMonth: boolean; pendingCount: number; previewTasks: { title: string }[] }> = [];

  tasks: Array<{ title: string; date: Date; status: 'pending' | 'done' }> = [
    { title: 'Entregar actividad de curso', date: new Date(new Date().getFullYear(), new Date().getMonth(), 10), status: 'pending' },
    { title: 'Reunión de proyecto', date: new Date(new Date().getFullYear(), new Date().getMonth(), 15), status: 'done' },
    { title: 'Examen parcial', date: new Date(new Date().getFullYear(), new Date().getMonth(), 22), status: 'pending' },
  ];

  get monthName(): string {
    return new Date(this.currentYear, this.currentMonth, 1).toLocaleDateString('es-ES', { month: 'long' }).replace(/^./, c => c.toUpperCase());
  }

  get monthPendingTasks() {
    return this.tasks.filter(t => t.status === 'pending' && t.date.getFullYear() === this.currentYear && t.date.getMonth() === this.currentMonth)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  constructor() {
    this.buildCalendar();
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
    this.buildCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.buildCalendar();
  }

  private buildCalendar() {
    const firstOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const prevMonthDays = startDay;
    const totalCells = Math.ceil((prevMonthDays + daysInMonth) / 7) * 7;

    const startDate = new Date(this.currentYear, this.currentMonth, 1 - prevMonthDays);
    const cells: Array<{ date: Date; isCurrentMonth: boolean; pendingCount: number; previewTasks: { title: string }[] }> = [];

    for (let i = 0; i < totalCells; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const isCurrentMonth = d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear;
      const dayTasks = this.tasks.filter(t => t.status === 'pending' && this.sameDate(t.date, d));
      cells.push({
        date: d,
        isCurrentMonth,
        pendingCount: dayTasks.length,
        previewTasks: dayTasks.slice(0, 2).map(t => ({ title: t.title })),
      });
    }

    this.days = cells;
  }

  private sameDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
