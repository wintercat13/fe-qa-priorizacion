import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { UsuarioCompleto } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css',
})
export class UsuarioListComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);

  usuarios = signal<UsuarioCompleto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);
  usuarioDesactivando = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  desactivar(usuario: UsuarioCompleto): void {
    if (!usuario.activo) return;
    if (!confirm(`¿Deseas desactivar a ${usuario.nombre}?`)) return;

    this.usuarioDesactivando.set(usuario.id);
    this.mensaje.set(null);

    this.usuarioService.desactivar(usuario.id).subscribe({
      next: () => {
        this.usuarios.update((lista) =>
          lista.map((u) => (u.id === usuario.id ? { ...u, activo: false } : u))
        );
        this.mensaje.set(`El usuario ${usuario.nombre} fue desactivado.`);
        this.usuarioDesactivando.set(null);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.usuarioDesactivando.set(null);
      },
    });
  }

  rolFormateado(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR_QA': return 'Administrador QA';
      case 'DESARROLLADOR': return 'Desarrollador';
      case 'QA_TESTER': return 'QA Tester';
      default: return rol;
    }
  }
}
