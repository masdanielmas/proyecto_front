import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { first } from 'rxjs/operators';

interface StudentForm {
  nombre: FormControl<string>;
  apellido: FormControl<string>;
  usuario: FormControl<string>;
  correo: FormControl<string>;
  clave: FormControl<string>;
}

@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-register.component.html'
})
export class StudentRegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthenticationService);
  private router = inject(Router);

  loading = false;
  submitted = false;
  error = '';

  form: FormGroup<StudentForm> = this.fb.group({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    clave: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;

    this.loading = true;
    const payload = this.form.getRawValue();

    this.auth.registerStudent(payload)
      .pipe(first())
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/estudiante']);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err?.error?.message || 'No se pudo registrar el estudiante';
        }
      });
  }
}
