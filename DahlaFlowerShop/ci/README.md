# CI Smoke Tests

This folder contains Newman-based API smoke tests that run through the Ocelot gateway.

## Prerequisites

- SQL Server database created from `database/API_Dahla.sql`
- `API_Dahla` running on `http://localhost:5003`
- `Dahla_NguoiDung` running on `http://localhost:5193`
- `Dahla_GateWays` running on `https://localhost:7114`
- Node.js LTS installed

Jenkins running on port `8081` is fine. That port is only the Jenkins UI and does not change the API base URL used by the smoke tests.

## Install dependencies

Fastest setup on a new machine:

```powershell
.\setup-local-env.bat
```

That script will:

- check `.NET SDK`
- check or install `Node.js LTS`
- install Newman dependencies from `ci/package.json`
- trust the local ASP.NET HTTPS dev certificate
- prepare `MSSQLLocalDB`
- create the local smoke-test database schema and seed data

Manual setup is still available below.

From the repo root:

```powershell
Set-Location .\ci
npm install
```

## Run locally

To start the app for manual browser checking:

```powershell
.\run-local-web.bat
```

This starts LocalDB setup, Admin API, User API, Gateway, and a frontend static server, then opens:

```text
http://127.0.0.1:5500/index.html
```

Stop the local web stack when done:

```powershell
.\stop-local-web.bat
```

Run the full local smoke flow from the repo root:

```powershell
.\run-local-smoke.bat
```

That wrapper will:

- prepare the LocalDB smoke schema
- install Newman dependencies when missing
- start the Admin API, User API, and Gateway in the background
- wait until all APIs are ready
- run the Newman smoke collection
- write Newman reports and service logs under `ci/reports/`
- stop the API processes it started

To keep the APIs running after the smoke test finishes:

```powershell
.\run-local-smoke.bat -KeepServices
```

To open the HTML report automatically after a local run:

```powershell
.\run-local-smoke.bat -OpenReport
```

The gateway launched by `dotnet run --launch-profile https` listens on `https://localhost:7114`, so the full smoke runner uses that URL by default.

## Run Newman only

From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\ci\run-newman.ps1 -BaseUrl https://localhost:7114
```

If your seeded admin account is different from the default SQL script, override it:

```powershell
powershell -ExecutionPolicy Bypass -File .\ci\run-newman.ps1 `
  -BaseUrl https://localhost:7114 `
  -AdminUsername admin `
  -AdminPassword 123
```

## Reports

The script writes these artifacts to `ci/reports/newman/`:

- `newman-report.html`
- `newman-junit.xml`
- `newman-summary.json`

Jenkins also packages a dashboard under `ci/artifacts/`:

- `jenkins-api-dashboard.html`: overall API status, route coverage, request execution, failures
- `test-types-report.html`: grouped test report for Login, Customer Function, Catalog Function, Admin Function, and Gateway Health
- `test-types-report.json`: machine-readable version of the grouped test report

## Jenkins

The root `Jenkinsfile` runs the same local smoke wrapper and archives the reports:

```powershell
.\run-local-smoke.bat
```

Archive these artifacts in Jenkins:

- `ci/artifacts/**/*`

Publish `ci/reports/newman/newman-junit.xml` as JUnit test results.
