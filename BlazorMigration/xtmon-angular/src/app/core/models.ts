export interface MonitoringTableResult {
    columns: string[];
    rows: (string | null)[][];
}

export interface FailedFlowRow {
    flowId: number | null;
    flowIdDerivedFrom: number | null;
    businessDataTypeId: number | null;
    feedSourceId: number | null;
    feedSourceName: string | null;
    pnlDate: string;
    reportingDate: string | null;
    fileName: string | null;
    arrivalDate: string | null;
    packageGuid: string | null;
    currentStep: string | null;
    isFailed: string | null;
    typeOfCalculation: string | null;
    withBackdated: boolean;
    skipCoreProcess: boolean;
    droptabletpm: boolean;
}

export interface ReplayFlowSubmissionRow {
    flowIdDerivedFrom: number;
    flowId: number;
    pnlDate: string;
    withBackdated: boolean;
    skipCoreProcess: boolean;
    droptabletpm: boolean;
}

export interface ReplayFlowResultRow {
    flowIdDerivedFrom: number;
    flowId: number;
    pnlDate: string;
    withBackdated: boolean;
    skipCoreProcess: boolean;
    droptabletpm: boolean;
}
