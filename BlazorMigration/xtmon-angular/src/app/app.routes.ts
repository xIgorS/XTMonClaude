import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MonitoringComponent } from './features/monitoring/monitoring.component';
import { ReplayFlowsComponent } from './features/replay-flows/replay-flows.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'monitoring', component: MonitoringComponent },
    { path: 'replay-flows', component: ReplayFlowsComponent },
    { path: '**', redirectTo: '' }
];
