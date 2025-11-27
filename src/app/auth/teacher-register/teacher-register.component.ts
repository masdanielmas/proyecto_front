import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { first } from 'rxjs/operators';

interface TeacherForm {
  nombre: FormControl<string>;
  apellido: FormControl<string>;
  usuario: FormControl<string>;
  correo: FormControl<string>;
  pais: FormControl<string>;
  clave: FormControl<string>;
}

@Component({
  selector: 'app-teacher-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './teacher-register.component.html'
})
export class TeacherRegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthenticationService);
  private router = inject(Router);

  loading = false;
  submitted = false;
  error = '';

  form: FormGroup<TeacherForm> = this.fb.group({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    pais: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    clave: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;

    this.loading = true;
    const payload = this.form.getRawValue();

    this.auth.registerTeacher(payload)
      .pipe(first())
      .subscribe({
        next: () => {
          // tras registro exitoso, redirigimos a login o dashboard
          this.loading = false;
          // Ya quedamos autenticados en registerTeacher, ir al panel del profesor
          this.router.navigate(['/profesor']);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err?.error?.message || 'No se pudo registrar el profesor';
        }
      });
  }
}
