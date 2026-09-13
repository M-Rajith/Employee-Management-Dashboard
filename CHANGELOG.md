# Changelog

All notable changes to PeopleOS. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-09-13

### Added
- Employee management: card-first directory (spring-expand cards with animated metric bars),
  tokenized multi-field search with autocomplete, combinable filters (department, team,
  location, quick status chips), 6 sort orders, server-side pagination
- Work Snapshot drawer: identity, 30-day attendance ring, per-day attendance history
  (week/month), leave used/remaining, net salary, recent activity — derived live, no snapshot table
- Leave management: pending queue with approve/reject (status + activity feed side-effects)
- Attendance overview: week/month trends (present / remote / late / absent)
- Dashboard KPIs derived from source tables; department distribution; People Insights
  (rule-based analytics from live data); Upcoming Events card
- Open Positions module: full CRUD, KPI derived from the positions table
- Payroll: per-employee monthly breakdown with live net preview and upsert API
- Projects: team auto-assembly from experience + weightage (LOW/MEDIUM/HIGH → 3/5/7),
  manual add/remove, project roles by tenure
- Light/dark themes (CSS custom properties, persisted), 100 deterministic local avatars
- `GET /api/v1/health` (status + uptime)
- Smoke-test suites: `scripts/verify.ps1` (Windows) and `scripts/verify.sh` (Linux/macOS),
  ~23 checks including mutation round-trips, idempotent and safe to re-run
- One-command startup scripts: `scripts/dev.ps1` / `scripts/dev.sh`
- Docker: `docker-compose.yml` (MySQL 8 + backend + frontend), per-app Dockerfiles

### Engineering
- Modular monolith: each domain owns controller/service/repository/entity/dto
- Explicit `@Transactional` boundaries with `open-in-view: false`
- Consistent API envelope `{success, message, data}`; standardized 400/404/409/500 errors
- 12-factor config: H2 dev profile vs MySQL via environment variables; no secrets in the repo
- Deterministic dev seed (`Random(42)`, 100 employees, anchor records for stable demo references)
