# Gym Management System

Full-stack gym management app built with **ASP.NET Core** (backend) and **React + Vite** (frontend).

## Folder structure

```
GymManagementSystem/
├── GymManagementSystem.sln          # Solution file
├── GymManagementSystem.Client/      # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/                     # API client & types
│   │   ├── components/              # Shared UI components
│   │   ├── layout/                  # App shell / navbar
│   │   ├── pages/                   # Public pages
│   │   └── pages/admin/             # Admin dashboard modules
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts               # Proxies /api → backend
└── GymManagementSystem.Server/      # ASP.NET Core Web API
    ├── Controllers/                 # REST API endpoints
    ├── Data/                        # EF Core DbContext
    ├── Models/                      # Entity & DTO models
    ├── Services/                    # Database seeding
    ├── Program.cs                   # App startup, CORS, SQLite
    ├── appsettings.json
    └── GymManagementSystem.Server.http  # API test requests
```

## Run locally (development)

**Terminal 1 — Backend API**

```bash
cd GymManagementSystem.Server
dotnet run
```

API runs at `http://localhost:5199`.

**Terminal 2 — Frontend**

```bash
cd GymManagementSystem.Client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to the backend.

## Demo login

| Role   | Username | Password    |
|--------|----------|-------------|
| Admin  | `admin`  | `admin123`  |
| Member | `member` | `member123` |

Members registered via `/register` can also log in with their phone number.

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Member/Admin login |
| POST | `/api/registrations` | Member registration |
| GET/POST/PUT/DELETE | `/api/members` | Member CRUD |
| GET/POST/PUT/DELETE | `/api/trainers` | Trainer CRUD |
| GET/POST/PUT/DELETE | `/api/payments` | Payment CRUD |
| GET/POST/PUT/DELETE | `/api/attendance` | Attendance CRUD |
| GET/PUT | `/api/settings` | Gym settings |
| GET | `/api/plans` | Public membership plans |
| GET | `/api/schedule` | Weekly schedule |
| POST | `/api/contact` | Contact form |
| GET | `/api/dashboard/stats` | Admin dashboard KPIs |

Use `GymManagementSystem.Server.http` in Visual Studio / VS Code to test endpoints.

## Production build

```bash
cd GymManagementSystem.Client
npm run build

cd ../GymManagementSystem.Server
dotnet publish -c Release
```

Copy the Client `dist/` output into the Server `wwwroot/` folder for single-host deployment.
