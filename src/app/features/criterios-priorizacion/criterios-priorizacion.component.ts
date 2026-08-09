import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CriterioPriorizacion } from '../../core/models/criterio-priorizacion.model';
import { CriterioPriorizacionService } from '../../core/services/criterio-priorizacion.service';

@Component({
  selector: 'app-criterios-priorizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './criterios-priorizacion.component.html',
  styleUrl: './criterios-priorizacion.component.css',
})
export class CriteriosPriorizacionComponent implements OnInit {
  private readonly criterioService = inject(CriterioPriorizacionService);

  criterios = signal<CriterioPriorizacion[]>([]);
  loading = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  sumaPesos = computed(() =>
    this.criterios()
      .filter((c) => c.activo)
      .reduce((total, c) => total + c.peso, 0)
  );

  restante = computed(() => 1 - this.sumaPesos());

  esValido = computed(() => {
    const activos = this.criterios().filter((c) => c.activo);
    return activos.length > 0 && Math.abs(this.sumaPesos() - 1) < 0.0001;
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.exito.set(null);
    this.criterioService.listar().subscribe({
      next: (data) => {
        this.criterios.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  actualizarPeso(id: number, valor: number): void {
    this.criterios.update((lista) =>
      lista.map((c) => (c.id === id ? { ...c, peso: valor / 100 } : c))
    );
  }

  toggleActivo(criterio: CriterioPriorizacion): void {
    this.criterios.update((lista) =>
      lista.map((c) => (c.id === criterio.id ? { ...c, activo: !c.activo } : c))
    );
  }

  onSubmit(): void {
    if (!this.esValido()) return;

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.criterioService
      .actualizar({ criterios: this.criterios() })
      .subscribe({
        next: (respuesta) => {
          this.guardando.set(false);
          this.exito.set(
            `Configuración guardada. ${respuesta.criteriosActualizados} criterios actualizados, ${respuesta.casosRecalculados} casos recalculados.`
          );
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.guardando.set(false);
        },
      });
  }

  porcentaje(peso: number): string {
    return `${Math.round(peso * 100)}%`;
  }
}
