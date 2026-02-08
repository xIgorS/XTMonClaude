import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavMenuComponent } from './layout/nav-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavMenuComponent],
  template: `
    <div class="app-shell">
      <aside class="sidebar-card w-72 flex-shrink-0">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">XTMon</h1>
            <p class="text-xs text-slate-400">Data Monitoring</p>
          </div>
        </div>

        <div class="mb-8">
          <app-nav-menu></app-nav-menu>
        </div>

        <div class="mt-auto">
          <div class="rounded-xl bg-slate-800/50 border border-slate-700/30 p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="status-pill status-pill--live">Connected</div>
            </div>
            <p class="text-xs font-medium text-slate-400 mb-1">Database</p>
            <p class="text-sm font-semibold text-white">LOG_FI_ALMT</p>
            <p class="text-xs text-slate-500 mt-1">localhost:1433</p>
          </div>
        </div>
      </aside>

      <main class="flex-1 flex flex-col gap-6 min-w-0">
        <header class="surface flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Dashboard</p>
            <h2 class="text-2xl font-bold text-white">Operational Pulse</h2>
            <p class="muted mt-1">Monitor capacity, growth, and processing health in real-time.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-600/50">
              <svg class="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              Angular 21
            </span>
            <span class="inline-flex items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-600/50">
              <svg class="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
              Minimal API
            </span>
          </div>
        </header>

        <section class="surface flex-1">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `
})
export class App {
  title = 'xtmon-angular';
}
