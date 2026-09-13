package com.peopleos.config;

import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.entity.ActivityType;
import com.peopleos.activity.repository.ActivityRepository;
import com.peopleos.attendance.entity.Attendance;
import com.peopleos.attendance.entity.AttendanceStatus;
import com.peopleos.attendance.repository.AttendanceRepository;
import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.entity.EmployeeStatus;
import com.peopleos.employee.repository.EmployeeRepository;
import com.peopleos.leave.entity.LeaveRequest;
import com.peopleos.leave.entity.LeaveStatus;
import com.peopleos.leave.entity.LeaveType;
import com.peopleos.leave.repository.LeaveRequestRepository;
import com.peopleos.position.entity.Position;
import com.peopleos.position.entity.PositionStatus;
import com.peopleos.payroll.entity.Payroll;
import com.peopleos.payroll.repository.PayrollRepository;
import com.peopleos.position.repository.PositionRepository;
import com.peopleos.project.dto.ProjectRequest;
import com.peopleos.project.entity.ProjectWeightage;
import com.peopleos.project.service.ProjectService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/**
 * Seeds a realistic demo dataset — only active with the "dev" profile (H2).
 */
@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final ActivityRepository activityRepository;
    private final PositionRepository positionRepository;
    private final PayrollRepository payrollRepository;
    private final ProjectService projectService;
    private final Random random = new Random(42);

    public DataSeeder(EmployeeRepository employeeRepository,
                      LeaveRequestRepository leaveRequestRepository,
                      AttendanceRepository attendanceRepository,
                      ActivityRepository activityRepository,
                      PositionRepository positionRepository,
                      PayrollRepository payrollRepository,
                      ProjectService projectService) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.attendanceRepository = attendanceRepository;
        this.activityRepository = activityRepository;
        this.positionRepository = positionRepository;
        this.payrollRepository = payrollRepository;
        this.projectService = projectService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (employeeRepository.count() > 0) return;

        LocalDate today = LocalDate.now();

        // ---------- Employees: 100 total (2 anchors + 98 generated, deterministic) ----------
        String[] firstNames = {
                "Arjun", "Priya", "Rahul", "Sneha", "Vikram", "Ananya", "Karthik", "Divya", "Rohan", "Aisha",
                "Sanjay", "Meera", "Aditya", "Kavya", "Nitin", "Ishita", "Varun", "Neha", "Farhan", "Tara",
                "Manoj", "Ritu", "Saurabh", "Lakshmi", "Amit", "Pooja", "Rajesh", "Nisha", "Deepak", "Shruti",
                "Alok", "Anjali", "Gaurav", "Swati", "Harish", "Tanvi", "Imran", "Vandana", "Jatin", "Yamini",
                "Kiran", "Asha", "Mohan", "Celina", "Dev", "Esha", "Firoz", "Gita", "Hemant", "Ila",
                "Jay", "Kajal", "Lokesh", "Madhu"
        };
        String[] lastNames = {
                "Kumar", "Sharma", "Verma", "Patel", "Singh", "Iyer", "Rao", "Mehta", "Khan", "Gupta",
                "Nair", "Joshi", "Reddy", "Malhotra", "Bose", "Chandran", "Kulkarni", "Ali", "Desai", "Pillai",
                "Agarwal", "Mishra", "Venkat", "Das", "Choudhary", "Menon", "Sinha", "Bhatt", "Kaur", "Saxena",
                "Thomas", "George"
        };
        String[] locationsPool = {"Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Pune", "Kochi", "Remote"};

        // department mix across 100: ENG 34, PRODUCT 12, DESIGN 10, SALES 14, MARKETING 10, HR 8, OPS 12
        List<Department> slots = new ArrayList<>();
        for (int i = 0; i < 34; i++) slots.add(Department.ENGINEERING);
        for (int i = 0; i < 12; i++) slots.add(Department.PRODUCT);
        for (int i = 0; i < 10; i++) slots.add(Department.DESIGN);
        for (int i = 0; i < 14; i++) slots.add(Department.SALES);
        for (int i = 0; i < 10; i++) slots.add(Department.MARKETING);
        for (int i = 0; i < 8; i++) slots.add(Department.HR);
        for (int i = 0; i < 12; i++) slots.add(Department.OPERATIONS);
        Collections.shuffle(slots, random);

        List<Employee> employees = new ArrayList<>();
        Set<String> emails = new HashSet<>();

        // anchors: keep verify.ps1 / demo references ("arjun", "priya sharma") resolvable
        Employee arjun = buildEmployee("EMP-001", "Arjun", "Kumar", Department.ENGINEERING,
                "Engineering Manager", EmployeeStatus.ACTIVE, "Chennai", "Platform",
                today.minusMonths(26), emails);
        Employee priya = buildEmployee("EMP-002", "Priya", "Sharma", Department.ENGINEERING,
                "Software Engineer", EmployeeStatus.ACTIVE, "Chennai", "Platform",
                today.minusMonths(18), emails);
        priya.setManager(arjun);
        employees.add(arjun);
        employees.add(priya);

        int code = 3;
        for (int i = 2; i < 100; i++) {
            Department dept = slots.get(i);
            String fn = firstNames[random.nextInt(firstNames.length)];
            String ln = lastNames[random.nextInt(lastNames.length)];
            String[] roles = rolesFor(dept);
            EmployeeStatus status = randomStatus();
            String location = locationsPool[random.nextInt(locationsPool.length)];
            if (status == EmployeeStatus.REMOTE) location = "Remote";
            LocalDate joined = today.minusMonths(1 + random.nextInt(58));
            Employee e = buildEmployee(String.format("EMP-%03d", code++), fn, ln, dept,
                    roles[random.nextInt(roles.length)], status, location,
                    teamFor(dept, random), joined, emails);
            employees.add(e);
        }

        // managers: first manager-ish employee per department manages its teammates
        Map<Department, Employee> managers = new EnumMap<>(Department.class);
        for (Employee e : employees) {
            String r = e.getRole();
            if (r.contains("Manager") || r.contains("Lead") || r.contains("Director")) {
                managers.putIfAbsent(e.getDepartment(), e);
            }
        }
        managers.putIfAbsent(Department.ENGINEERING, arjun);
        for (Employee e : employees) {
            if (e.getManager() == null && managers.containsKey(e.getDepartment())
                    && !managers.get(e.getDepartment()).equals(e)) {
                e.setManager(managers.get(e.getDepartment()));
            }
        }
        employeeRepository.saveAll(employees);

        // ---------- Leave requests ----------
        List<LeaveRequest> leaves = new ArrayList<>();

        // Every ON_LEAVE employee has an APPROVED leave covering today (consistent KPIs)
        for (Employee e : employees) {
            if (e.getStatus() == EmployeeStatus.ON_LEAVE) {
                LocalDate start = today.minusDays(1 + random.nextInt(3));
                LocalDate end = today.plusDays(1 + random.nextInt(4));
                leaves.add(new LeaveRequest(e, LeaveType.CASUAL, start, end, LeaveStatus.APPROVED));
            }
        }

        // Approved past leaves for 10 random working employees
        Set<Integer> picked = new HashSet<>();
        while (picked.size() < 10) {
            int idx = random.nextInt(employees.size());
            Employee e = employees.get(idx);
            if (picked.contains(idx) || e.getStatus() == EmployeeStatus.INACTIVE) continue;
            picked.add(idx);
            LocalDate start = today.minusDays(15 + random.nextInt(70));
            LocalDate end = start.plusDays(1 + random.nextInt(5));
            leaves.add(new LeaveRequest(e, LeaveType.values()[random.nextInt(LeaveType.values().length)],
                    start, end, LeaveStatus.APPROVED));
        }

        // Pending queue: 8 future requests (HR approve/reject demo)
        picked.clear();
        while (picked.size() < 8) {
            int idx = random.nextInt(employees.size());
            Employee e = employees.get(idx);
            if (picked.contains(idx) || e.getStatus() == EmployeeStatus.INACTIVE) continue;
            picked.add(idx);
            LocalDate start = today.plusDays(1 + random.nextInt(14));
            LocalDate end = start.plusDays(random.nextInt(5));
            leaves.add(new LeaveRequest(e, LeaveType.values()[random.nextInt(LeaveType.values().length)],
                    start, end, LeaveStatus.PENDING));
        }

        // A few rejected for realism
        picked.clear();
        while (picked.size() < 3) {
            int idx = random.nextInt(employees.size());
            if (picked.contains(idx)) continue;
            picked.add(idx);
            LocalDate start = today.minusDays(3 + random.nextInt(10));
            leaves.add(new LeaveRequest(employees.get(idx), LeaveType.CASUAL,
                    start, start.plusDays(1 + random.nextInt(2)), LeaveStatus.REJECTED));
        }
        leaveRequestRepository.saveAll(leaves);

        // ---------- Attendance: last 30 days ----------
        List<Attendance> attendance = new ArrayList<>();
        for (int offset = 29; offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);
            for (Employee e : employees) {
                if (e.getStatus() == EmployeeStatus.INACTIVE) continue;
                attendance.add(new Attendance(e, date, weightedStatus()));
            }
        }
        // Make today's snapshot consistent with statuses.
        attendance.removeIf(a -> a.getDate().equals(today));
        for (Employee e : employees) {
            if (e.getStatus() == EmployeeStatus.INACTIVE) continue;
            switch (e.getStatus()) {
                case REMOTE -> attendance.add(new Attendance(e, today, AttendanceStatus.REMOTE));
                case ON_LEAVE -> attendance.add(new Attendance(e, today, AttendanceStatus.ABSENT));
                default -> attendance.add(new Attendance(e, today,
                        random.nextInt(10) == 0 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT));
            }
        }
        attendanceRepository.saveAll(attendance);

        // ---------- Positions ----------
        positionRepository.saveAll(List.of(
                new Position("Senior Backend Engineer", Department.ENGINEERING, "Bangalore", PositionStatus.OPEN, 2, today.minusDays(12), "Java 17, Spring Boot, microservices"),
                new Position("Product Designer", Department.DESIGN, "Remote", PositionStatus.OPEN, 1, today.minusDays(9), "Figma, design systems"),
                new Position("Sales Executive", Department.SALES, "Chennai", PositionStatus.OPEN, 3, today.minusDays(20), "B2B SaaS sales experience"),
                new Position("DevOps Engineer", Department.ENGINEERING, "Hyderabad", PositionStatus.OPEN, 1, today.minusDays(5), "AWS, Kubernetes, CI/CD"),
                new Position("HR Intern", Department.HR, "Mumbai", PositionStatus.ON_HOLD, 1, today.minusDays(15), "6-month paid internship"),
                new Position("Marketing Specialist", Department.MARKETING, "Kochi", PositionStatus.FILLED, 1, today.minusDays(40), "Filled internally"),
                new Position("Data Analyst", Department.PRODUCT, "Pune", PositionStatus.CLOSED, 1, today.minusDays(60), "Role closed after reorg")
        ));

        // ---------- Payroll (monthly, INR; skipped for inactive employees) ----------
        List<Payroll> payrolls = new ArrayList<>();
        for (Employee e : employees) {
            if (e.getStatus() == EmployeeStatus.INACTIVE) continue;
            long base = 38000 + random.nextInt(82000);
            String r = e.getRole();
            if (r.contains("Director")) base += 60000;
            else if (r.contains("Manager") || r.contains("Lead")) base += 30000;
            else if (r.contains("Staff") || r.contains("Senior")) base += 15000;
            Payroll p = new Payroll();
            p.setEmployee(e);
            p.setBasic((base / 100) * 100);
            p.setHra(Math.round(base * 0.40f) / 100 * 100);
            p.setAllowances((8000 + random.nextInt(18000)) / 100 * 100);
            p.setDeductions((4000 + random.nextInt(11000)) / 100 * 100);
            payrolls.add(p);
        }
        payrollRepository.saveAll(payrolls);

        // ---------- Projects (auto-assembled teams via the service) ----------
        projectService.create(new ProjectRequest("PeopleOS Mobile App", ProjectWeightage.MEDIUM));
        projectService.create(new ProjectRequest("Data Platform Migration", ProjectWeightage.HIGH));

        // ---------- Activities ----------
        List<Activity> activities = List.of(
                new Activity(employees.get(13), ActivityType.PROFILE_UPDATED, "Profile updated for Kavya Reddy"),
                new Activity(employees.get(10), ActivityType.LEAVE_APPROVED, "Leave approved for Sanjay Gupta (CASUAL, 3d)"),
                new Activity(employees.get(2), ActivityType.ATTENDANCE_RECORDED, "Attendance recorded for Rahul Verma — remote"),
                new Activity(employees.get(23), ActivityType.EMPLOYEE_ADDED, "Added employee Lakshmi Venkat (EMP-024)"),
                new Activity(employees.get(15), ActivityType.LEAVE_REJECTED, "Leave rejected for Ishita Bose (CASUAL, 2d)"),
                new Activity(employees.get(0), ActivityType.ATTENDANCE_RECORDED, "Arjun Kumar checked in at 9:02 AM")
        );
        activityRepository.saveAll(activities);
    }

    private Employee buildEmployee(String code, String firstName, String lastName, Department dept,
                                   String role, EmployeeStatus status, String location, String team,
                                   LocalDate joined, Set<String> emails) {
        String base = firstName.toLowerCase() + "." + lastName.toLowerCase();
        String email = base + "@peopleos.io";
        int suffix = 2;
        while (!emails.add(email)) {
            email = base + (suffix++) + "@peopleos.io";
        }
        int n = Integer.parseInt(code.split("-")[1]);
        Employee e = new Employee();
        e.setEmployeeCode(code);
        e.setFirstName(firstName);
        e.setLastName(lastName);
        e.setEmail(email);
        e.setPhone("+91 98" + String.format("%08d", 10000000 + n * 7919 % 90000000));
        e.setDepartment(dept);
        e.setRole(role);
        e.setTeam(team);
        e.setStatus(status);
        e.setLocation(location);
        e.setJoinedDate(joined);
        return e;
    }

    private String[] rolesFor(Department d) {
        return switch (d) {
            case ENGINEERING -> new String[]{"Software Engineer", "Senior Software Engineer", "Staff Engineer",
                    "Frontend Engineer", "Backend Engineer", "QA Engineer", "DevOps Engineer", "Data Engineer",
                    "Engineering Manager"};
            case PRODUCT -> new String[]{"Product Manager", "Product Analyst", "Business Analyst", "Product Lead"};
            case DESIGN -> new String[]{"Product Designer", "UX Researcher", "UI Designer", "Design Lead"};
            case SALES -> new String[]{"Account Executive", "Sales Associate", "Sales Director", "SDR"};
            case MARKETING -> new String[]{"Content Strategist", "Performance Marketer", "Marketing Lead",
                    "SEO Specialist"};
            case HR -> new String[]{"HR Business Partner", "Recruiter", "People Ops Specialist", "HR Generalist"};
            case OPERATIONS -> new String[]{"Operations Manager", "Logistics Coordinator", "Ops Analyst",
                    "Facilities Executive"};
        };
    }

    private String teamFor(Department d, Random r) {
        return switch (d) {
            case ENGINEERING -> new String[]{"Platform", "Core Services", "Mobile"}[r.nextInt(3)];
            case PRODUCT -> "Product & Growth";
            case DESIGN -> "Design Studio";
            case SALES -> "Revenue";
            case MARKETING -> "Go-To-Market";
            case HR -> "People Ops";
            case OPERATIONS -> "BizOps";
        };
    }

    private EmployeeStatus randomStatus() {
        int roll = random.nextInt(100);
        if (roll < 65) return EmployeeStatus.ACTIVE;   // 65% working on-site
        if (roll < 80) return EmployeeStatus.REMOTE;   // 15% working remotely
        if (roll < 90) return EmployeeStatus.ON_LEAVE; // 10% on approved leave
        return EmployeeStatus.INACTIVE;                // 10% inactive
    }

    private AttendanceStatus weightedStatus() {
        int roll = random.nextInt(100);
        if (roll < 62) return AttendanceStatus.PRESENT;
        if (roll < 76) return AttendanceStatus.REMOTE;
        if (roll < 82) return AttendanceStatus.LATE;
        return AttendanceStatus.ABSENT;
    }
}
