import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  RESULTADOS_EJECUCION,
  ResultadoEjecucion,
} from '../../../core/models/ejecucion.model';
import { EjecucionService } from '../../../core/services/ejecucion.service';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';
import { CasoPrueba } from '../../../core/models/caso-prueba.model';

@Component({
  selector: 'app-ejecucion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ejecucion-form.component.html',
  styleUrl: './ejecucion-form.component.css',
})
export class EjecucionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ejecucionService = inject(EjecucionService);
  private readonly casoService = inject(CasoPruebaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form: FormGroup;
  resultados = RESULTADOS_EJECUCION;

  caso = signal<CasoPrueba | null>(null);
  loadingCaso = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      resultado: ['', Validators.required],
      observaciones: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    const casoIdParam = this.route.snapshot.paramMap.get('casoPruebaId');
    if (casoIdParam) {
      this.cargarCaso(Number(casoIdParam));
    } else {
      this.error.set('No se especificó un caso de prueba.');
    }
  }

  cargarCaso(id: number): void {
    this.loadingCaso.set(true);
    this.error.set(null);
    this.casoService.obtener(id).subscribe({
      next: (data) => {
        this.caso.set(data);
        this.loadingCaso.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loadingCaso.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const caso = this.caso();
    if (!caso) return;

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    const payload = {
      casoPruebaId: caso.id,
      resultado: this.form.value.resultado as ResultadoEjecucion,
      observaciones: this.form.value.observaciones || undefined,
    };

    this.ejecucionService.registrar(payload).subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        this.exito.set(
          `Ejecución registrada correctamente. El caso pasó a estado ${this.labelEstado(respuesta.estadoCaso)}.`
        );
        setTimeout(() => {
          void this.router.navigate(['/priorizacion']);
        }, 1500);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }

  labelResultado(r: ResultadoEjecucion): string {
    switch (r) {
      case 'APROBADO': return 'Aprobado';
      case 'FALLIDO': return 'Fallido';
      case 'BLOQUEADO': return 'Bloqueado';
      default: return r;
    }
  }

  labelEstado(estado: string): string {
    return estado.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  }

  get resultado() { return this.form.get('resultado'); }
  get observaciones() { return this.form.get('observaciones'); }
}
