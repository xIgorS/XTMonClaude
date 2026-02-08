export interface MonitoringTableResult {
    columns: string[];
    rows: (string | null)[][];
}

export interface DbCard {
    name: string;
    columns: string[];
    rows: (string | null)[][];
}
