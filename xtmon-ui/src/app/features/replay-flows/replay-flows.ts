import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state';
import { FailedFlowRow, ReplayFlowResultRow, ReplayFlowSubmissionRow } from '../../models/replay-flows';
import { parse, format, isValid } from 'date-fns';

interface ReplayFlowGridRow {
  source: FailedFlowRow;
  isSelected: boolean;
  skipCoreProcess: boolean;
  droptabletpm: boolean;
}

@Component({
  selector: 'app-replay-flows',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './replay-flows.html',
  styleUrl: './replay-flows.css'
})
export class ReplayFlowsComponent {
  rows: ReplayFlowGridRow[] = [];
  replayResults: ReplayFlowResultRow[] = [];

  pnlDateInput: string = '';
  feedSourceFilter: string = '';
  typeOfCalculationFilter: string = '';

  pnlDateError: string | null = null;
  isLoading = false;
  isSubmitting = false;
  hasLoaded = false;
  loadError: string | null = null;
  statusMessage: string | null = null;
  statusIsError = false;

  lastRefresh: Date | null = null;
  lastPnlDate: string | null = null;

  // Constants
  private readonly DisplayDateFormat = 'dd-MM-yyyy';
  private readonly AcceptedDateFormats = [
    'dd-MM-yyyy',
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'yyyy/MM/dd'
  ];

  constructor(private stateService: StateService) { }

  get selectedRowsCount(): number {
    return this.rows.filter(r => r.isSelected).length;
  }

  get canSubmit(): boolean {
    return !this.isSubmitting && !this.isLoading && this.selectedRowsCount > 0;
  }

  get canSelectAll(): boolean {
    return !this.isSubmitting && !this.isLoading && this.getFilteredRows().length > 0;
  }

  get feedSourceOptions(): string[] {
    const sources = this.rows
      .map(r => r.source.feedSourceName)
      .filter(s => !!s) as string[];
    return [...new Set(sources)].sort();
  }

  get typeOfCalculationOptions(): string[] {
    const types = this.rows
      .map(r => r.source.typeOfCalculation)
      .filter(t => !!t) as string[];
    return [...new Set(types)].sort();
  }

  reload(): void {
    if (!this.validatePnlDate()) {
      return;
    }

    // Normalize date format
    const parsedDate = this.parseDate(this.pnlDateInput);
    if (!parsedDate) return;

    // Format for API (API expects string, let's use the input format or ISO depending on backend)
    // Backend expects: "dd-MM-yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "yyyy/MM/dd"
    // We'll normalize to dd-MM-yyyy
    const apiDate = format(parsedDate, 'dd-MM-yyyy');

    this.isLoading = true;
    this.loadError = null;
    this.statusMessage = null;
    this.statusIsError = false;

    this.stateService.getFailedFlows(apiDate).subscribe({
      next: (data) => {
        this.rows = data.map(row => ({
          source: row,
          isSelected: false,
          skipCoreProcess: row.skipCoreProcess,
          droptabletpm: row.droptabletpm
        }));
        this.replayResults = [];
        this.hasLoaded = true;
        this.lastRefresh = new Date();
        this.lastPnlDate = apiDate;
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err.message;
        this.rows = [];
        this.hasLoaded = false;
        this.isLoading = false;
      }
    });
  }

  submit(): void {
    if (!this.hasLoaded) {
      this.setStatus("Load data first by entering a Pnl date and pressing Enter.", true);
      return;
    }

    const selectedRows = this.rows.filter(r => r.isSelected);
    if (selectedRows.length === 0) {
      this.setStatus("Select at least one row to submit.", true);
      return;
    }

    const submissionRows: ReplayFlowSubmissionRow[] = [];
    for (const row of selectedRows) {
      if (row.source.flowId === null || row.source.flowIdDerivedFrom === null) {
        // Logic from C# - wait, properties names might differ slightly in my interface vs C#
        // C# Source.FlowId vs interface 'flowId'
        // Let's check interface: flowId, flowIdDerivedFrom
      }

      if (row.source.flowId === null || row.source.flowIdDerivedFrom === null) {
        this.setStatus("Selected rows must have FlowId and FlowIdDerivedFrom values.", true);
        return;
      }

      submissionRows.push({
        flowIdDerivedFrom: row.source.flowIdDerivedFrom,
        flowId: row.source.flowId,
        pnlDate: row.source.pnlDate, // Assuming string
        withBackdated: row.source.withBackdated,
        skipCoreProcess: row.skipCoreProcess, // User editable
        droptabletpm: row.droptabletpm // User editable
      });
    }

    this.isSubmitting = true;
    this.setStatus(null, false);

    this.stateService.replayFlows(submissionRows).subscribe({
      next: (results) => {
        this.replayResults = results;
        // Remove processed rows
        this.rows = this.rows.filter(r => !r.isSelected);
        this.setStatus(`Submitted ${submissionRows.length} row(s) for replay.`, false);
        this.isSubmitting = false;
      },
      error: (err) => {
        this.setStatus(err.message, true);
        this.isSubmitting = false;
      }
    });
  }

  private validatePnlDate(): boolean {
    if (!this.pnlDateInput) {
      this.pnlDateError = "Enter a Pnl date.";
      return false;
    }
    const parsed = this.parseDate(this.pnlDateInput);
    if (!parsed) {
      this.pnlDateError = "Invalid date format. Use DD-MM-YYYY.";
      return false;
    }
    this.pnlDateError = null;
    return true;
  }

  private parseDate(input: string): Date | null {
    for (const fmt of this.AcceptedDateFormats) {
      const d = parse(input, fmt, new Date());
      if (isValid(d)) return d;
    }
    return null;
  }

  selectAll(): void {
    if (!this.canSelectAll) return;
    const filtered = this.getFilteredRows();
    const allSelected = filtered.every(r => r.isSelected);
    filtered.forEach(r => r.isSelected = !allSelected);
  }

  getFilteredRows(): ReplayFlowGridRow[] {
    return this.rows.filter(row => {
      let match = true;
      if (this.feedSourceFilter) {
        match = match && row.source.feedSourceName === this.feedSourceFilter;
      }
      if (this.typeOfCalculationFilter) {
        match = match && row.source.typeOfCalculation === this.typeOfCalculationFilter;
      }
      return match;
    });
  }

  setStatus(message: string | null, isError: boolean): void {
    this.statusMessage = message;
    this.statusIsError = isError;
  }

  // Formatting helpers
  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    // Try to parse if it's ISO
    const d = new Date(dateStr);
    if (isValid(d)) return format(d, this.DisplayDateFormat);
    return dateStr;
  }
}
