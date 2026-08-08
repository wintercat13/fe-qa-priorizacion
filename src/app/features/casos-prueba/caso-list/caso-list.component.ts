import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';
import { CasoPrueba, Criticidad, EstadoCaso, ESTADOS_CASO } from '../../../core/models/caso-prueba.model';

@Component({
  selector: 'app-caso-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './caso-list.component.html',
  styleUrl: './caso-list.component.css',
})
export class CasoListComponent implements OnInit {
  private readonly casoService = inject(CasoPruebaService);

  casos = signal<CasoPrueba[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filtroTexto = signal('');
  filtroCriticidad = signal<Criticidad | ''>('');
  filtroEstado = signal<EstadoCaso | ''>('');

  estados = ESTADOS_CASO;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.casoService.listar().subscribe({
      next: (data) => {
        this.casos.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  casosFiltrados(): CasoPrueba[] {
    const texto = this.filtroTexto().toLowerCase();
    const crit = this.filtroCriticidad();
    const estado = this.filtroEstado();
    return this.casos().filter((c) => {
      const matchTexto = (c.titulo + ' ' + c.modulo).toLowerCase().includes(texto);
      const matchCrit = !crit || c.criticidad === crit;
      const matchEstado = !estado || c.estado === estado;
      return matchTexto && matchCrit && matchEstado;
    });
  }

  criticidadClass(crit: string): string {
    switch (crit) {
      case 'ALTA': return 'crit-Alta';
      case 'MEDIA': return 'crit-Media';
      case 'BAJA': return 'crit-Baja';
      default: return '';
    }
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'pill-Pendiente';
      case 'EN_CURSO': return 'pill-Encurso';
      case 'EJECUTADO': return 'pill-Ejecutado';
      case 'BLOQUEADO': return 'pill-Bloqueado';
      case 'OBSOLETO': return 'pill-Obsoleto';
      case 'ARCHIVADO': return 'pill-Archivado';
      default: return '';
    }
  }

  scoreClass(score: number): string {
    if (score >= 8) return 'score-hi';
    if (score >= 5) return 'score-mid';
    return 'score-lo';
  }

  labelEstado(estado: EstadoCaso): string {
    return estado.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  }

  filaClase(caso: CasoPrueba): string {
    if (caso.estado === 'OBSOLETO') return 'fila-obsoleto';
    if (caso.estado === 'ARCHIVADO') return 'fila-archivado';
    if (caso.posibleDuplicado) return 'fila-duplicado';
    return '';
  }
}
