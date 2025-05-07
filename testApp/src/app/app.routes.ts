// app.routes.ts
import { Routes } from '@angular/router';
import { IndexComponent } from './components/index/index.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

export const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'admin-panel', component: AdminPanelComponent },
  { path: '**', redirectTo: '' }
];
