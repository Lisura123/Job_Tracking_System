# Job Tracking System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Job Tracking System                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────────┐
│     React Frontend       │         │     Laravel Backend           │
│   (http://localhost:5173)│  ←────→ │   (http://localhost:8000)    │
│                          │         │                               │
│  ┌────────────────────┐  │         │  ┌─────────────────────────┐ │
│  │   Components       │  │         │  │   API Routes            │ │
│  │  - Login           │  │         │  │  /api/login             │ │
│  │  - Register        │  │         │  │  /api/register          │ │
│  │  - SearchPage      │  │         │  │  /api/search            │ │
│  │  - AdminDashboard  │  │         │  │  /api/jobs              │ │
│  │  - JobForm         │  │         │  │  /api/customers         │ │
│  │  - CustomerForm    │  │         │  └─────────────────────────┘ │
│  └────────────────────┘  │         │                               │
│                          │         │  ┌─────────────────────────┐ │
│  ┌────────────────────┐  │         │  │   Controllers           │ │
│  │   Services         │  │         │  │  - AuthController       │ │
│  │  - authService     │  │  HTTP   │  │  - JobController        │ │
│  │  - jobService      │  │  ◄────► │  │  - CustomerController   │ │
│  │  - api (axios)     │  │  JSON   │  │  - SearchController     │ │
│  └────────────────────┘  │         │  └─────────────────────────┘ │
│                          │         │                               │
│  ┌────────────────────┐  │         │  ┌─────────────────────────┐ │
│  │   State Mgmt       │  │         │  │   Models                │ │
│  │  - AuthContext     │  │         │  │  - User                 │ │
│  │  - useState        │  │         │  │  - Customer             │ │
│  │  - useEffect       │  │         │  │  - Job                  │ │
│  └────────────────────┘  │         │  │  - Item                 │ │
│                          │         │  │  - TrackingDetail       │ │
│  ┌────────────────────┐  │         │  └─────────────────────────┘ │
│  │   Routing          │  │         │                               │
│  │  - React Router    │  │         │  ┌─────────────────────────┐ │
│  │  - Protected Routes│  │         │  │   Middleware            │ │
│  │  - Role-based      │  │         │  │  - Sanctum Auth         │ │
│  └────────────────────┘  │         │  │  - AdminMiddleware      │ │
└──────────────────────────┘         │  │  - CORS                 │ │
                                     │  └─────────────────────────┘ │
                                     │                               │
┌──────────────────────────┐         │  ┌─────────────────────────┐ │
│   Filament Admin Panel   │         │  │   Filament Resources    │ │
│   (/admin)               │  ◄────► │  │  - CustomerResource     │ │
│                          │         │  │  - JobResource          │ │
│  - Visual Admin UI       │         │  └─────────────────────────┘ │
│  - CRUD Operations       │         └──────────────────────────────┘
│  - Filters & Search      │                        │
│  - Batch Operations      │                        │
└──────────────────────────┘                        ▼
                                     ┌──────────────────────────────┐
                                     │      MySQL Database          │
                                     │  (job_tracking_system)       │
                                     │                              │
                                     │  ┌────────────────────────┐  │
                                     │  │  Tables                │  │
                                     │  │  - users               │  │
                                     │  │  - customers           │  │
                                     │  │  - jobs                │  │
                                     │  │  - items               │  │
                                     │  │  - tracking_details    │  │
                                     │  │  - sessions            │  │
                                     │  │  - cache               │  │
                                     │  └────────────────────────┘  │
                                     └──────────────────────────────┘
```

## Data Flow

### User Login Flow
```
User Input → Login Component → authService.login() → POST /api/login 
→ AuthController → User Model → Database → Response with Token
→ Store in localStorage → Update AuthContext → Redirect to Search
```

### Search Flow
```
Search Input → SearchPage Component → jobService.search() 
→ GET /api/search?query=XXX → SearchController 
→ Job Model (with relationships) → Database Query 
→ JSON Response → Display Results
```

### Create Job Flow (Admin)
```
Admin Form Input → JobForm Component → jobService.createJob() 
→ POST /api/jobs → AdminMiddleware Check → JobController 
→ Database Transaction (Job + Items + Tracking) → Success Response 
→ Toast Notification → Refresh List
```

## Database Relationships

```
┌─────────────┐
│   users     │
│  - id       │
│  - name     │
│  - email    │
│  - role     │
└─────────────┘

┌──────────────┐         ┌──────────────┐
│  customers   │   1:N   │    jobs      │
│  - id        │◄────────│  - id        │
│  - number    │         │  - job_number│
│  - name      │         │  - customer_id│
│  - contact   │         │  - dates...  │
└──────────────┘         └──────────────┘
                              │
                              │ 1:N
                              ▼
                         ┌──────────────┐
                         │    items     │
                         │  - id        │
                         │  - job_id    │
                         │  - name      │
                         │  - serial_no │
                         └──────────────┘
                              
                              │ 1:1
                              ▼
                    ┌─────────────────────┐
                    │  tracking_details   │
                    │  - id               │
                    │  - job_id           │
                    │  - agent_name       │
                    │  - tracking_number  │
                    └─────────────────────┘
```

## Authentication Flow

```
┌──────────────┐
│ Registration │
└──────┬───────┘
       │
       ▼
┌──────────────────┐      ┌─────────────┐
│ Login with Email │ ───► │ Get Token   │
│   & Password     │      │ (Sanctum)   │
└──────────────────┘      └──────┬──────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Store Token in         │
                    │ localStorage           │
                    │ Update AuthContext     │
                    └────────┬───────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌──────────────────┐
    │  Regular User   │          │   Admin User     │
    │  - Search Jobs  │          │  - All User      │
    │  - View Details │          │    Features      │
    └─────────────────┘          │  + CRUD Jobs     │
                                 │  + CRUD Customers│
                                 │  + Admin Panel   │
                                 └──────────────────┘
```

## Tech Stack Visual

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND                        │
├─────────────────────────────────────────────────┤
│  React 18      │  TypeScript  │  Vite           │
│  React Router  │  Axios       │  Tailwind CSS   │
│  Context API   │  Lucide Icons│  React Toastify │
└─────────────────────────────────────────────────┘
                        │
                        │ HTTP/REST API
                        │ JSON
                        │
┌─────────────────────────────────────────────────┐
│                  BACKEND                         │
├─────────────────────────────────────────────────┤
│  Laravel 12      │  PHP 8.2+    │  Eloquent ORM │
│  Filament 4.x    │  Sanctum     │  Migrations   │
│  RESTful API     │  Middleware  │  Seeders      │
└─────────────────────────────────────────────────┘
                        │
                        │ PDO/MySQL
                        │
┌─────────────────────────────────────────────────┐
│                  DATABASE                        │
├─────────────────────────────────────────────────┤
│  MySQL 5.7+      │  InnoDB      │  ACID          │
│  Indexed Tables  │  Foreign Keys│  Relationships │
└─────────────────────────────────────────────────┘
```

## Feature Matrix

```
┌───────────────────────┬─────────┬─────────┐
│      Feature          │  User   │  Admin  │
├───────────────────────┼─────────┼─────────┤
│ Login/Register        │    ✓    │    ✓    │
│ Search Jobs           │    ✓    │    ✓    │
│ View Job Details      │    ✓    │    ✓    │
│ Create Jobs           │    ✗    │    ✓    │
│ Edit Jobs             │    ✗    │    ✓    │
│ Delete Jobs           │    ✗    │    ✓    │
│ Manage Customers      │    ✗    │    ✓    │
│ Access Admin Panel    │    ✗    │    ✓    │
│ Filament Interface    │    ✗    │    ✓    │
│ Batch Operations      │    ✗    │    ✓    │
└───────────────────────┴─────────┴─────────┘
```

## API Endpoints Map

```
PUBLIC ENDPOINTS
├── POST /api/register
└── POST /api/login

AUTHENTICATED ENDPOINTS
├── POST /api/logout
├── GET  /api/me
├── GET  /api/search
└── GET  /api/jobs/{id}

ADMIN-ONLY ENDPOINTS
├── JOBS
│   ├── GET    /api/jobs
│   ├── POST   /api/jobs
│   ├── PUT    /api/jobs/{id}
│   └── DELETE /api/jobs/{id}
└── CUSTOMERS
    ├── GET    /api/customers
    ├── POST   /api/customers
    ├── PUT    /api/customers/{id}
    └── DELETE /api/customers/{id}
```

## File Organization

```
PROJECT ROOT
│
├── backend/              → Laravel Backend
│   ├── app/
│   │   ├── Filament/    → Admin Panel
│   │   ├── Http/        → Controllers & Middleware
│   │   └── Models/      → Database Models
│   ├── config/          → Configuration
│   ├── database/        → Migrations & Seeders
│   └── routes/          → API Routes
│
├── src/                 → React Frontend
│   ├── components/      → Reusable Components
│   ├── contexts/        → React Context
│   ├── pages/          → Page Components
│   └── services/       → API Integration
│
└── Documentation
    ├── README.md        → Main Documentation
    ├── INSTALL.md       → Installation Guide
    ├── QUICKSTART.md    → Quick Reference
    ├── COMMANDS.md      → Common Commands
    └── ARCHITECTURE.md  → This File
```

---

**This architecture provides a scalable, maintainable, and production-ready job tracking system.**
