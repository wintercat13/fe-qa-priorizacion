import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MetricasService } from '../../core/services/metricas.service';
import { MetricasDashboard } from '../../core/models/metricas.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly metricasService = inject(MetricasService);

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

  metricas = signal<MetricasDashboard | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  desde = signal(this.fechaInicioMes());
  hasta = signal(this.fechaHoy());

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.metricasService.obtener({ desde: this.desde(), hasta: this.hasta() }).subscribe({
      next: (data) => {
        this.metricas.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  aplicarFiltro(): void {
    if (this.desde() > this.hasta()) {
      this.error.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.cargar();
  }

  private fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private fechaInicioMes(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
  }
}
