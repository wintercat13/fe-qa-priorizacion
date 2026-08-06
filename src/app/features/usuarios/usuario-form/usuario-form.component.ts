import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROLES_USUARIO, RolUsuario, UsuarioCompleto, UsuarioPayload } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css',
})
export class UsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form: FormGroup;
  roles = ROLES_USUARIO;
  usuarioId: number | null = null;

  loading = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.usuarioId = Number(idParam);
      this.cargarUsuario(this.usuarioId);
    }
  }

  cargarUsuario(id: number): void {
    this.loading.set(true);
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        const usuario = usuarios.find((u) => u.id === id);
        if (usuario) {
          this.form.patchValue({
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
          });
        } else {
          this.error.set('Usuario no encontrado.');
        }
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload: UsuarioPayload = this.form.value;

    const request$ =
      this.usuarioId === null
        ? this.usuarioService.crear(payload)
        : this.usuarioService.editar(this.usuarioId, payload);

    request$.subscribe({
      next: () => {
        this.guardando.set(false);
        void this.router.navigate(['/usuarios']);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }

  titulo(): string {
    return this.usuarioId === null ? 'Nuevo usuario' : 'Editar usuario';
  }

  get nombre() {
    return this.form.get('nombre');
  }

  get correo() {
    return this.form.get('correo');
  }

  get rol() {
    return this.form.get('rol');
  }
}
