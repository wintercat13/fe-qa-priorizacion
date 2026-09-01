import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { MetricasLegacyService } from '../../core/services/metricas-legacy.service';
import { MetricasService } from '../../core/services/metricas.service';
import { CasoPruebaService } from '../../core/services/caso-prueba.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AgrupacionTendencia, MetricaTendencia, MetricasDashboard, MetricasReporte } from '../../core/models/metricas.model';
import { CasoPrueba } from '../../core/models/caso-prueba.model';
import { UsuarioCompleto } from '../../core/models/usuario.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly metricasLegacyService = inject(MetricasLegacyService);
  private readonly metricasService = inject(MetricasService);
  private readonly casoPruebaService = inject(CasoPruebaService);
  private readonly usuarioService = inject(UsuarioService);

  metricas = signal<MetricasReporte | null>(null);
  metricasDashboard = signal<MetricasDashboard | null>(null);
  metricasAnterior = signal<MetricasReporte | null>(null);
  tendencias = signal<MetricaTendencia[]>([]);
  agrupacionTendencias = signal<Extract<AgrupacionTendencia, 'semana' | 'mes'>>('semana');
  casos = signal<CasoPrueba[]>([]);
  usuarios = signal<UsuarioCompleto[]>([]);
  desde = signal(this.fechaInicioMes());
  hasta = signal(this.fechaHoy());
  responsableId = signal<number | null>(null);
  modulo = signal<string>('');
  prioridad = signal<string>('');
  estado = signal<string>('');
  loadingMetricas = signal(false);
  exportando = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  protected readonly Math = Math;

  modulos = computed(() => {
    const nombres = new Set(this.casos().map((c) => c.modulo));
    return Array.from(nombres).sort();
  });

  casosFiltrados = computed(() => {
    return this.casos()
      .filter((c) => {
        const moduloOk = !this.modulo() || c.modulo === this.modulo();
        const prioridadOk = !this.prioridad() || c.criticidad === this.prioridad();
        const estadoOk = !this.estado() || c.estado === this.estado();
        return moduloOk && prioridadOk && estadoOk;
      })
      .sort((a, b) => a.id - b.id);
  });

  maximoPorModulo = computed(() => {
    const datos = this.metricasDashboard()?.casosPorModulo ?? [];
    if (datos.length === 0) return 0;
    return Math.max(...datos.map((d) => d.valor));
  });

  barrasPorModulo = computed(() => {
    const datos = this.metricasDashboard()?.casosPorModulo ?? [];
    const max = this.maximoPorModulo();
    return datos.map((d) => ({
      ...d,
      altura: max > 0 ? (d.valor / max) * 100 : 0,
    }));
  });

  donaEstados = computed(() => {
    const datos = this.metricasDashboard()?.estadoEjecucion ?? [];
    const total = datos.reduce((sum, d) => sum + d.porcentaje, 0) || 100;
    let acumulado = 0;
    const colores = ['var(--teal)', 'var(--amber)', 'var(--risk)'];
    return datos.map((d, i) => {
      const inicio = acumulado;
      const porcion = (d.porcentaje / total) * 100;
      acumulado += porcion;
      return {
        ...d,
        color: colores[i % colores.length],
        inicio,
        porcion,
        path: this.arcoDonut(inicio, porcion),
      };
    });
  });

  tendenciasGrafico = computed(() => {
    const datos = this.tendencias();
    if (!Array.isArray(datos) || datos.length === 0) return null;
    const max = Math.max(...datos.map((d) => Math.max(d.ejecutados ?? 0, d.pendientes ?? 0, d.bloqueados ?? 0)), 1);
    const viewBoxHeight = 300;
    const padding = { top: 20, right: 30, bottom: 50, left: 50 };
    const viewBoxWidth = Math.max(800, datos.length * 60 + padding.left + padding.right);
    const width = viewBoxWidth - padding.left - padding.right;
    const height = viewBoxHeight - padding.top - padding.bottom;

    const x = (index: number) => padding.left + (index / (datos.length - 1 || 1)) * width;
    const y = (value: number) => padding.top + height - (value / max) * height;

    const maxEtiquetas = 12;
    const pasoEtiquetas = Math.ceil(datos.length / maxEtiquetas);

    const series = [
      { key: 'ejecutados', label: 'Ejecutados', color: 'var(--teal)' },
      { key: 'pendientes', label: 'Pendientes', color: 'var(--amber)' },
      { key: 'bloqueados', label: 'Bloqueados', color: 'var(--risk)' },
    ] as const;

    return {
      max,
      viewBoxWidth,
      viewBoxHeight,
      padding,
      width,
      height,
      x,
      y,
      pasoEtiquetas,
      datos: datos.map((d, i) => ({ ...d, x: x(i), mostrarEtiqueta: i % pasoEtiquetas === 0 })),
      series: series.map((s) => ({
        ...s,
        puntos: datos.map((d, i) => ({ x: x(i), y: y((d as never)[s.key] as number ?? 0), valor: (d as never)[s.key] as number ?? 0 })),
      })),
    };
  });

  comparativa = computed(() => {
    const actual = this.metricas();
    const anterior = this.metricasAnterior();
    if (!actual || !anterior) return null;
    return {
      cobertura: this.diferencia(actual.cobertura, anterior.cobertura),
      porcentajeEjecutado: this.diferencia(actual.porcentajeEjecutado, anterior.porcentajeEjecutado),
      casosObsoletosDepurados: this.diferencia(actual.casosObsoletosDepurados, anterior.casosObsoletosDepurados),
      cumplimientoSLA: this.diferencia(actual.cumplimientoSLA, anterior.cumplimientoSLA),
    };
  });

  ngOnInit(): void {
    this.establecerRangoUltimos3Meses();
    this.cargarDatos();
    this.cargarUsuarios();
  }

  cargarDatos(): void {
    if (this.desde() > this.hasta()) {
      this.error.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.loadingMetricas.set(true);
    this.error.set(null);

    this.metricasLegacyService.obtener({ desde: this.desde(), hasta: this.hasta() }).subscribe({
      next: (data) => {
        this.metricas.set(data);
        this.loadingMetricas.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loadingMetricas.set(false);
      },
    });

    this.metricasService.obtener({ desde: this.desde(), hasta: this.hasta(), responsableId: this.responsableId() }).subscribe({
      next: (data) => this.metricasDashboard.set(data),
      error: () => this.metricasDashboard.set(null),
    });

    this.metricasService.obtenerTendencias({ desde: this.desde(), hasta: this.hasta(), responsableId: this.responsableId() }, this.agrupacionTendencias()).subscribe({
      next: (data) => this.tendencias.set(data),
      error: () => this.tendencias.set([]),
    });

    const { desde: antDesde, hasta: antHasta } = this.periodoAnterior(this.desde(), this.hasta());
    this.metricasLegacyService.obtener({ desde: antDesde, hasta: antHasta }).subscribe({
      next: (data) => this.metricasAnterior.set(data),
      error: () => this.metricasAnterior.set(null),
    });

    this.casoPruebaService.listar().subscribe({
      next: (data) => this.casos.set(data),
      error: () => this.casos.set([]),
    });
  }

  aplicarFiltro(): void {
    this.cargarDatos();
  }

  limpiarFiltros(): void {
    this.responsableId.set(null);
    this.modulo.set('');
    this.prioridad.set('');
    this.estado.set('');
    this.cargarDatos();
  }

  cambiarAgrupacion(agrupacion: 'semana' | 'mes'): void {
    this.agrupacionTendencias.set(agrupacion);
    this.metricasService
      .obtenerTendencias({ desde: this.desde(), hasta: this.hasta(), responsableId: this.responsableId() }, agrupacion)
      .subscribe({
        next: (data) => this.tendencias.set(data),
        error: () => this.tendencias.set([]),
      });
  }

  private cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (data) => this.usuarios.set(data),
      error: () => this.usuarios.set([]),
    });
  }

  exportarPdf(): void {
    this.error.set(null);
    this.exito.set(null);
    this.exportando.set(true);

    this.reporteService.exportarPdf({
      desde: this.desde(),
      hasta: this.hasta(),
      responsableId: this.responsableId(),
      modulo: this.modulo(),
      prioridad: this.prioridad(),
      estado: this.estado(),
    }).subscribe({
      next: (blob) => {
        this.exportando.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_qa_${this.desde()}_${this.hasta()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.exito.set('Reporte exportado correctamente.');
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.exportando.set(false);
      },
    });
  }

  trackByModulo(index: number, item: { nombre: string }): string {
    return item.nombre;
  }

  trackByEstado(index: number, item: { estado: string }): string {
    return item.estado;
  }

  trackByTendencia(index: number, item: MetricaTendencia): string {
    return item.periodo;
  }

  trackByCaso(index: number, item: CasoPrueba): number {
    return item.id;
  }

  private fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private fechaInicioMes(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private establecerRangoUltimos3Meses(): void {
    const hoy = new Date();
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
    this.hasta.set(this.formatearFecha(fin));
    this.desde.set(this.formatearFecha(inicio));
  }

  private formatearFecha(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  private periodoAnterior(desde: string, hasta: string): { desde: string; hasta: string } {
    const inicio = new Date(desde);
    const fin = new Date(hasta);
    const duracion = fin.getTime() - inicio.getTime();
    return {
      desde: new Date(inicio.getTime() - duracion - 86400000).toISOString().split('T')[0],
      hasta: new Date(inicio.getTime() - 86400000).toISOString().split('T')[0],
    };
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

  private diferencia(actual: number, anterior: number): { valor: number; positivo: boolean } {
    const diff = actual - anterior;
    return { valor: Math.abs(diff), positivo: diff >= 0 };
  }
}
