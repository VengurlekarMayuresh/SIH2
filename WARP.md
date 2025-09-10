# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Monorepo with two main projects:
  - Frontend: ready-to-learn-safe-main (Vite + React + TypeScript + Tailwind + shadcn-ui)
  - Backend: backend (Express + MongoDB/Mongoose + JWT auth)
- Primary domain: disaster preparedness learning platform with modules, quizzes, badges, analytics.

Prerequisites
- Node.js and npm installed
- A running MongoDB instance and connection string
- Windows PowerShell (pwsh) examples are used below; adapt env syntax for your shell if needed

Environment setup (required)
- Backend expects:
  - MONGODB_URI: Mongo connection string
  - PORT: recommended 5001 to match frontend proxy
  - FRONTEND_URL: optional CORS override (defaults to http://localhost:8080)
- Example (pwsh):
  ```powershell path=null start=null
  $env:MONGODB_URI = "mongodb://localhost:27017/safeed"
  $env:PORT = "5001"
  $env:FRONTEND_URL = "http://localhost:8080"
  ```

Common commands
- Install dependencies (first time or after changes)
  ```powershell path=null start=null
  npm install --prefix backend
  npm install --prefix ready-to-learn-safe-main
  ```

- Start backend (development with auto-reload)
  ```powershell path=null start=null
  # Ensure env vars are set (see Environment setup)
  npm run dev --prefix backend
  # API will log at http://localhost:5001/api if PORT=5001
  ```

- Start frontend (Vite dev server)
  ```powershell path=null start=null
  npm run dev --prefix ready-to-learn-safe-main
  # Served at http://localhost:8080 with /api proxy to http://localhost:5001
  ```

- Build frontend for production
  ```powershell path=null start=null
  npm run build --prefix ready-to-learn-safe-main
  ```

- Lint frontend
  ```powershell path=null start=null
  npm run lint --prefix ready-to-learn-safe-main
  ```

- Seed/mock data (optional utilities)
  ```powershell path=null start=null
  # Run from repo root; assumes env vars are set
  node backend/create-test-data.js
  node backend/create-quiz-data.js
  node mock-data-setup.js
  ```

- Quick backend health checks and utilities
  ```powershell path=null start=null
  node backend/check-db.js           # Verify DB connectivity
  node backend/check-quiz-status.js  # Inspect quiz/badge status
  ```

Testing and verification
- Backend API smoke test (Node script)
  ```powershell path=null start=null
  # Prereq: backend running; uses http://localhost:5001 by default inside the script
  node backend/test-api.js
  ```

- Frontend E2E-style flows (PowerShell helpers)
  ```powershell path=null start=null
  # Run from repo root (PowerShell)
  .\ready-to-learn-safe-main\test-login.ps1
  .\ready-to-learn-safe-main\test-module-flow.ps1
  .\ready-to-learn-safe-main\test-student-signup.ps1
  .\ready-to-learn-safe-main\test-institution-signup.ps1
  ```

- Backend quiz flow tests (PowerShell helpers)
  ```powershell path=null start=null
  .\backend\test-quiz-api.ps1
  .\backend\test-quiz-complete.ps1
  .\backend\test-complete-system.ps1
  .\backend\test-quiz-endpoints.js | Out-Host  # run via node if desired
  ```

- Student progress dashboard test
  ```powershell path=null start=null
  .\backend\test-progress-api.ps1   # PowerShell version
  node backend/test-progress-api.js  # Node.js version
  ```

- Run a single test script directly (node example)
  ```powershell path=null start=null
  node backend/test-quiz-endpoints.js
  ```

Ports and proxies
- Frontend dev server runs on http://localhost:8080 (see ready-to-learn-safe-main/vite.config.ts)
- API requests to /api are proxied to http://localhost:5001
  - Ensure backend PORT is set to 5001 or update the proxy target in vite.config.ts if you prefer a different port

High-level architecture
- Frontend (ready-to-learn-safe-main)
  - Vite + React + TypeScript app with React Router. Core routes are defined in src/App.tsx, including:
    - /, /auth, /dashboard, /institution, /modules, /modules/:id
    - /quiz, /quiz/:quizId/overview, /quiz/:quizId, /quiz/:quizId/attempt/:attemptId
  - State/data: @tanstack/react-query for server state, axios for HTTP, shadcn-ui components (src/components/ui/*), Tailwind for styling.
  - API integration via relative /api paths; Vite proxy handles local dev.
  - Notable pages/components: InteractiveQuiz (quiz runtime), QuizOverview, BadgeCollection (earned badges), Leaderboard, DisasterModules/DisasterDetail (module learning flow), InstitutionDashboard (analytics and management views).

- Backend (backend)
  - Express server (backend/server.js) with CORS configured to allow common local dev origins and FRONTEND_URL override. JSON body parsing enabled.
  - Database via Mongoose (backend/config/database.js) using MONGODB_URI.
  - Route mounting under /api from three routers:
    - routes/institution.js
    - routes/student.js
    - routes/modules.js
  - Data models (backend/models/*) cover institutions, students, modules, quizzes, quiz attempts, badges, student badges, student progress, and rankings.
  - Quiz & Badge System:
    - See backend/QUIZ_SYSTEM_IMPLEMENTATION.md for the complete endpoint matrix and badge catalog.
    - Key endpoints include:
      - Institution quiz management (CRUD, status, analytics)
      - Student quiz lifecycle (get quiz, start attempt, submit, history)
      - Quiz discovery (browse/featured)
      - Badge listing/initialization and student badge retrieval
      - Student progress dashboard (GET /api/student/progress-dashboard) - comprehensive progress data
      - Student dashboard data (GET /api/student/dashboard-data) - recent activity, streaks, today's progress

Cross-project interactions
- Frontend fetches via /api which proxies to backend; keep ports aligned.
- CORS: If you change frontend dev URL, set FRONTEND_URL accordingly or rely on permissive localhost matching in server.js.

Important references
- Frontend README: ready-to-learn-safe-main/README.md (Lovable workflow and basic dev commands)
- Quiz/Badge spec and endpoints: backend/QUIZ_SYSTEM_IMPLEMENTATION.md

Notes for future changes
- If you alter backend PORT, update either the Vite proxy target (ready-to-learn-safe-main/vite.config.ts) or set $env:PORT to match 5001.
- When adding new API routes, expose them under one of the existing routers and keep model-layer updates in backend/models consistent.
- Prefer axios from the frontend with relative /api paths to preserve proxy behavior in dev and same-origin in production behind a reverse proxy.

