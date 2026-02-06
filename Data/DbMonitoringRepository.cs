using Microsoft.Extensions.Options;
using System.Data;
using XTMon.Models;
using XTMon.Options;

namespace XTMon.Data;

public sealed class DbMonitoringRepository
{
    private readonly SqlConnectionFactory _connectionFactory;
    private readonly MonitoringOptions _options;

    public DbMonitoringRepository(SqlConnectionFactory connectionFactory, IOptions<MonitoringOptions> options)
    {
        _connectionFactory = connectionFactory;
        _options = options.Value;
    }

    public async Task<MonitoringTableResult> GetDbSizePlusDiskAsync(CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        using var command = connection.CreateCommand();
        command.CommandText = _options.DbSizePlusDiskStoredProcedure;
        command.CommandType = CommandType.StoredProcedure;
        command.CommandTimeout = _options.CommandTimeoutSeconds;

        await connection.OpenAsync(cancellationToken);
        using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var columns = new List<string>();
        for (var i = 0; i < reader.FieldCount; i++)
        {
            columns.Add(reader.GetName(i));
        }

        var rows = new List<IReadOnlyList<string?>>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var row = new string?[reader.FieldCount];
            for (var i = 0; i < reader.FieldCount; i++)
            {
                if (reader.IsDBNull(i))
                {
                    row[i] = null;
                    continue;
                }

                var value = reader.GetValue(i);
                row[i] = value switch
                {
                    DateTime dt => dt.ToString("yyyy-MM-dd HH:mm:ss"),
                    DateTimeOffset dto => dto.ToString("yyyy-MM-dd HH:mm:ss"),
                    decimal dec => dec.ToString("0.##"),
                    double dbl => dbl.ToString("0.##"),
                    float flt => flt.ToString("0.##"),
                    _ => value.ToString()
                };
            }

            rows.Add(row);
        }

        return new MonitoringTableResult(columns, rows);
    }
}
