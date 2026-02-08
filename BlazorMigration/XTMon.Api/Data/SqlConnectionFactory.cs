using Microsoft.Data.SqlClient;

namespace XTMon.Api.Data;

public sealed class SqlConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("LogFiAlmt")
            ?? throw new InvalidOperationException("Missing connection string 'LogFiAlmt'.");
    }

    public SqlConnection CreateConnection() => new(_connectionString);
}
