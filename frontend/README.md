# PeopleOS Frontend

React (Vite) SPA for the PeopleOS workforce dashboard.

```bash
cp .env.example .env
npm install
npm run dev
```

Reads the API base URL from `VITE_API_BASE_URL` (defaults to `http://localhost:8080/api/v1`).

## Structure

```
src/
├── main.jsx / App.jsx
├── styles.css              # glassmorphism design system + responsive rules
├── state/AppContext.jsx    # global reactive state (reducer + service actions)
├── services/               # api client + employee/leave/attendance/dashboard/activity services
└── components/             # Sidebar, Topbar, KpiCard, EmployeeDirectory, ProfileDrawer,
                            # AddEmployeeModal, LeaveRequests, AttendanceChart,
                            # DepartmentDistribution, ActivityFeed, Insights, Toasts, ...
```

Every reactive flow in the PRD is implemented: create → refresh list + KPIs; leave action →
remove from queue + update counts + activity; search/filters → debounced refetch; week/month →
chart swap; employee select → snapshot fetch → drawer.
