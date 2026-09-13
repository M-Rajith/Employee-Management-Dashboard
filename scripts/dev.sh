#!/usr/bin/env bash
# PeopleOS one-command dev start (Linux/macOS)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting backend (dev profile, H2 + seed)..."
(cd "$ROOT/backend" && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev) &
BACK_PID=$!
trap 'kill $BACK_PID 2>/dev/null' EXIT

echo "Waiting for the API..."
for i in $(seq 1 60); do
  curl -sf "http://localhost:8080/api/v1/health" >/dev/null && break
  sleep 2
done

echo "Starting frontend..."
cd "$ROOT/frontend"
[ -d node_modules ] || npm install
npm run dev
