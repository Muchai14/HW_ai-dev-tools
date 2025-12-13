# Database Walkthrough

Purpose
- Describe how the project uses databases (SQLite for local dev fallback, Postgres for production/compose) and how to initialize and interact with them.

Databases used
- Local dev fallback: SQLite file `backend_dev.db` in the backend folder (used when `DATABASE_URL` is not set).
- Production/compose: Postgres (service `db` in `docker-compose.yml`).

Connection strings
- Postgres example (used in `docker-compose.yml`):
  ```text
  postgresql+psycopg2://postgres:postgres@db:5432/coding_interview
  ```
- SQLite example:
  ```text
  sqlite:///./backend_dev.db
  ```

Initializing the schema
- The backend calls `db.init_db()` on FastAPI startup which runs `models.metadata.create_all(bind=engine)` to create tables.
- You can also initialize manually:
  ```bash
  cd 02-coding-interview/backend
  PYTHONPATH=$(pwd) python -c "from app import db; db.init_db(); print('DB initialized')"
  ```

Seeding data
- For quick manual seeding you can run a small script that uses `app.db.create_room()` or add a `backend/init_db.py` script. (I can add this script if you want.)

Backups and persistence
- The compose file defines a named volume `db-data` mounted at `/var/lib/postgresql/data` so Postgres data persists between restarts.

Maintenance notes
- If you change models, you can either recreate the DB (drop volume) or integrate Alembic for migrations. For a small demo app, recreating the volume is simplest:
  ```bash
  docker compose down -v
  docker compose up --build
  ```
