# Frontend Walkthrough

Purpose
- Describe how to build, run, and troubleshoot the Vite + React frontend used in this repository.

Quick dev (local)
1. Install deps:
   ```bash
   cd 02-coding-interview/frontend
   npm ci
   npm run dev
   ```
2. Open the app at the Vite dev URL (usually `http://localhost:5173`).

Build for production
1. From the frontend folder:
   ```bash
   npm run build
   ```
2. The production build will be available in `dist/`.

Serve in Docker (nginx)
- The project includes a `frontend/Dockerfile` that builds and serves `dist/` with nginx. From the repo root you can run:
  ```bash
  docker compose up --build frontend
  # or start full stack: docker compose up --build
  ```
 - Host port 3000 is mapped to nginx in the provided `docker-compose.yml`.

Environment / API
- The frontend reads `VITE_API_URL` when building or from `.env`. In our compose setup the backend is at `http://localhost:3001` so the frontend calls that when running locally or via compose.

Debugging
- If assets 404, confirm `dist/` exists and `nginx.conf` has the SPA fallback (`try_files $uri $uri/ /index.html`).
- Check browser console for CORS errors; backend provides CORS for `*` by default.

Files of interest
- `src/components/CodeEditor.tsx`, `src/pages/EditorDemo.tsx`, `vite.config.ts`, `nginx.conf`, `Dockerfile` (frontend).
