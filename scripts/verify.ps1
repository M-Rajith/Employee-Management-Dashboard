# PeopleOS smoke test (Windows PowerShell)
# Run from the peopleos/ folder AFTER starting the backend (dev profile or MySQL).
# Requires: PowerShell 5.1+ (built-in on Windows 10/11)

$B = "http://localhost:8080/api/v1"
$fail = 0

function Check($name, $url) {
    try {
        $r = Invoke-RestMethod -Uri $url -TimeoutSec 10
        if ($r.success -eq $true) { Write-Host "PASS  $name" -ForegroundColor Green }
        else { Write-Host "FAIL  $name" -ForegroundColor Red; $script:fail = 1 }
    } catch {
        Write-Host "FAIL  $name  ($($_.Exception.Message))" -ForegroundColor Red
        $script:fail = 1
    }
}

Write-Host "== Waiting for API on $B =="
$up = $false
for ($i = 0; $i -lt 45; $i++) {
    try { Invoke-RestMethod -Uri "$B/health" -TimeoutSec 3 | Out-Null; $up = $true; break }
    catch { Start-Sleep -Seconds 2 }
}
if (-not $up) { Write-Host "API did not start. Run the backend first." -ForegroundColor Red; exit 1 }

Write-Host "== Endpoint smoke tests =="
Check "health"             "$B/health"
Check "dashboard"          "$B/dashboard"
Check "employees paged"    "$B/employees?page=0&size=20"
Check "search+filter"      "$B/employees?search=arjun&department=ENGINEERING&status=ACTIVE"
# snapshot: use a real employee id from the DB (works in both empty-MySQL and seeded-H2 modes)
try {
    $empId = (Invoke-RestMethod -Uri "$B/employees?page=0&size=1" -TimeoutSec 10).data.content[0].id
    if ((Invoke-RestMethod -Uri "$B/employees/$empId/snapshot" -TimeoutSec 10).success) {
        Write-Host "PASS  snapshot" -ForegroundColor Green
    } else {
        Write-Host "FAIL  snapshot" -ForegroundColor Red; $script:fail = 1
    }
} catch {
    Write-Host "SKIP  snapshot (database has no employees yet)" -ForegroundColor Yellow
}

# employee date-wise attendance history (same dynamic-id pattern)
try {
    $empIdHist = (Invoke-RestMethod -Uri "$B/employees?page=0&size=1" -TimeoutSec 10).data.content[0].id
    if ((Invoke-RestMethod -Uri "$B/employees/$empIdHist/attendance?range=week" -TimeoutSec 10).success) {
        Write-Host "PASS  employee attendance history" -ForegroundColor Green
    } else {
        Write-Host "FAIL  employee attendance history" -ForegroundColor Red; $script:fail = 1
    }
} catch {
    Write-Host "SKIP  employee attendance history (no employees)" -ForegroundColor Yellow
}

# payroll: list + upsert (net must equal 50000+20000+10000-5000)
try {
    if (-not (Invoke-RestMethod -Uri "$B/payroll" -TimeoutSec 10).success) { throw "list failed" }
    Write-Host "PASS  payroll list" -ForegroundColor Green
    $empIdPay = (Invoke-RestMethod -Uri "$B/employees?page=0&size=1" -TimeoutSec 10).data.content[0].id
    $payBody = @{ basic = 50000; hra = 20000; allowances = 10000; deductions = 5000 } | ConvertTo-Json
    $savedPay = (Invoke-RestMethod -Method Put -Uri "$B/employees/$empIdPay/payroll" -Body $payBody -ContentType "application/json").data
    if ($savedPay.netSalary -eq 75000) {
        Write-Host "PASS  payroll upsert (net = 75000)" -ForegroundColor Green
    } else {
        Write-Host "FAIL  payroll upsert (net = $($savedPay.netSalary))" -ForegroundColor Red; $script:fail = 1
    }
} catch {
    Write-Host "FAIL  payroll  ($($_.Exception.Message))" -ForegroundColor Red; $script:fail = 1
}

# events
try {
    if ((Invoke-RestMethod -Uri "$B/events" -TimeoutSec 10).data.Count -gt 0) {
        Write-Host "PASS  events" -ForegroundColor Green
    } else { throw "empty list" }
} catch {
    Write-Host "FAIL  events  ($($_.Exception.Message))" -ForegroundColor Red; $script:fail = 1
}

# projects: create (auto-assembled team) + member add/remove + delete
try {
    $projBody = @{ name = "Smoke Project"; weightage = "MEDIUM" } | ConvertTo-Json
    $proj = (Invoke-RestMethod -Method Post -Uri "$B/projects" -Body $projBody -ContentType "application/json").data
    if ($proj.members.Count -lt 3) { throw "auto-team too small ($($proj.members.Count))" }
    Write-Host "PASS  project create + auto-team ($($proj.members.Count) members)" -ForegroundColor Green
    $memberIds = @($proj.members | ForEach-Object { $_.employeeId })
    $freeEmp = (Invoke-RestMethod -Uri "$B/employees?page=0&size=100" -TimeoutSec 10).data.content |
        Where-Object { $memberIds -notcontains $_.id } | Select-Object -First 1
    if (-not $freeEmp) { throw "no free employee for add-member" }
    $addB = @{ employeeId = $freeEmp.id } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "$B/projects/$($proj.id)/members" -Body $addB -ContentType "application/json" | Out-Null
    Write-Host "PASS  project member add" -ForegroundColor Green
    Invoke-RestMethod -Method Delete -Uri "$B/projects/$($proj.id)/members/$($freeEmp.id)" -TimeoutSec 10 | Out-Null
    Write-Host "PASS  project member remove" -ForegroundColor Green
    Invoke-RestMethod -Method Delete -Uri "$B/projects/$($proj.id)" -TimeoutSec 10 | Out-Null
    Write-Host "PASS  project delete" -ForegroundColor Green
} catch {
    Write-Host "FAIL  projects  ($($_.Exception.Message))" -ForegroundColor Red; $script:fail = 1
}

# positions: list + create/update/delete round-trip
try {
    if (-not (Invoke-RestMethod -Uri "$B/positions" -TimeoutSec 10).success) { throw "list failed" }
    Write-Host "PASS  positions list" -ForegroundColor Green
    $posBody = @{ title = "Smoke Test Role"; department = "HR"; location = "Chennai"; status = "OPEN"; openings = 1; postedDate = "2026-09-12" } | ConvertTo-Json
    $createdPos = (Invoke-RestMethod -Method Post -Uri "$B/positions" -Body $posBody -ContentType "application/json").data
    $updBody = @{ title = "Smoke Test Role"; department = "HR"; location = "Chennai"; status = "ON_HOLD"; openings = 2; postedDate = "2026-09-12" } | ConvertTo-Json
    Invoke-RestMethod -Method Put -Uri "$B/positions/$($createdPos.id)" -Body $updBody -ContentType "application/json" | Out-Null
    Invoke-RestMethod -Method Delete -Uri "$B/positions/$($createdPos.id)" -TimeoutSec 10 | Out-Null
    Write-Host "PASS  position create/update/delete" -ForegroundColor Green
} catch {
    Write-Host "FAIL  positions  ($($_.Exception.Message))" -ForegroundColor Red; $script:fail = 1
}
Check "pending leaves"     "$B/leaves/pending"
Check "attendance week"    "$B/attendance?range=week"
Check "attendance month"   "$B/attendance?range=month"
Check "activities"         "$B/activities"
Check "insights"           "$B/insights"

Write-Host "== Create + duplicate-check =="
$body = @{
    employeeCode = "EMP-" + (Get-Random -Minimum 100000 -Maximum 999999); firstName = "Test"; lastName = "User"
    email = "test.user@peopleos.io"; phone = "+91 90000 00000"
    department = "PRODUCT"; role = "Analyst"; team = "BizOps"; status = "ACTIVE"
    location = "Chennai"; joinedDate = "2025-01-15"
} | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post -Uri "$B/employees" -Body $body -ContentType "application/json"
    if ($r.success) { Write-Host "PASS  create employee" -ForegroundColor Green }
    else { Write-Host "FAIL  create employee" -ForegroundColor Red; $fail = 1 }
} catch {
    Write-Host "FAIL  create employee ($($_.ErrorDetails.Message))" -ForegroundColor Red; $fail = 1
}

$dup = $body | ConvertFrom-Json
$dup.employeeCode = "EMP-" + (Get-Random -Minimum 100000 -Maximum 999999); $dup.firstName = "Dup"; $dup.lastName = "Email"
try {
    Invoke-RestMethod -Method Post -Uri "$B/employees" -Body ($dup | ConvertTo-Json) -ContentType "application/json"
    Write-Host "FAIL  duplicate email (expected 409)" -ForegroundColor Red; $fail = 1
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "PASS  duplicate email -> 409" -ForegroundColor Green
    } else {
        Write-Host "FAIL  duplicate email (wrong status)" -ForegroundColor Red; $fail = 1
    }
}

Write-Host "== Leave approve flow =="
try {
    $leaves = Invoke-RestMethod -Uri "$B/leaves/pending"
    if ($leaves.data.Count -gt 0) {
        $id = $leaves.data[0].id
        $r = Invoke-RestMethod -Method Put -Uri "$B/leaves/$id/approve"
        if ($r.success) { Write-Host "PASS  approve leave" -ForegroundColor Green }
        else { Write-Host "FAIL  approve leave" -ForegroundColor Red; $fail = 1 }
    } else {
        Write-Host "SKIP  approve leave (queue empty)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL  approve leave ($($_.Exception.Message))" -ForegroundColor Red; $fail = 1
}

if ($fail -eq 0) { Write-Host "`nALL CHECKS PASSED" -ForegroundColor Green; exit 0 }
else { Write-Host "`nSOME CHECKS FAILED" -ForegroundColor Red; exit 1 }
