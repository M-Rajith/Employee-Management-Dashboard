#!/usr/bin/env bash
# PeopleOS smoke test (Linux/macOS) — run from the peopleos/ folder with the API up.
# Requires: curl, python3
B="http://localhost:8080/api/v1"
fail=0

check() { # $1=name $2=url
  if curl -sf "$2" | grep -q '"success":true'; then
    echo "PASS  $1"
  else
    echo "FAIL  $1"; fail=1
  fi
}

echo "== Waiting for API on $B =="
up=0
for i in $(seq 1 45); do
  if curl -sf "$B/health" >/dev/null 2>&1; then up=1; break; fi
  sleep 2
done
if [ "$up" != "1" ]; then echo "API did not start. Run the backend first."; exit 1; fi

echo "== Endpoint smoke tests =="
check "health"          "$B/health"
check "dashboard"       "$B/dashboard"
check "employees paged" "$B/employees?page=0&size=20"
check "search+filter"   "$B/employees?search=arjun&department=ENGINEERING&status=ACTIVE"

EMP_ID=$(curl -sf "$B/employees?page=0&size=1" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['content'][0]['id'])" 2>/dev/null || true)
if [ -n "$EMP_ID" ]; then
  check "snapshot"           "$B/employees/$EMP_ID/snapshot"
  check "attendance history" "$B/employees/$EMP_ID/attendance?range=week"
  check "payroll (employee)" "$B/employees/$EMP_ID/payroll" || true   # may 404 if no payroll yet — non-fatal
else
  echo "SKIP  snapshot / attendance history (database has no employees yet)"
fi

check "payroll list"    "$B/payroll"
check "events"          "$B/events"
check "projects list"   "$B/projects"
check "positions list"  "$B/positions"
check "pending leaves"  "$B/leaves/pending"
check "attendance week" "$B/attendance?range=week"
check "attendance month" "$B/attendance?range=month"
check "activities"      "$B/activities"
check "insights"        "$B/insights"

echo "== Payroll upsert (net must equal 75000) =="
if [ -n "$EMP_ID" ]; then
  net=$(curl -sf -X PUT "$B/employees/$EMP_ID/payroll" -H 'Content-Type: application/json' \
      -d '{"basic":50000,"hra":20000,"allowances":10000,"deductions":5000}' \
      | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['netSalary'])")
  if [ "$net" = "75000" ]; then echo "PASS  payroll upsert (net = 75000)"; else echo "FAIL  payroll upsert (net = $net)"; fail=1; fi
else
  echo "SKIP  payroll upsert (no employees)"
fi

echo "== Project: create (auto-team) + member add/remove + delete =="
proj=$(curl -sf -X POST "$B/projects" -H 'Content-Type: application/json' -d '{"name":"Smoke Project","weightage":"MEDIUM"}')
proj_id=$(echo "$proj" | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")
team=$(echo "$proj" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['data']['members']))")
if [ "$team" -ge 3 ] 2>/dev/null; then echo "PASS  project create + auto-team ($team members)"; else echo "FAIL  project create"; fail=1; fi
free_emp=$(curl -sf "$B/employees?page=0&size=100" | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']['content']
print(d[0]['id'])")
if curl -sf -X POST "$B/projects/$proj_id/members" -H 'Content-Type: application/json' \
    -d "{"employeeId":$free_emp}" >/dev/null; then
  echo "PASS  project member add"
else
  echo "FAIL  project member add"; fail=1
fi
if curl -sf -X DELETE "$B/projects/$proj_id/members/$free_emp" >/dev/null; then
  echo "PASS  project member remove"
else
  echo "FAIL  project member remove"; fail=1
fi
if curl -sf -o /dev/null -X DELETE "$B/projects/$proj_id"; then
  echo "PASS  project delete"
else
  echo "FAIL  project delete"; fail=1
fi

echo "== Create + duplicate-check =="
code="EMP-$RANDOM$RANDOM"
if curl -sf -X POST "$B/employees" -H 'Content-Type: application/json' -d "{
    \"employeeCode\":\"$code\",\"firstName\":\"Test\",\"lastName\":\"User\",
    \"email\":\"test.$code@peopleos.io\",\"phone\":\"+91 90000 00000\",
    \"department\":\"PRODUCT\",\"role\":\"Analyst\",\"team\":\"BizOps\",
    \"status\":\"ACTIVE\",\"location\":\"Chennai\",\"joinedDate\":\"2025-01-15\"}" \
    | grep -q '"success":true'; then
  echo "PASS  create employee"
else
  echo "FAIL  create employee"; fail=1
fi
dup_code="EMP-$RANDOM$RANDOM"
http=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/employees" -H 'Content-Type: application/json' -d "{
    \"employeeCode\":\"$dup_code\",\"firstName\":\"Dup\",\"lastName\":\"Email\",
    \"email\":\"test.$code@peopleos.io\",\"department\":\"HR\",\"role\":\"Tester\",
    \"team\":\"People Ops\",\"status\":\"ACTIVE\",\"location\":\"Pune\",\"joinedDate\":\"2025-02-01\"}")
if [ "$http" = "409" ]; then echo "PASS  duplicate email -> 409"; else echo "FAIL  duplicate email ($http)"; fail=1; fi

echo "== Leave approve flow =="
lid=$(curl -sf "$B/leaves/pending" | python3 -c "import sys,json;d=json.load(sys.stdin)['data'];print(d[0]['id'] if d else '')" 2>/dev/null || true)
if [ -n "$lid" ]; then
  if curl -sf -X PUT "$B/leaves/$lid/approve" | grep -q '"success":true'; then
    echo "PASS  approve leave"
  else
    echo "FAIL  approve leave"; fail=1
  fi
else
  echo "SKIP  approve leave (queue empty)"
fi

echo
if [ "$fail" = "0" ]; then echo "ALL CHECKS PASSED"; exit 0; else echo "SOME CHECKS FAILED"; exit 1; fi
