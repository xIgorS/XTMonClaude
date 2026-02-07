# XTMon Project Instructions

## Project Overview
XTMon is a Blazor Web App (Interactive Server) for monitoring SQL Server database metrics and replaying failed flows.

**Technology Stack:**
- **Framework**: .NET 10.0
- **UI**: Blazor Server with Interactive Server mode
- **Database**: SQL Server via Microsoft.Data.SqlClient
- **Styling**: Tailwind CSS (custom build process)
- **Architecture**: Repository pattern with options-based configuration

## Project Structure
- **Components/**: Blazor components with code-behind pattern
  - **Pages/**: Routable page components (Monitoring, ReplayFlows, Home, Error, NotFound)
  - **Layout/**: Layout components (MainLayout, NavMenu, ReconnectModal)
- **Data/**: Data access layer (repositories, connection factory)
- **Models/**: Domain models and DTOs
- **Options/**: Configuration option classes mapped from appsettings
- **Styles/**: Tailwind CSS source files
- **wwwroot/**: Static web assets and compiled CSS

## Development Guidelines

### Code Organization
- Use **code-behind pattern** for all Razor components (`.razor.cs` files)
- Keep component logic separate from markup
- Use `sealed` classes for components and services where inheritance isn't needed
- Enable nullable reference types (`<Nullable>enable</Nullable>`)

### Data Access
- **Always use async/await** for database operations
- Use `DbMonitoringRepository` for all SQL Server interactions
- Never create SQL connections directly; use `SqlConnectionFactory`
- All stored procedures configured in `appsettings.json` Options sections
- Set appropriate `CommandTimeout` from configuration options
- Handle `DbNull` values explicitly when reading data
- Always pass `CancellationToken` to async database methods

### Configuration
- Database connection strings in `ConnectionStrings` section
- Feature-specific settings in dedicated Options classes:
  - `MonitoringOptions` for monitoring features
  - `ReplayFlowsOptions` for replay flows features
- Register options using `builder.Services.Configure<T>()` pattern
- Inject options via `IOptions<T>` interface

### Dependency Injection
- `SqlConnectionFactory`: Singleton (thread-safe, lightweight)
- `DbMonitoringRepository`: Scoped (per-request lifetime)
- Options: Registered via `Configure<T>()` method

### Component Development
- Components implement `ComponentBase`
- Use `[Inject]` attribute for dependency injection
- Initialize data in `OnInitializedAsync()` override
- Use `StateHasChanged()` when updating UI from async operations
- Handle loading states and errors gracefully

### Styling
- Use Tailwind CSS utility classes
- Custom styles in component-specific `.razor.css` files (CSS isolation)
- Build CSS bundle: `npm run build:css`
- Development watch mode: `npm run watch:css`
- Never write inline styles; prefer Tailwind utilities

### Error Handling
- Catch exceptions in component methods
- Display user-friendly error messages
- Use exception handler middleware for unhandled exceptions
- Custom 404 page at `/not-found` route

### Security
- **Never hardcode credentials** - always use appsettings
- Use parameterized stored procedures (no dynamic SQL)
- Connection strings in `appsettings.Development.json` for local dev
- Enable HSTS in production
- Use antiforgery protection

## Common Patterns

### Reading from Database
```csharp
using var connection = _connectionFactory.CreateConnection();
using var command = connection.CreateCommand();
command.CommandText = _options.StoredProcedureName;
command.CommandType = CommandType.StoredProcedure;
command.CommandTimeout = _options.CommandTimeoutSeconds;

await connection.OpenAsync(cancellationToken);
using var reader = await command.ExecuteReaderAsync(cancellationToken);
```

### Adding Configuration Options
1. Create class in `Options/` folder with `SectionName` constant
2. Add properties matching appsettings structure
3. Register in Program.cs: `builder.Services.Configure<YourOptions>(builder.Configuration.GetSection(YourOptions.SectionName))`
4. Inject via `IOptions<YourOptions>`

### Component with Data Loading
```csharp
private bool isLoading;
private string? loadError;

protected override async Task OnInitializedAsync()
{
    await LoadDataAsync();
}

private async Task LoadDataAsync()
{
    isLoading = true;
    loadError = null;
    try
    {
        // Load data
    }
    catch (Exception ex)
    {
        loadError = ex.Message;
    }
    finally
    {
        isLoading = false;
        StateHasChanged();
    }
}
```

## Build and Run

**Initial Setup:**
```bash
npm install
npm run build:css
dotnet run
```

**Development Workflow:**
```bash
# Terminal 1: Run application
dotnet run

# Terminal 2: Watch CSS changes
npm run watch:css
```

## Configuration Files
- `appsettings.json`: Production/default settings
- `appsettings.Development.json`: Local development overrides (gitignored)
- Update SQL connection string in Development file with your credentials

## Code Style
- Use `var` for local variables when type is obvious
- PascalCase for public members, camelCase for private fields with `_` prefix
- Prefer `readonly` fields where possible
- Use collection expressions `[]` where applicable (.NET 10)
- Keep methods focused and single-purpose
