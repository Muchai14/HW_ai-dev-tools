# Quick Troubleshooting

Common issues and fixes when running this repo locally or with Docker Compose.

1) Ports already in use
- Symptoms: `docker compose up` fails to bind `3000` or `3001`, or browser shows the wrong service.
- Fix: Either stop the service using the port (e.g. another local dev server) or change host port mappings in `docker-compose.yml`.

2) Backend tests fail with "no module named 'app'"
- Cause: Running pytest without `PYTHONPATH` set in the `backend` directory.
- Fix: Run tests from `backend` with `PYTHONPATH=$(pwd) pytest` or set the environment appropriately in your test runner.

3) SQLAlchemy "no such table" during tests or runtime
- Cause: DB tables are not created yet.
- Fix:
  - Ensure `db.init_db()` is called on startup (it is by default in `app.main`).
  - When running tests locally: `PYTHONPATH=$(pwd) python -c "from app import db; db.init_db()"`.
  - With compose: ensure `db` service is healthy. You can recreate DB volume to start fresh: `docker compose down -v` then `docker compose up --build`.

4) Frontend 404s for SPA routes
- Cause: nginx not configured to fall back to `index.html`.
- Fix: Confirm `frontend/nginx.conf` contains `try_files $uri $uri/ /index.html;` and that `dist/` contains `index.html`.

5) CORS issues calling backend from frontend
- Fix: Backend uses `CORSMiddleware` allowing `*`. If you override origins, update `app.main` middleware accordingly.

6) Docker build is slow / frontend built twice
- Fix: Simplify root `Dockerfile` to build backend only and rely on `frontend` service to build/serve the SPA (I can make this change).

Helpful commands
```bash
# rebuild everything
docker compose up --build

# show logs
docker compose logs -f backend

# run backend tests locally
cd 02-coding-interview/backend
PYTHONPATH=$(pwd) pytest -q
```
