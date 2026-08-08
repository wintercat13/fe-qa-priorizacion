import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-duplicate-alert',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './duplicate-alert.component.html',
  styleUrl: './duplicate-alert.component.css',
})
export class DuplicateAlertComponent {
  casoSimilarId = input.required<number>();
  porcentajeSimilitud = input.required<number>();

  confirmarDistinto = output<void>();
  continuar = output<void>();

  similitudFormateada(): string {
    return `${Math.round((this.porcentajeSimilitud() ?? 0) * 100)}%`;
  }
}
