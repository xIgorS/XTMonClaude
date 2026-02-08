import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonitoringTableResult } from '../models/monitoring';
import { FailedFlowRow, ReplayFlowResultRow, ReplayFlowSubmissionRow } from '../models/replay-flows';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private apiUrl = 'http://localhost:5034/api';

  constructor(private http: HttpClient) { }

  getDbSizePlusDisk(): Observable<MonitoringTableResult> {
    return this.http.get<MonitoringTableResult>(`${this.apiUrl}/monitoring/db-size`);
  }

  getFailedFlows(pnlDate: string): Observable<FailedFlowRow[]> {
    return this.http.get<FailedFlowRow[]>(`${this.apiUrl}/replay-flows/failed`, {
      params: { pnlDate }
    });
  }

  replayFlows(rows: ReplayFlowSubmissionRow[]): Observable<ReplayFlowResultRow[]> {
    return this.http.post<ReplayFlowResultRow[]>(`${this.apiUrl}/replay-flows/replay`, rows);
  }
}
