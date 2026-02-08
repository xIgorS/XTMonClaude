using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using XTMon.Data;
using XTMon.Models;
using XTMon.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Configure Options
builder.Services.Configure<MonitoringOptions>(builder.Configuration.GetSection(MonitoringOptions.SectionName));
builder.Services.Configure<ReplayFlowsOptions>(builder.Configuration.GetSection(ReplayFlowsOptions.SectionName));

// Configure Data Access
builder.Services.AddSingleton<SqlConnectionFactory>();
builder.Services.AddScoped<DbMonitoringRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// API Endpoints

// Monitoring Group
var monitoringGroup = app.MapGroup("/api/monitoring");

monitoringGroup.MapGet("/db-size", async (DbMonitoringRepository repository, CancellationToken cancellationToken) =>
{
    var result = await repository.GetDbSizePlusDiskAsync(cancellationToken);
    return Results.Ok(result);
})
.WithName("GetDbSizePlusDisk");


// Replay Flows Group
var replayFlowsGroup = app.MapGroup("/api/replay-flows");

replayFlowsGroup.MapGet("/failed", async ([FromQuery] string pnlDate, DbMonitoringRepository repository, CancellationToken cancellationToken) =>
{
    if (!DateOnly.TryParseExact(pnlDate, new[] { "dd-MM-yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "yyyy/MM/dd" }, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var date))
    {
         return Results.BadRequest("Invalid PnL date format. Accepted formats: dd-MM-yyyy, yyyy-MM-dd, dd/MM/yyyy, yyyy/MM/dd");
    }

    var result = await repository.GetFailedFlowsAsync(date, cancellationToken);
    return Results.Ok(result);
})
.WithName("GetFailedFlows");

replayFlowsGroup.MapPost("/replay", async ([FromBody] List<ReplayFlowSubmissionRow> rows, DbMonitoringRepository repository, CancellationToken cancellationToken) =>
{
    try
    {
        var result = await repository.ReplayFlowsAsync(rows, cancellationToken);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
})
.WithName("ReplayFlows");

app.Run();
