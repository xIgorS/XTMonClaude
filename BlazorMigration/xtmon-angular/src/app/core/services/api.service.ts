import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonitoringTableResult, FailedFlowRow, ReplayFlowSubmissionRow, ReplayFlowResultRow } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api';

    getMonitoringData(): Observable<MonitoringTableResult> {
        return this.http.get<MonitoringTableResult>(`${this.baseUrl}/monitoring`);
    }

    getFailedFlows(pnlDate: string): Observable<FailedFlowRow[]> {
        return this.http.get<FailedFlowRow[]>(`${this.baseUrl}/replay-flows`, {
            params: { pnlDate }
        });
    }

    submitReplayFlows(rows: ReplayFlowSubmissionRow[]): Observable<ReplayFlowResultRow[]> {
        return this.http.post<ReplayFlowResultRow[]>(`${this.baseUrl}/replay-flows`, rows);
    }
}
