import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AdminLayoutComponent } from './shared/layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'casos-prueba',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/casos-prueba/caso-list/caso-list.component').then(
                (m) => m.CasoListComponent
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/casos-prueba/caso-form/caso-form.component').then(
                (m) => m.CasoFormComponent
              ),
          },
          {
            path: ':id/editar',
            loadComponent: () =>
              import('./features/casos-prueba/caso-edit/caso-edit.component').then(
                (m) => m.CasoEditComponent
              ),
          },
        ],
      },
      {
        path: 'priorizacion',
        loadComponent: () =>
          import('./features/priorizacion/priorizacion.component').then(
            (m) => m.PriorizacionComponent
          ),
      },
      {
        path: 'configuracion-priorizacion',
        canActivate: [roleGuard('ADMINISTRADOR_QA')],
        loadComponent: () =>
          import('./features/criterios-priorizacion/criterios-priorizacion.component').then(
            (m) => m.CriteriosPriorizacionComponent
          ),
      },
      {
        path: 'ejecuciones',
        children: [
          {
            path: 'nuevo/:casoPruebaId',
            loadComponent: () =>
              import('./features/ejecucion/ejecucion-form/ejecucion-form.component').then(
                (m) => m.EjecucionFormComponent
              ),
          },
        ],
      },
      {
        path: 'trazabilidad/:casoPruebaId',
        loadComponent: () =>
          import('./features/trazabilidad/trazabilidad.component').then(
            (m) => m.TrazabilidadComponent
          ),
      },
      {
        path: 'reportes',
        canActivate: [roleGuard('ADMINISTRADOR_QA')],
        loadComponent: () =>
          import('./features/reportes/reportes.component').then(
            (m) => m.ReportesComponent
          ),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard('ADMINISTRADOR_QA')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/usuarios/usuario-list/usuario-list.component').then(
                (m) => m.UsuarioListComponent
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/usuarios/usuario-form/usuario-form.component').then(
                (m) => m.UsuarioFormComponent
              ),
          },
          {
            path: ':id/editar',
            loadComponent: () =>
              import('./features/usuarios/usuario-form/usuario-form.component').then(
                (m) => m.UsuarioFormComponent
              ),
          },
        ],
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'acceso-denegado',
    loadComponent: () =>
      import('./features/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent
      ),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
