import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.authState().usuario;
  readonly iniciales = computed(() => {
    const nombre = this.usuario?.nombre ?? '';
    const partes = nombre.split(' ').filter(Boolean);
    return partes.length > 1
      ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
      : nombre.slice(0, 2).toUpperCase();
  });
  readonly rolFormateado = computed(() => {
    const rol = this.usuario?.rol;
    switch (rol) {
      case 'ADMINISTRADOR_QA': return 'Admin. QA';
      case 'DESARROLLADOR': return 'Desarroll.';
      case 'QA_TESTER': return 'QA Tester';
      default: return rol ?? 'Sin rol';
    }
  });

  logout(): void {
    this.authService.logout();
  }

  esAdmin(): boolean {
    return this.usuario?.rol === 'ADMINISTRADOR_QA';
  }
}
