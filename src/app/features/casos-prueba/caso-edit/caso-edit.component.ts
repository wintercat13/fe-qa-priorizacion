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
  CasoPrueba,
  CasoPruebaPayload,
  CRITICIDADES,
  Criticidad,
  ESTADOS_CASO,
  EstadoCaso,
  Requisito,
} from '../../../core/models/caso-prueba.model';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';
import { DuplicateAlertComponent } from '../../../shared/components/duplicate-alert/duplicate-alert.component';

@Component({
  selector: 'app-caso-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DuplicateAlertComponent],
  templateUrl: './caso-edit.component.html',
  styleUrl: './caso-edit.component.css',
})
export class CasoEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly casoService = inject(CasoPruebaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form: FormGroup;
  criticidades = CRITICIDADES;
  estados = ESTADOS_CASO;
  requisitos = signal<Requisito[]>([]);

  casoId: number | null = null;
  loading = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  alertaDuplicado = signal(false);
  casoSimilarId = signal<number | null>(null);
  porcentajeSimilitud = signal<number>(0);
  payloadPendiente = signal<CasoPruebaPayload | null>(null);

  constructor() {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', Validators.maxLength(1000)],
      modulo: ['', Validators.required],
      criticidad: ['', Validators.required],
      estado: ['', Validators.required],
      requisitoId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.casoId = Number(idParam);
      this.cargarDatos(this.casoId);
    } else {
      this.error.set('Caso de prueba no encontrado.');
    }
  }

  cargarDatos(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.casoService.listarRequisitos().subscribe({
      next: (reqs) => {
        this.requisitos.set(reqs);
        this.casoService.obtener(id).subscribe({
          next: (caso) => {
            this.patchForm(caso);
            this.loading.set(false);
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.loading.set(false);
          },
        });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  patchForm(caso: CasoPrueba): void {
    this.form.patchValue({
      titulo: caso.titulo,
      descripcion: caso.descripcion ?? '',
      modulo: caso.modulo,
      criticidad: caso.criticidad,
      estado: caso.estado,
      requisitoId: caso.requisitoId,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.casoId === null) return;

    const payload: CasoPruebaPayload = this.form.value;
    this.payloadPendiente.set(payload);
    this.error.set(null);
    this.guardando.set(true);

    this.casoService.verificarDuplicidad(payload.titulo, payload.modulo).subscribe({
      next: (resultado) => {
        if (resultado.posibleDuplicado && resultado.casoSimilarId !== this.casoId) {
          this.alertaDuplicado.set(true);
          this.casoSimilarId.set(resultado.casoSimilarId ?? null);
          this.porcentajeSimilitud.set(resultado.porcentajeSimilitud ?? 0);
          this.guardando.set(false);
        } else {
          this.guardar(payload);
        }
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }

  confirmarDistinto(): void {
    if (this.casoId === null) return;

    const payload = this.payloadPendiente();
    if (!payload) return;

    this.guardando.set(true);
    this.alertaDuplicado.set(false);
    this.casoService.editar(this.casoId, payload).subscribe({
      next: () => {
        this.casoService.confirmarNoDuplicado(this.casoId!).subscribe({
          next: () => {
            this.guardando.set(false);
            void this.router.navigate(['/casos-prueba']);
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.guardando.set(false);
          },
        });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }

  continuarGuardando(): void {
    const payload = this.payloadPendiente();
    if (!payload) return;

    this.alertaDuplicado.set(false);
    this.guardar(payload);
  }

  archivar(): void {
    if (this.casoId === null) return;

    this.guardando.set(true);
    this.error.set(null);
    this.casoService.archivar(this.casoId).subscribe({
      next: () => {
        this.guardando.set(false);
        void this.router.navigate(['/casos-prueba']);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }

  private guardar(payload: CasoPruebaPayload): void {
    if (this.casoId === null) return;

    this.guardando.set(true);
    this.casoService.editar(this.casoId, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        void this.router.navigate(['/casos-prueba']);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }

  labelCriticidad(c: Criticidad): string {
    return c.charAt(0) + c.slice(1).toLowerCase();
  }

  labelEstado(e: EstadoCaso): string {
    return e.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  }

  get titulo() { return this.form.get('titulo'); }
  get descripcion() { return this.form.get('descripcion'); }
  get modulo() { return this.form.get('modulo'); }
  get criticidad() { return this.form.get('criticidad'); }
  get estado() { return this.form.get('estado'); }
  get requisitoId() { return this.form.get('requisitoId'); }
}
