import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../shared/stat-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, StatCardComponent],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col gap-6">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-2">Monitoring Workspace</p>
          <h1 class="text-3xl font-bold text-white mb-3">Stay ahead of processing drift</h1>
          <p class="text-slate-400 max-w-2xl leading-relaxed">
            XTMon keeps your operational signals visible: database size, disk pressure, and the health of
            your processing pipeline. Refresh on demand and keep teams aligned with a single source of truth.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a class="primary-button" routerLink="/monitoring">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Open Dashboard
          </a>
          <span class="inline-flex items-center gap-2 rounded-xl bg-slate-700/30 px-4 py-2.5 text-sm font-medium text-slate-300 ring-1 ring-slate-600/50">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
            </svg>
            SQL Server localhost:1433
          </span>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="stat-card group">
          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-cyan-500/30 transition-colors">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
          </div>
          <p class="stat-label">Live visibility</p>
          <p class="stat-value">Single refresh</p>
          <p class="muted mt-2">Pulls the latest metrics from your stored procedure when you need them.</p>
        </div>
        
        <div class="stat-card group">
          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-colors">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
              </svg>
            </div>
          </div>
          <p class="stat-label">Flexible schema</p>
          <p class="stat-value">Any columns</p>
          <p class="muted mt-2">The dashboard adapts to whichever fields the procedure returns.</p>
        </div>
      </div>

      <div class="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-teal-500/10 border border-indigo-500/20 p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <p class="text-xs font-medium uppercase tracking-widest text-indigo-400">Next Steps</p>
            </div>
            <h2 class="text-xl font-bold text-white mb-2">Connect your production insights</h2>
            <p class="text-slate-400 max-w-xl">
              Update the connection string with your SQL login and keep expanding the stored procedure
              output to include pipeline KPIs such as batch latency, failures, and queue depth.
            </p>
          </div>
          <a class="primary-button flex-shrink-0" routerLink="/monitoring">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            Review Data
          </a>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent { }
