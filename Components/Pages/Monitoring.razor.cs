using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Options;
using XTMon.Data;
using XTMon.Models;
using XTMon.Options;

namespace XTMon.Components.Pages;

public partial class Monitoring : ComponentBase
{
    [Inject]
    private DbMonitoringRepository Repository { get; set; } = default!;

    [Inject]
    private IOptions<MonitoringOptions> MonitoringOptions { get; set; } = default!;

    private MonitoringTableResult? result;
    private bool isLoading;
    private string? loadError;
    private DateTimeOffset? lastRefresh;

    private string ProcedureName => MonitoringOptions.Value.DbSizePlusDiskStoredProcedure;

    protected override async Task OnInitializedAsync()
    {
        await ReloadAsync();
    }

    private async Task ReloadAsync()
    {
        isLoading = true;
        loadError = null;

        try
        {
            result = await Repository.GetDbSizePlusDiskAsync(CancellationToken.None);
            lastRefresh = DateTimeOffset.Now;
        }
        catch (Exception ex)
        {
            loadError = ex.Message;
        }
        finally
        {
            isLoading = false;
        }
    }
}
