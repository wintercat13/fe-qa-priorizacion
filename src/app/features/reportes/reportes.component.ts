import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { MetricasService } from '../../core/services/metricas.service';
import { MetricasDashboard } from '../../core/models/metricas.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly metricasService = inject(MetricasService);

  metricas = signal<MetricasDashboard | null>(null);
  desde = signal(this.fechaInicioMes());
  hasta = signal(this.fechaHoy());
  loadingMetricas = signal(false);
  exportando = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.loadingMetricas.set(true);
    this.error.set(null);
    this.metricasService.obtener({ desde: this.desde(), hasta: this.hasta() }).subscribe({
      next: (data) => {
        this.metricas.set(data);
        this.loadingMetricas.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loadingMetricas.set(false);
      },
    });
  }

  aplicarFiltro(): void {
    if (this.desde() > this.hasta()) {
      this.error.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.cargarMetricas();
  }

  exportarPdf(): void {
    this.error.set(null);
    this.exito.set(null);
    this.exportando.set(true);

    this.reporteService.exportarPdf({ desde: this.desde(), hasta: this.hasta() }).subscribe({
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

  private fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private fechaInicioMes(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
  }
}
