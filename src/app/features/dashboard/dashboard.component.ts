import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MetricasService } from '../../core/services/metricas.service';
import { MetricasDashboard } from '../../core/models/metricas.model';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly metricasService = inject(MetricasService);

  readonly usuario: Usuario | null = this.authService.authState().usuario;
  readonly rolFormateado = this.formatearRol(this.usuario?.rol);

  metricas = signal<MetricasDashboard | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // SVG helpers expuestos a la plantilla
  protected readonly Math = Math;

  maximoPorModulo = computed(() => {
    const datos = this.metricas()?.casosPorModulo ?? [];
    if (datos.length === 0) return 0;
    return Math.max(...datos.map((d) => d.valor));
  });

  barrasPorModulo = computed(() => {
    const datos = this.metricas()?.casosPorModulo ?? [];
    const max = this.maximoPorModulo();
    return datos.map((d) => ({
      ...d,
      altura: max > 0 ? (d.valor / max) * 100 : 0,
      color: d.nombre === 'Tarjetas' ? 'var(--amber)' : 'var(--teal)',
    }));
  });

  donaEstados = computed(() => {
    const datos = this.metricas()?.estadoEjecucion ?? [];
    const total = datos.reduce((sum, d) => sum + d.porcentaje, 0) || 100;
    let acumulado = 0;
    return datos.map((d, i) => {
      const inicio = acumulado;
      const porcion = (d.porcentaje / total) * 100;
      acumulado += porcion;
      return {
        ...d,
        color: this.colorEstado(i),
        inicio,
        porcion,
        path: this.arcoDonut(inicio, porcion),
      };
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.metricasService.obtener().subscribe({
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


  trackByModulo(index: number, item: { nombre: string }): string {
    return item.nombre;
  }

  trackByEstado(index: number, item: { estado: string }): string {
    return item.estado;
  }

  private colorEstado(index: number): string {
    const colores = ['var(--teal)', 'var(--amber)', 'var(--risk)'];
    return colores[index % colores.length];
  }

  private arcoDonut(inicio: number, porcion: number): string {
    const cx = 20;
    const cy = 20;
    const r = 15.915;
    const inicioRad = ((inicio * 3.6) - 90) * (Math.PI / 180);
    const finRad = (((inicio + porcion) * 3.6) - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(inicioRad);
    const y1 = cy + r * Math.sin(inicioRad);
    const x2 = cx + r * Math.cos(finRad);
    const y2 = cy + r * Math.sin(finRad);
    const largeArc = porcion > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
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
