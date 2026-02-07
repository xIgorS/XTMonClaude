# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Install dependencies and build CSS (required once)
npm install
npm run build:css

# Run the application
dotnet run

# Live CSS updates during development (run in separate terminal)
npm run watch:css
```

## Architecture Overview

XTMon is a .NET 10.0 Blazor Server application (Interactive Server render mode) for monitoring SQL Server databases and replaying failed data processing flows.

### Layer Structure

```
Program.cs              → DI setup, middleware pipeline
├── Data/               → Database access layer
│   ├── SqlConnectionFactory.cs    → Creates SQL connections from config
│   └── DbMonitoringRepository.cs  → All database operations (stored procedures)
├── Models/             → Immutable record types for data transfer
├── Options/            → Configuration POCOs bound from appsettings
└── Components/         → Blazor UI components
    ├── Pages/          → Routable page components (.razor + .razor.cs)
    └── Layout/         → Shell layout and navigation
```

### Key Patterns

- **Code-behind pattern**: Each `.razor` file has a corresponding `.razor.cs` partial class
- **Component-scoped CSS**: Each component can have its own `.razor.css` file
- **Options pattern**: Configuration sections bound to typed classes via `IOptions<T>`
- **Repository pattern**: `DbMonitoringRepository` handles all ADO.NET database calls using stored procedures

### Database Access

All database operations use raw ADO.NET with `SqlConnection` and stored procedures:
- Stored procedure names are configurable via `appsettings.json`
- Table-valued parameters use `DataTable` with `SqlDbType.Structured`
- Connection string key: `ConnectionStrings:LogFiAlmt`

### Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Overview landing page |
| `/monitoring` | Monitoring | Database size and disk space monitoring |
| `/replay-flows` | ReplayFlows | View failed flows and submit for replay |

### Styling

- Tailwind CSS with custom components defined in `Styles/tailwind.css`
- Component-specific styles in `.razor.css` files (e.g., `db-grid` table styles)
- Output compiled to `wwwroot/app.css`
