import { Component, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { MonitoringTableResult } from '../../core/models';
import { StatCardComponent } from '../../shared/stat-card.component';

interface DbCard {
  name: string;
  columns: string[];
  rows: (string | null)[][];
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [StatCardComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Database Monitoring</p>
          <h1 class="text-2xl font-bold text-white">LOG_FI_ALMT</h1>
          <p class="muted mt-1">Stored procedure: <span class="text-slate-300 font-mono text-xs">monitoring.GetDbSizePlusDisk</span></p>
        </div>
        <button class="primary-button" (click)="reload()" [disabled]="isLoading()">
          <svg class="w-4 h-4" [class.animate-spin]="isLoading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ isLoading() ? 'Refreshing...' : 'Refresh data' }}
        </button>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <app-stat-card label="Last refresh" [value]="lastRefresh() || 'Not loaded'" description="Local time" icon="clock"></app-stat-card>
        <app-stat-card label="Rows" [value]="result()?.rows?.length?.toString() || '0'" description="From stored procedure" icon="rows"></app-stat-card>
        <app-stat-card label="Columns" [value]="result()?.columns?.length?.toString() || '0'" description="Detected fields" icon="columns"></app-stat-card>
        <app-stat-card label="Status" [value]="loadError() ? 'Error' : 'Ready'" description="Connectivity" icon="status"></app-stat-card>
      </div>

      <div class="space-y-4">
        @if (dbCards().length > 0) {
          @for (card of dbCards(); track card.name) {
            <div class="surface">
              <div class="db-card-header">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                    </svg>
                  </div>
                  <h3 class="db-card-title">{{ card.name }}</h3>
                </div>
                <span class="text-xs text-slate-500">{{ card.rows.length }} rows</span>
              </div>
              <div class="db-grid__wrap">
                <table class="db-grid">
                  <thead>
                    <tr>
                      @for (column of card.columns; track column) {
                        <th class="db-grid__head" [class]="getColumnAlignmentClass(column)">{{ toHeaderLabel(column) }}</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of card.rows; track $index) {
                      <tr class="db-grid__row" [class]="getRowAlertClass(row, card.columns)">
                        @for (cell of row; track $index; let i = $index) {
                          <td class="db-grid__cell" [class]="getCellClass(card.columns[i], cell)">
                            @if (card.columns[i].toLowerCase() === 'alertlevel') {
                              <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="getAlertBadgeClass(cell)">
                                <span class="w-1.5 h-1.5 rounded-full" [class]="getAlertDotClass(cell)"></span>
                                {{ cell || '-' }}
                              </span>
                            } @else {
                              {{ formatCellValue(cell, card.columns[i]) }}
                            }
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        }

        @if (isLoading()) {
          <div class="surface">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-slate-300">Loading data from SQL Server...</p>
            </div>
          </div>
        } @else if (loadError()) {
          <div class="surface border-rose-500/30 bg-rose-500/5">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-rose-400">Failed to load monitoring data</p>
                <p class="mt-1 text-sm text-rose-300/80">{{ loadError() }}</p>
              </div>
            </div>
          </div>
        } @else if (!result() || result()!.rows.length === 0) {
          <div class="surface">
            <div class="empty-state">
              <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
              </svg>
              <p class="empty-state-title">No data available</p>
              <p class="empty-state-text">Click "Refresh data" to load monitoring information.</p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MonitoringComponent {
  private readonly api = inject(ApiService);

  private readonly cardColumnOrder = [
    'FileGroup', 'AllocatedSpaceMB', 'UsedSpaceMB', 'FreeSpaceMB',
    'Autogrow', 'FreeDriveMB', 'PartSizeMB', 'TotalFreeSpaceMB', 'AlertLevel'
  ];

  isLoading = signal(false);
  loadError = signal<string | null>(null);
  result = signal<MonitoringTableResult | null>(null);
  lastRefresh = signal<string | null>(null);

  dbCards = computed<DbCard[]>(() => {
    const r = this.result();
    if (!r || r.rows.length === 0) return [];

    const dbNameIndex = r.columns.findIndex(c => c.toLowerCase() === 'databasename');
    if (dbNameIndex < 0) return [];

    const tableColumns = this.cardColumnOrder
      .map(col => ({ column: col, index: r.columns.findIndex(c => c.toLowerCase() === col.toLowerCase()) }))
      .filter(item => item.index >= 0);

    const groups = new Map<string, (string | null)[][]>();
    for (const row of r.rows) {
      const dbName = row[dbNameIndex] || 'Unknown';
      if (!groups.has(dbName)) groups.set(dbName, []);
      const mappedRow = tableColumns.map(item => row[item.index] ?? null);
      groups.get(dbName)!.push(mappedRow);
    }

    return Array.from(groups.entries())
      .map(([name, rows]) => ({ name, columns: tableColumns.map(i => i.column), rows }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.api.getMonitoringData().subscribe({
      next: (data) => {
        this.result.set(data);
        this.lastRefresh.set(new Date().toLocaleString('sv-SE').replace('T', ' '));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(err.message || 'Unknown error');
        this.isLoading.set(false);
      }
    });
  }

  toHeaderLabel(columnName: string): string {
    return columnName.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formatCellValue(value: string | null, column: string): string {
    if (!value) return '-';
    const num = parseFloat(value);
    if (!isNaN(num) && column.toLowerCase().includes('mb')) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 0 }).replace(/,/g, ' ') + ' MB';
    }
    if (!isNaN(num)) {
      return num.toLocaleString('en-US').replace(/,/g, ' ');
    }
    return value;
  }

  getColumnAlignmentClass(column: string): string {
    if (column.toLowerCase() === 'filegroup' || column.toLowerCase() === 'autogrow') return 'db-grid__cell--text';
    if (column.toLowerCase() === 'alertlevel') return 'db-grid__cell--status';
    return 'db-grid__cell--num';
  }

  getCellClass(column: string, value: string | null): string {
    if (column.toLowerCase() === 'filegroup' || column.toLowerCase() === 'autogrow') return 'db-grid__cell--text';
    if (column.toLowerCase() === 'alertlevel') return 'db-grid__cell--status';
    return 'db-grid__cell--num';
  }

  getRowAlertClass(row: (string | null)[], columns: string[]): string {
    const alertIndex = columns.findIndex(c => c.toLowerCase() === 'alertlevel');
    if (alertIndex < 0) return '';
    const value = row[alertIndex]?.trim().toUpperCase();
    if (value === 'WARNING') return 'alert-warning';
    if (value === 'CRITICAL') return 'alert-critical';
    return '';
  }

  getAlertBadgeClass(value: string | null): string {
    const v = value?.trim().toUpperCase();
    if (v === 'OK') return 'bg-emerald-500/20 text-emerald-400';
    if (v === 'WARNING') return 'bg-amber-500/20 text-amber-400';
    if (v === 'CRITICAL') return 'bg-rose-500/20 text-rose-400';
    return 'bg-slate-500/20 text-slate-400';
  }

  getAlertDotClass(value: string | null): string {
    const v = value?.trim().toUpperCase();
    if (v === 'OK') return 'bg-emerald-400';
    if (v === 'WARNING') return 'bg-amber-400';
    if (v === 'CRITICAL') return 'bg-rose-400 animate-pulse';
    return 'bg-slate-400';
  }
}
