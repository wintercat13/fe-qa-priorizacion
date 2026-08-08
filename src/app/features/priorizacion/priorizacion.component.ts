import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CasoPrueba } from '../../core/models/caso-prueba.model';
import { CasoPruebaService } from '../../core/services/caso-prueba.service';

@Component({
  selector: 'app-priorizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './priorizacion.component.html',
  styleUrl: './priorizacion.component.css',
})
export class PriorizacionComponent implements OnInit {
  private readonly casoService = inject(CasoPruebaService);

  casos = signal<CasoPrueba[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filtroModulo = signal('');
  modulos = computed(() => {
    const lista = this.casos();
    const unicos = new Set(lista.map((c) => c.modulo));
    return Array.from(unicos).sort();
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.casoService.listarPriorizados().subscribe({
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

  aplicarFiltro(): void {
    const modulo = this.filtroModulo();
    this.loading.set(true);
    this.error.set(null);
    this.casoService.listarPriorizados(modulo || undefined).subscribe({
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

  scoreClass(score: number): string {
    if (score >= 8) return 'score-hi';
    if (score >= 5) return 'score-mid';
    return 'score-lo';
  }

  posicionClass(index: number): string {
    if (index === 0) return 'posicion-oro';
    if (index === 1) return 'posicion-plata';
    if (index === 2) return 'posicion-bronce';
    return '';
  }
}
