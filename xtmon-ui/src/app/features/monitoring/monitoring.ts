import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/state';
import { DbCard, MonitoringTableResult } from '../../models/monitoring';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.css'
})
export class MonitoringComponent implements OnInit {
  dbCards: DbCard[] = [];
  isLoading = false;
  loadError: string | null = null;
  lastRefresh: Date | null = null;

  private readonly DatabaseNameColumn = 'DatabaseName';
  private readonly CardColumnOrder = [
    'FileGroup',
    'AllocatedSpaceMB',
    'UsedSpaceMB',
    'FreeSpaceMB',
    'Autogrow',
    'FreeDriveMB',
    'PartSizeMB',
    'TotalFreeSpaceMB',
    'AlertLevel'
  ];

  constructor(private stateService: StateService) { }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.isLoading = true;
    this.loadError = null;
    this.stateService.getDbSizePlusDisk().subscribe({
      next: (result) => {
        this.buildDbCards(result);
        this.lastRefresh = new Date();
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err.message;
        this.isLoading = false;
      }
    });
  }

  private buildDbCards(result: MonitoringTableResult): void {
    if (!result || !result.rows || result.rows.length === 0) {
      this.dbCards = [];
      return;
    }

    const dbNameIndex = this.findColumnIndex(result.columns, this.DatabaseNameColumn);
    if (dbNameIndex < 0) {
      this.dbCards = [];
      return;
    }

    const tableColumns = this.CardColumnOrder
      .map(column => ({ column, index: this.findColumnIndex(result.columns, column) }))
      .filter(item => item.index >= 0);

    const groups = new Map<string, (string | null)[][]>();

    result.rows.forEach(row => {
      if (row.length > dbNameIndex) {
        const key = row[dbNameIndex] || 'Unknown';
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(row);
      }
    });

    this.dbCards = Array.from(groups.entries()).map(([name, rows]) => {
      const cardRows = rows.map(row =>
        tableColumns.map(item => row.length > item.index ? row[item.index] : null)
      );
      return {
        name,
        columns: tableColumns.map(item => item.column),
        rows: cardRows
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  private findColumnIndex(columns: string[], columnName: string): number {
    return columns.findIndex(c => c.toLowerCase() === columnName.toLowerCase());
  }

  formatHeader(columnName: string): string {
    return columnName.replace(/([A-Z])/g, ' $1').trim();
  }

  formatCellValue(value: string | null): string {
    if (!value) return '-';
    // Check if number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
      // Format with spaces for thousands
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return value;
  }

  getAlertLevelClass(value: string | null): string {
    if (!value) return '';
    const v = value.trim().toUpperCase();
    switch (v) {
      case 'OK': return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800';
      case 'WARNING': return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800';
      case 'CRITICAL': return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800';
      default: return 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800';
    }
  }

  getColumnAlignmentClass(columnName: string): string {
    if (columnName.toLowerCase() === 'filegroup') return 'text-left';
    if (columnName.toLowerCase() === 'alertlevel') return 'text-center';
    return 'text-right font-mono';
  }
