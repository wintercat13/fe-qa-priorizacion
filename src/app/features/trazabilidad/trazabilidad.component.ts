import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Trazabilidad } from '../../core/models/trazabilidad.model';
import { TrazabilidadService } from '../../core/services/trazabilidad.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trazabilidad.component.html',
  styleUrl: './trazabilidad.component.css',
})
export class TrazabilidadComponent implements OnInit {
  private readonly trazabilidadService = inject(TrazabilidadService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  trazabilidad = signal<Trazabilidad | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const casoIdParam = this.route.snapshot.paramMap.get('casoPruebaId');
    if (casoIdParam) {
      this.cargar(Number(casoIdParam));
    } else {
      this.error.set('No se especificó un caso de prueba.');
    }
  }

  cargar(casoPruebaId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.trazabilidadService.obtener(casoPruebaId).subscribe({
      next: (data) => {
        this.trazabilidad.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  esSoloLectura(): boolean {
    return this.authService.getUsuario()?.rol === 'DESARROLLADOR';
  }

  labelEstado(estado: string): string {
    return estado.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
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

  resultadoClass(resultado: string): string {
    switch (resultado) {
      case 'APROBADO': return 'pill-Ejecutado';
      case 'FALLIDO': return 'pill-Bloqueado';
      case 'BLOQUEADO': return 'pill-Obsoleto';
      default: return 'pill-Pendiente';
    }
  }

  iconoNodo(tipo: 'requisito' | 'caso' | 'ejecucion' | 'estado'): string {
    switch (tipo) {
      case 'requisito': return '📋';
      case 'caso': return '🧪';
      case 'ejecucion': return '▶️';
      case 'estado': return '🏁';
    }
  }
}
