using System.Globalization;
using XTMon.Api.Data;
using XTMon.Api.Models;
using XTMon.Api.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<MonitoringOptions>(builder.Configuration.GetSection(MonitoringOptions.SectionName));
builder.Services.Configure<ReplayFlowsOptions>(builder.Configuration.GetSection(ReplayFlowsOptions.SectionName));
builder.Services.AddSingleton<SqlConnectionFactory>();
builder.Services.AddScoped<DbMonitoringRepository>();

// Configure CORS for Angular
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

// API Endpoints
app.MapGet("/api/monitoring", async (DbMonitoringRepository repository, CancellationToken cancellationToken) =>
{
    var result = await repository.GetDbSizePlusDiskAsync(cancellationToken);
    return Results.Ok(result);
});

app.MapGet("/api/replay-flows", async (string pnlDate, DbMonitoringRepository repository, CancellationToken cancellationToken) =>
{
    if (!DateOnly.TryParseExact(pnlDate, ["yyyy-MM-dd", "dd-MM-yyyy"], CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
    {
        return Results.BadRequest("Invalid date format. Use yyyy-MM-dd or dd-MM-yyyy.");
    }

    var result = await repository.GetFailedFlowsAsync(parsedDate, cancellationToken);
    return Results.Ok(result);
});

app.MapPost("/api/replay-flows", async (ReplayFlowSubmissionRow[] rows, DbMonitoringRepository repository, CancellationToken cancellationToken) =>
{
    var result = await repository.ReplayFlowsAsync(rows, cancellationToken);
    return Results.Ok(result);
});

app.Run();
