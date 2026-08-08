import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CasoPruebaPayload, CRITICIDADES, Criticidad, Requisito } from '../../../core/models/caso-prueba.model';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';
import { DuplicateAlertComponent } from '../../../shared/components/duplicate-alert/duplicate-alert.component';

@Component({
  selector: 'app-caso-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DuplicateAlertComponent],
  templateUrl: './caso-form.component.html',
  styleUrl: './caso-form.component.css',
})
export class CasoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly casoService = inject(CasoPruebaService);
  private readonly router = inject(Router);

  form: FormGroup;
  criticidades = CRITICIDADES;
  requisitos = signal<Requisito[]>([]);

  loadingRequisitos = signal(false);
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
      requisitoId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarRequisitos();
  }

  cargarRequisitos(): void {
    this.loadingRequisitos.set(true);
    this.casoService.listarRequisitos().subscribe({
      next: (data) => {
        this.requisitos.set(data);
        this.loadingRequisitos.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loadingRequisitos.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CasoPruebaPayload = this.form.value;
    this.payloadPendiente.set(payload);
    this.error.set(null);
    this.guardando.set(true);

    this.casoService.verificarDuplicidad(payload.titulo, payload.modulo).subscribe({
      next: (resultado) => {
        if (resultado.posibleDuplicado) {
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
    const payload = this.payloadPendiente();
    if (!payload) return;

    this.guardando.set(true);
    this.alertaDuplicado.set(false);
    this.casoService.crear(payload).subscribe({
      next: (nuevoCaso) => {
        if (nuevoCaso.id) {
          this.casoService.confirmarNoDuplicado(nuevoCaso.id).subscribe({
            next: () => {
              this.guardando.set(false);
              void this.router.navigate(['/casos-prueba']);
            },
            error: (err: Error) => {
              this.error.set(err.message);
              this.guardando.set(false);
            },
          });
        } else {
          this.guardando.set(false);
          void this.router.navigate(['/casos-prueba']);
        }
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

  private guardar(payload: CasoPruebaPayload): void {
    this.guardando.set(true);
    this.casoService.crear(payload).subscribe({
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

  criticidadLabel(c: Criticidad): string {
    return c.charAt(0) + c.slice(1).toLowerCase();
  }

  get titulo() { return this.form.get('titulo'); }
  get descripcion() { return this.form.get('descripcion'); }
  get modulo() { return this.form.get('modulo'); }
  get criticidad() { return this.form.get('criticidad'); }
  get requisitoId() { return this.form.get('requisitoId'); }
}
