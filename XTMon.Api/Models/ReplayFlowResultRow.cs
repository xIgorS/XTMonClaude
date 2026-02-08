namespace XTMon.Models;

public sealed record ReplayFlowResultRow(
    long FlowIdDerivedFrom,
    long FlowId,
    DateOnly PnlDate,
    bool WithBackdated,
    bool SkipCoreProcess,
    bool Droptabletpm);
