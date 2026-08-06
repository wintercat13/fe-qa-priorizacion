import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CRITICIDADES, Criticidad, Requisito } from '../../../core/models/caso-prueba.model';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';

@Component({
  selector: 'app-caso-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

    this.guardando.set(true);
    this.error.set(null);

    const payload = this.form.value;
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
