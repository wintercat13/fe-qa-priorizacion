import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.authState().usuario;
  readonly iniciales = this.inicialesDe(this.usuario?.nombre ?? '');
  readonly rolFormateado = this.formatearRol(this.usuario?.rol);

  logout(): void {
    this.authService.logout();
  }

  esAdmin(): boolean {
    return this.usuario?.rol === 'ADMINISTRADOR_QA';
  }

  esDesarrollador(): boolean {
    return this.usuario?.rol === 'DESARROLLADOR';
  }

  private inicialesDe(nombre: string): string {
    const partes = nombre.split(' ').filter(Boolean);
    return partes.length > 1
      ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
      : nombre.slice(0, 2).toUpperCase();
  }

  private formatearRol(rol?: string): string {
    switch (rol) {
      case 'ADMINISTRADOR_QA': return 'Admin. QA';
      case 'DESARROLLADOR': return 'Desarroll.';
      case 'QA_TESTER': return 'QA Tester';
      default: return rol ?? 'Sin rol';
    }
  }
}
