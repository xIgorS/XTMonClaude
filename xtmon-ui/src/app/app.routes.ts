import { Routes } from '@angular/router';
import { MonitoringComponent } from './features/monitoring/monitoring';
import { ReplayFlowsComponent } from './features/replay-flows/replay-flows';

export const routes: Routes = [
    { path: '', redirectTo: 'monitoring', pathMatch: 'full' },
    { path: 'monitoring', component: MonitoringComponent },
    { path: 'replay-flows', component: ReplayFlowsComponent }
];
