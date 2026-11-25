# Employee Management System

A full-stack Employee Management System built with **React + Vite + Tailwind CSS + React Router** on the frontend and **ASP.NET Core Web API (.NET 10) + Entity Framework Core + PostgreSQL** on the backend.

## Folder Structure

```text
EmployeeManagementSystem/
├── backend/                     # ASP.NET Core Web API (.NET 10)
│   ├── Controllers/             # REST API endpoints (thin HTTP layer)
│   ├── Data/                    # Entity Framework Core DbContext
│   ├── DTOs/                    # Request/Response data transfer objects & validation
│   ├── Exceptions/              # Domain exceptions & global ProblemDetails handler
│   ├── Migrations/              # EF Core database migrations for PostgreSQL
│   ├── Models/                  # Domain entities (Department, Employee)
│   ├── Services/                # Business logic & EF Core queries (DI-registered)
│   ├── appsettings.json         # Non-secret defaults & CORS origins
│   ├── appsettings.Development.json.example
│   └── Program.cs               # App composition, DI, CORS, DB & middleware setup
├── backend.Tests/               # xUnit integration tests
└── frontend/                    # React + Vite + Tailwind CSS + React Router
    ├── src/
    │   ├── api/                 # Fetch client & endpoint wrappers
    │   ├── components/          # Shared Layout, ConfirmDialog, EmployeeForm
    │   └── pages/               # Dashboard, Employees, Add/Edit Employee, Departments
    ├── .env.example
    └── vite.config.js
```

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/) and `npm`
- [PostgreSQL 15+](https://www.postgresql.org/download/) running locally (or accessible via connection string)
- EF Core CLI tool (if applying migrations from CLI):
  ```bash
  dotnet tool install --global dotnet-ef --version 10.0.*
  ```

## Database Configuration (No Hardcoded Credentials)

The connection string `ConnectionStrings:DefaultConnection` is intentionally left blank in `backend/appsettings.json`. Provide your PostgreSQL credentials using **one** of these methods:

### Option A: .NET User Secrets (Recommended for local development)

```bash
cd backend
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=employee_management;Username=<YOUR_USER>;Password=<YOUR_PASSWORD>"
```

### Option B: Environment Variable

PowerShell:
```powershell
$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5432;Database=employee_management;Username=<YOUR_USER>;Password=<YOUR_PASSWORD>"
```

Bash / macOS / Linux:
```bash
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=employee_management;Username=<YOUR_USER>;Password=<YOUR_PASSWORD>"
```

### Option C: Local `appsettings.Development.json` (git-ignored)

Copy `backend/appsettings.Development.json.example` to `backend/appsettings.Development.json` and fill in your PostgreSQL username and password.

## Setup & Run Commands

### 1. Apply EF Core Migrations & Start the Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

By default, the backend listens on `http://localhost:5003` (see `backend/Properties/launchSettings.json`). When `Database:SeedSampleData` is `true` (default in `appsettings.json`), starting the API against an empty database automatically seeds 5 sample departments and 8 sample employees.

### 2. Configure & Start the Frontend

In a second terminal:

```bash
cd frontend
npm install
```

Optionally copy `.env.example` to `.env` if your API runs on a non-default URL:
```bash
cp .env.example .env
```

Start the Vite development server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Build & Run Tests

Backend build and automated API integration tests:
```bash
dotnet test backend.Tests/EmployeeManagement.Tests.csproj
```

Frontend production build:
```bash
cd frontend
npm run build
```

## REST API Endpoints

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| Dashboard | `GET` | `/api/dashboard` | Employee count, department count, payroll, average salary, per-department counts |
| Departments | `GET` | `/api/departments` | List all departments with employee counts |
| Departments | `GET` | `/api/departments/{id}` | Get a department by ID |
| Departments | `POST` | `/api/departments` | Create a new department (`201 Created`) |
| Departments | `PUT` | `/api/departments/{id}` | Rename a department (`200 OK`) |
| Departments | `DELETE` | `/api/departments/{id}` | Delete an empty department (`204 No Content`, or `409 Conflict` if employees exist) |
| Employees | `GET` | `/api/employees?search=&departmentId=` | List employees with optional name search and department filter |
| Employees | `GET` | `/api/employees/{id}` | Get an employee by ID |
| Employees | `POST` | `/api/employees` | Create a new employee (`201 Created`) |
| Employees | `PUT` | `/api/employees/{id}` | Update an employee (`200 OK`) |
| Employees | `DELETE` | `/api/employees/{id}` | Delete an employee (`204 No Content`) |
