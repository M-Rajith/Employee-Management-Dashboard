package com.peopleos.dashboard.service;

import com.peopleos.attendance.entity.Attendance;
import com.peopleos.attendance.entity.AttendanceStatus;
import com.peopleos.attendance.repository.AttendanceRepository;
import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.entity.EmployeeStatus;
import com.peopleos.employee.repository.EmployeeRepository;
import com.peopleos.leave.entity.LeaveStatus;
import com.peopleos.leave.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Rule-based People Insights — derived from application data, no external AI.
 */
@Service
public class InsightsService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public InsightsService(AttendanceRepository attendanceRepository,
                           EmployeeRepository employeeRepository,
                           LeaveRequestRepository leaveRequestRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Transactional(readOnly = true)
    public List<String> generate() {
        List<String> insights = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. Department with the highest remote workforce this week.
        Map<Department, Long> remoteByDept = attendanceRepository
                .findByDateGreaterThanEqual(today.minusDays(7)).stream()
                .filter(a -> a.getStatus() == AttendanceStatus.REMOTE)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getDepartment(), Collectors.counting()));
        remoteByDept.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(e -> insights.add(pretty(e.getKey()) + " has the highest remote workforce this week (" + e.getValue() + " remote days)."));

        // 2. Attendance this week vs last week.
        double thisWeek = attendanceRate(today.minusDays(7), today);
        double lastWeek = attendanceRate(today.minusDays(14), today.minusDays(7));
        if (thisWeek > 0 && lastWeek > 0) {
            double diff = Math.round((thisWeek - lastWeek) * 10) / 10.0;
            if (Math.abs(diff) >= 1) {
                insights.add("Attendance is " + Math.abs(diff) + "% " + (diff < 0 ? "lower" : "higher") + " than last week.");
            }
        }

        // 3. Department with the lowest leave utilization.
        Map<Department, Long> headcount = employeeRepository.countByDepartment().stream()
                .collect(Collectors.toMap(row -> (Department) row[0], row -> (Long) row[1]));
        int year = today.getYear();
        Map<Department, Integer> leaveDaysByDept = leaveRequestRepository
                .findByStatusOrderByCreatedAtDesc(LeaveStatus.APPROVED).stream()
                .filter(l -> l.getStartDate().getYear() == year)
                .collect(Collectors.groupingBy(
                        l -> l.getEmployee().getDepartment(),
                        Collectors.summingInt(l -> l.getDuration())));
        headcount.keySet().stream()
                .min(Comparator.comparingDouble(d ->
                        leaveDaysByDept.getOrDefault(d, 0) / (double) headcount.getOrDefault(d, 1L)))
                .ifPresent(d -> insights.add(pretty(d) + " has the lowest leave utilization this year."));

        // 4. Live remote count.
        long remoteToday = attendanceRepository.findByDateGreaterThanEqual(today).stream()
                .filter(a -> a.getDate().equals(today) && a.getStatus() == AttendanceStatus.REMOTE)
                .count();
        if (remoteToday > 0) {
            insights.add(remoteToday + " " + (remoteToday == 1 ? "employee is" : "employees are") + " currently working remotely.");
        }

        // 5. Workforce health nudge.
        long onLeave = employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE);
        if (onLeave > 0) {
            insights.add(onLeave + " " + (onLeave == 1 ? "employee is" : "employees are") + " on approved leave today — plan coverage accordingly.");
        }

        return insights.stream().filter(Objects::nonNull).limit(5).toList();
    }

    /** Percentage of attendance records marked present/remote/late within [start, end). */
    private double attendanceRate(LocalDate start, LocalDate end) {
        List<Attendance> records = attendanceRepository.findByDateGreaterThanEqual(start).stream()
                .filter(a -> !a.getDate().isBefore(start) && a.getDate().isBefore(end))
                .toList();
        if (records.isEmpty()) return 0;
        long attended = records.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
        return Math.round((attended * 1000.0 / records.size())) / 10.0;
    }

    private String pretty(Department d) {
        String lower = d.name().toLowerCase();
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
