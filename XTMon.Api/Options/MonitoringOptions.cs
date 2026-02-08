namespace XTMon.Options;

public sealed class MonitoringOptions
{
    public const string SectionName = "Monitoring";

    public string DbSizePlusDiskStoredProcedure { get; set; } = "GetDbSizePlusDisk";
    public int CommandTimeoutSeconds { get; set; } = 30;
}
