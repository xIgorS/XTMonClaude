import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FailedFlowRow, ReplayFlowResultRow, ReplayFlowSubmissionRow } from '../../core/models';
import { StatCardComponent } from '../../shared/stat-card.component';

interface GridRow {
  source: FailedFlowRow;
  isSelected: boolean;
  skipCoreProcess: boolean;
  droptabletpm: boolean;
}

@Component({
  selector: 'app-replay-flows',
  standalone: true,
  imports: [FormsModule, StatCardComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Replay Operations</p>
          <h1 class="text-2xl font-bold text-white">Replay Flows</h1>
          <p class="muted mt-1">Pull failed flows and submit replay requests.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="secondary-button" (click)="reload()" [disabled]="!isPnlDateValid() || isLoading() || isSubmitting()">
            <svg class="w-4 h-4" [class.animate-spin]="isLoading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ isLoading() ? 'Loading...' : 'Refresh' }}
          </button>
          <button class="secondary-button" (click)="selectAll()" [disabled]="!canSelectAll()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Select All
          </button>
          <button class="primary-button" (click)="submit()" [disabled]="!canSubmit()">
            <svg class="w-4 h-4" [class.animate-spin]="isSubmitting()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (isSubmitting()) {
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              }
            </svg>
            {{ isSubmitting() ? 'Submitting...' : 'Submit (' + selectedCount() + ')' }}
          </button>
        </div>
      </div>

      <div class="rounded-xl bg-slate-800/50 border border-slate-700/30 p-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium uppercase tracking-widest text-slate-500" for="pnlDate">Pnl Date</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <input id="pnlDate" type="text" class="replay-input pl-10 w-40" placeholder="DD-MM-YYYY"
                [(ngModel)]="pnlDateInput" (keydown.enter)="reload()" (blur)="normalizePnlDate()" [disabled]="isSubmitting()">
            </div>
            @if (pnlDateError()) {
              <p class="text-xs text-rose-400">{{ pnlDateError() }}</p>
            }
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium uppercase tracking-widest text-slate-500" for="feedSourceFilter">Feed Source</label>
            <select id="feedSourceFilter" class="replay-input min-w-[160px]" [(ngModel)]="feedSourceFilter" [disabled]="isSubmitting()">
              <option value="">All Sources</option>
              @for (option of feedSourceOptions(); track option) {
                <option [value]="option">{{ option }}</option>
              }
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium uppercase tracking-widest text-slate-500" for="typeOfCalculationFilter">Calculation Type</label>
            <select id="typeOfCalculationFilter" class="replay-input min-w-[160px]" [(ngModel)]="typeOfCalculationFilter" [disabled]="isSubmitting()">
              <option value="">All Types</option>
              @for (option of typeOfCalculationOptions(); track option) {
                <option [value]="option">{{ option }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <app-stat-card label="Last refresh" [value]="lastRefresh() || 'Not loaded'" description="Local time" icon="clock"></app-stat-card>
        <app-stat-card label="Total rows" [value]="rows().length.toString()" description="From stored procedure" icon="rows"></app-stat-card>
        <app-stat-card label="Pnl date" [value]="lastPnlDate() || '-'" description="Last requested" icon="calendar"></app-stat-card>
        <app-stat-card label="Selected" [value]="selectedCount().toString()" description="Ready to submit" icon="status"></app-stat-card>
      </div>

      @if (statusMessage()) {
        <div class="rounded-xl p-4" [class]="statusIsError() ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'">
          <div class="flex items-center gap-3">
            @if (statusIsError()) {
              <svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            } @else {
              <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
            <p class="text-sm font-medium" [class]="statusIsError() ? 'text-rose-400' : 'text-emerald-400'">{{ statusMessage() }}</p>
          </div>
        </div>
      }

      <div class="space-y-4">
        @if (isLoading()) {
          <div class="surface">
            <div class="flex items-center justify-center gap-3 py-8">
              <svg class="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-slate-300">Loading failed flows...</p>
            </div>
          </div>
        } @else if (loadError()) {
          <div class="surface border-rose-500/30 bg-rose-500/5">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-rose-400">Failed to load replay flows</p>
                <p class="mt-1 text-sm text-rose-300/80">{{ loadError() }}</p>
              </div>
            </div>
          </div>
        } @else if (hasLoaded()) {
          <div class="surface p-0 overflow-hidden">
            <div class="db-grid__wrap">
              <table class="db-grid">
                <thead>
                  <tr>
                    <th class="db-grid__head db-grid__cell--checkbox sticky left-0 bg-slate-800/95 z-10">
                      <span class="sr-only">Select</span>
                    </th>
                    <th class="db-grid__head db-grid__cell--num">Flow ID</th>
                    <th class="db-grid__head db-grid__cell--num">Derived</th>
                    <th class="db-grid__head db-grid__cell--text">Feed Source</th>
                    <th class="db-grid__head db-grid__cell--text">Pnl Date</th>
                    <th class="db-grid__head db-grid__cell--text">File Name</th>
                    <th class="db-grid__head db-grid__cell--text">Current Step</th>
                    <th class="db-grid__head db-grid__cell--text">Status</th>
                    <th class="db-grid__head db-grid__cell--text">Calc Type</th>
                    <th class="db-grid__head db-grid__cell--checkbox">Backdated</th>
                    <th class="db-grid__head db-grid__cell--checkbox">Skip Core</th>
                    <th class="db-grid__head db-grid__cell--checkbox">Drop TPM</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredRows().length === 0) {
                    <tr>
                      <td class="px-4 py-12 text-center" colspan="12">
                        <div class="empty-state">
                          <svg class="empty-state-icon mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <p class="empty-state-title">{{ rows().length === 0 ? 'No failed flows found' : 'No rows match filters' }}</p>
                          <p class="empty-state-text">{{ rows().length === 0 ? 'Try a different Pnl date.' : 'Adjust your filter criteria.' }}</p>
                        </div>
                      </td>
                    </tr>
                  } @else {
                    @for (row of filteredRows(); track row.source.flowId) {
                      <tr class="db-grid__row" [class.bg-indigo-500/10]="row.isSelected" [class.border-l-2]="row.isSelected" [class.border-l-indigo-500]="row.isSelected">
                        <td class="db-grid__cell db-grid__cell--checkbox sticky left-0 bg-slate-900/95 z-10">
                          <input type="checkbox" class="replay-checkbox" [checked]="row.isSelected" (change)="toggleRowSelection(row)" [disabled]="isSubmitting()">
                        </td>
                        <td class="db-grid__cell db-grid__cell--num font-mono text-xs">{{ formatNumber(row.source.flowId) }}</td>
                        <td class="db-grid__cell db-grid__cell--num font-mono text-xs">{{ formatNumber(row.source.flowIdDerivedFrom) }}</td>
                        <td class="db-grid__cell db-grid__cell--text">
                          <span class="inline-flex items-center rounded-md bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-300">
                            {{ row.source.feedSourceName || '-' }}
                          </span>
                        </td>
                        <td class="db-grid__cell db-grid__cell--text font-mono text-xs">{{ formatDate(row.source.pnlDate) }}</td>
                        <td class="db-grid__cell db-grid__cell--text max-w-[200px] truncate" [title]="row.source.fileName || ''">{{ row.source.fileName || '-' }}</td>
                        <td class="db-grid__cell db-grid__cell--text">{{ row.source.currentStep || '-' }}</td>
                        <td class="db-grid__cell db-grid__cell--text">
                          @if (row.source.isFailed?.toLowerCase() === 'true' || row.source.isFailed === '1') {
                            <span class="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400">
                              <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              Failed
                            </span>
                          } @else {
                            <span class="text-slate-500">{{ row.source.isFailed || '-' }}</span>
                          }
                        </td>
                        <td class="db-grid__cell db-grid__cell--text text-xs">{{ row.source.typeOfCalculation || '-' }}</td>
                        <td class="db-grid__cell db-grid__cell--checkbox">
                          <input type="checkbox" class="replay-checkbox" [checked]="row.source.withBackdated" disabled>
                        </td>
                        <td class="db-grid__cell db-grid__cell--checkbox">
                          <input type="checkbox" class="replay-checkbox" [(ngModel)]="row.skipCoreProcess" [disabled]="!row.isSelected || isSubmitting()">
                        </td>
                        <td class="db-grid__cell db-grid__cell--checkbox">
                          <input type="checkbox" class="replay-checkbox" [(ngModel)]="row.droptabletpm" [disabled]="!row.isSelected || isSubmitting()">
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      @if (replayResults().length > 0) {
        <div class="surface">
          <div class="db-card-header">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="db-card-title">Submitted Flows</h3>
            </div>
            <span class="text-xs text-slate-500">{{ replayResults().length }} rows</span>
          </div>
          <div class="db-grid__wrap">
            <table class="db-grid">
              <thead>
                <tr>
                  <th class="db-grid__head db-grid__cell--num">Flow ID</th>
                  <th class="db-grid__head db-grid__cell--num">Derived From</th>
                  <th class="db-grid__head db-grid__cell--text">Pnl Date</th>
                  <th class="db-grid__head db-grid__cell--checkbox">Backdated</th>
                  <th class="db-grid__head db-grid__cell--checkbox">Skip Core</th>
                  <th class="db-grid__head db-grid__cell--checkbox">Drop TPM</th>
                </tr>
              </thead>
              <tbody>
                @for (result of replayResults(); track result.flowId) {
                  <tr class="db-grid__row">
                    <td class="db-grid__cell db-grid__cell--num font-mono text-xs">{{ formatNumber(result.flowId) }}</td>
                    <td class="db-grid__cell db-grid__cell--num font-mono text-xs">{{ formatNumber(result.flowIdDerivedFrom) }}</td>
                    <td class="db-grid__cell db-grid__cell--text font-mono text-xs">{{ formatDate(result.pnlDate) }}</td>
                    <td class="db-grid__cell db-grid__cell--checkbox"><input type="checkbox" class="replay-checkbox" [checked]="result.withBackdated" disabled></td>
                    <td class="db-grid__cell db-grid__cell--checkbox"><input type="checkbox" class="replay-checkbox" [checked]="result.skipCoreProcess" disabled></td>
                    <td class="db-grid__cell db-grid__cell--checkbox"><input type="checkbox" class="replay-checkbox" [checked]="result.droptabletpm" disabled></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class ReplayFlowsComponent {
  private readonly api = inject(ApiService);

  pnlDateInput = '';
  feedSourceFilter = '';
  typeOfCalculationFilter = '';

  rows = signal<GridRow[]>([]);
  replayResults = signal<ReplayFlowResultRow[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  hasLoaded = signal(false);
  loadError = signal<string | null>(null);
  pnlDateError = signal<string | null>(null);
  statusMessage = signal<string | null>(null);
  statusIsError = signal(false);
  lastRefresh = signal<string | null>(null);
  lastPnlDate = signal<string | null>(null);
  selectedCount = signal(0);

  feedSourceOptions = computed(() => {
    return [...new Set(this.rows().map(r => r.source.feedSourceName).filter(Boolean) as string[])].sort();
  });

  typeOfCalculationOptions = computed(() => {
    return [...new Set(this.rows().map(r => r.source.typeOfCalculation).filter(Boolean) as string[])].sort();
  });

  filteredRows = computed(() => {
    return this.rows().filter(r => {
      const matchFeed = !this.feedSourceFilter || r.source.feedSourceName?.toLowerCase() === this.feedSourceFilter.toLowerCase();
      const matchType = !this.typeOfCalculationFilter || r.source.typeOfCalculation?.toLowerCase() === this.typeOfCalculationFilter.toLowerCase();
      return matchFeed && matchType;
    });
  });

  canSelectAll = computed(() => !this.isSubmitting() && !this.isLoading() && this.filteredRows().length > 0);
  canSubmit = computed(() => !this.isSubmitting() && !this.isLoading() && this.selectedCount() > 0);

  isPnlDateValid(): boolean {
    return this.parsePnlDate(this.pnlDateInput) !== null;
  }

  parsePnlDate(input: string): Date | null {
    if (!input.trim()) return null;
    let match = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) return new Date(+match[3], +match[2] - 1, +match[1]);
    match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return new Date(+match[1], +match[2] - 1, +match[3]);
    match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) return new Date(+match[3], +match[2] - 1, +match[1]);
    match = input.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (match) return new Date(+match[1], +match[2] - 1, +match[3]);
    return null;
  }

  formatPnlDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  normalizePnlDate() {
    const date = this.parsePnlDate(this.pnlDateInput);
    if (date) {
      this.pnlDateInput = this.formatPnlDate(date);
      this.statusMessage.set(null);
      this.statusIsError.set(false);
    }
  }

  reload() {
    const date = this.parsePnlDate(this.pnlDateInput);
    if (!date) {
      this.pnlDateError.set('Enter a valid date (DD-MM-YYYY)');
      return;
    }
    this.pnlDateError.set(null);
    this.pnlDateInput = this.formatPnlDate(date);
    const isoDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    this.isLoading.set(true);
    this.loadError.set(null);
    this.statusMessage.set(null);
    this.statusIsError.set(false);

    this.api.getFailedFlows(isoDate).subscribe({
      next: (data) => {
        this.rows.set(data.map(source => ({
          source,
          isSelected: false,
          skipCoreProcess: source.skipCoreProcess,
          droptabletpm: source.droptabletpm
        })));
        this.replayResults.set([]);
        this.hasLoaded.set(true);
        this.lastRefresh.set(new Date().toLocaleString('sv-SE').replace('T', ' '));
        this.lastPnlDate.set(this.pnlDateInput);
        this.selectedCount.set(0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set(err.message || 'Unknown error');
        this.rows.set([]);
        this.hasLoaded.set(false);
        this.isLoading.set(false);
      }
    });
  }

  selectAll() {
    this.filteredRows().forEach(row => row.isSelected = true);
    this.selectedCount.set(this.rows().filter(r => r.isSelected).length);
  }

  toggleRowSelection(row: GridRow) {
    row.isSelected = !row.isSelected;
    this.selectedCount.set(this.rows().filter(r => r.isSelected).length);
  }

  submit() {
    const selected = this.rows().filter(r => r.isSelected);
    if (selected.length === 0) {
      this.statusMessage.set('Select at least one row to submit.');
      this.statusIsError.set(true);
      return;
    }

    const invalid = selected.find(r => r.source.flowId == null || r.source.flowIdDerivedFrom == null);
    if (invalid) {
      this.statusMessage.set('Selected rows must have FlowId and FlowIdDerivedFrom values.');
      this.statusIsError.set(true);
      return;
    }

    const submissions: ReplayFlowSubmissionRow[] = selected.map(r => ({
      flowIdDerivedFrom: r.source.flowIdDerivedFrom!,
      flowId: r.source.flowId!,
      pnlDate: r.source.pnlDate,
      withBackdated: r.source.withBackdated,
      skipCoreProcess: r.skipCoreProcess,
      droptabletpm: r.droptabletpm
    }));

    this.isSubmitting.set(true);
    this.statusMessage.set(null);

    this.api.submitReplayFlows(submissions).subscribe({
      next: (results) => {
        this.replayResults.set(results);
        this.rows.update(rows => rows.filter(r => !r.isSelected));
        this.selectedCount.set(0);
        this.statusMessage.set(`Successfully submitted ${submissions.length} flow(s) for replay.`);
        this.statusIsError.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.statusMessage.set(err.message || 'Unknown error');
        this.statusIsError.set(true);
        this.isSubmitting.set(false);
      }
    });
  }

  formatNumber(value: number | null): string {
    if (value == null) return '-';
    return value.toString();
  }

  formatDate(value: string | null): string {
    if (!value) return '-';
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return value;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return this.formatPnlDate(date);
  }
}
