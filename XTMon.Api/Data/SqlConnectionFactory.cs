using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace XTMon.Data;

public sealed class SqlConnectionFactory
{
    private readonly IConfiguration _configuration;

    public SqlConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public SqlConnection CreateConnection()
    {
        var connectionString = _configuration.GetConnectionString("LogFiAlmt");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'LogFiAlmt' is not configured.");
        }

        return new SqlConnection(connectionString);
    }
}
