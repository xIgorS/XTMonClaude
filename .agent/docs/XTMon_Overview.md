# XTMon Project Overview

**XTMon** (XTMonClaude) is a Blazor Web App (Interactive Server) designed to monitor SQL Server data processing and allow users to replay failed flows.

## Core Functionality

1.  **Database Monitoring**:
    -   Displays database size and disk space usage metrics.
    -   Accessible via the `/monitoring` route.
    -   Uses stored procedures to fetch this data efficiently.

2.  **Flow Replay**:
    -   Allows users to view failed data processing flows.
    -   Provides functionality to submit these failed flows for replay.
    -   Accessible via the `/replay-flows` route.

## Technical Architecture

### 1. Backend (ASP.NET Core / Blazor Server)
-   **Framework**: .NET 10.0 (or latest supported version).
-   **Structure**: Uses a layered architecture:
    -   `Program.cs`: Setup DI and middleware.
    -   `Data/`: Contains `SqlConnectionFactory` and `DbMonitoringRepository`. Uses raw ADO.NET with `SqlConnection` and Stored Procedures for performance and control.
    -   `Models/`: Immutable record types (DTOs) for data transfer.
    -   `Options/`: Configuration POCOs bound via the Options pattern (`IOptions<T>`) from `appsettings.json`.

### 2. Frontend (Blazor Components)
-   **Components**: Located in `Components/`.
-   **Routing**: Page components in `Components/Pages/` handle routing (e.g., `/`, `/monitoring`, `/replay-flows`).
-   **Code-Behind**: Logic is separated into `.razor.cs` partial classes for maintainability.

### 3. Styling (Tailwind CSS)
-   **Framework**: Tailwind CSS.
-   **Implementation**:
    -   Base styles in `Styles/tailwind.css`.
    -   Component-specific styles in `.razor.css` files.
    -   Built via `npm run build:css` to `wwwroot/app.css`.

## Development Workflow

1.  **Configuration**:
    -   Update connection strings in `appsettings.Development.json`.
    -   Ensure SQL stored procedures are deployed.

2.  **Build & Run**:
    -   `npm install` (first time).
    -   `npm run build:css` (to build styles).
    -   `dotnet run` (to start the server).
    -   `npm run watch:css` (optional, for live style updates).

## Key Files
-   `CLAUDE.md`: Assistant guide for working with the repo.
-   `Program.cs`: Entry point and dependency injection configuration.
-   `MonitorOptions.cs`: Options class for configuration.

This project is structured for maintainability and performance, leveraging Blazor's server-side capabilities for real-time monitoring and interaction with SQL Server.
